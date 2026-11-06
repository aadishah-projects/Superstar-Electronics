# Phase 1 portal setup

The public website remains unchanged. The portal is a new, isolated area under the same Next.js project:

- `/portal/login` — staff and owner sign-in
- `/portal/setup` — one-time local bootstrap for the first owner
- `/portal/dashboard` — real database-backed overview
- `/portal/customers` — customer records
- `/portal/customers/<id>` — customer detail, editing, and activity history
- `/portal/enquiries` — quick enquiry registration and follow-up tracking
- `/portal/enquiries/<id>` — enquiry detail, assignment, status updates, and activity history
- `/portal/projects` — project records and workflow stages
- `/portal/projects/<id>` — project detail, stage updates, payment corrections, printable project/handover record, and activity history
- `/portal/quotations` — quotation creation with searchable visual catalog selection, custom lines, VAT breakdown, and validity
- `/portal/products` — owner-only product catalog management, publication/availability controls, and price history
- `/portal/products/<id>` — product editing and price audit history
- `/portal/quotations/<id>` — quotation snapshot, status, and activity history
- `/portal/tickets` — internal support ticket queue
- `/portal/tickets/<id>` — ticket details, assignment, status, customer-visible updates, private notes, and authorized attachments
- `/portal/jobs` — technician job creation, dispatch queue, and technician acceptance
- `/portal/jobs/<id>` — job details, first-valid-acceptance dispatch, assignment history, completion review, and point award
- `/portal/points` — SS Points rules, append-only ledger, technician balances, and owner adjustments
- `/portal/rewards` — reward catalogue, stock, point costs, and technician requests
- `/portal/redemptions` — owner approval and collection status for reward requests
- `/portal/schedule` — surveys, installations, and service visits with assignment, conflict checks, and rescheduling history
- `/portal/reports` — date-filtered operational summaries
- `/portal/team` — owner-only account invitations
- `/portal/invite/<token>` — secure one-time account activation
- `/support` — public support request form and secure ticket-status entry point
- `/support/status` — temporary customer ticket-status view

## Local setup

1. Copy `.env.example` to `.env.local`.
2. Replace `PORTAL_BOOTSTRAP_KEY` with a long random value.
3. Run `npm install` and then `npm run dev`.
4. Open `/portal/setup` and use the configured owner email and bootstrap key to create the first owner account.
5. Sign in at `/portal/login`.

The local development database is a SQLite file at `data/portal.sqlite`, which is ignored by Git. It is intended only for local development. Do not deploy this SQLite storage to Vercel as production storage; a managed persistent database and private object storage must be configured before production deployment.

Owners can invite additional owners, staff, and technicians from `/portal/team`. An optional WhatsApp/phone number is stored with invited team members, and every signed-in user can maintain their own number from the dashboard. The invite link is shown once in the owner interface because no email provider has been configured yet. Share invite links securely.

## Current scope

Phase 1 provides the authenticated foundation, role permissions, customers, enquiries, projects, follow-up dates, overdue follow-up alerts, search and filtering, site surveys, map coordinates, editable detail records, status updates, activity history, installed-equipment handover records, searchable visual catalog selection for quotations, custom quotation lines, VAT breakdowns, manual payment recording, audited payment refunds/reversals, one-year project warranty dates, support tickets, customer-visible ticket updates, secure customer status access, private attachments, scheduling, conflict checks, rescheduling history, printable project/handover records, and date-filtered operational reports. Owners and staff can maintain customer, enquiry, project, installed-equipment, quotation, payment, and support-ticket records. Technicians can view projects and only the support tickets assigned to them. A new public ticket creates an in-portal notification for active owners; assigning it to a technician creates an in-portal notification for that technician. Quotation and project detail pages can be printed or saved as PDF from the browser.

Quotation line prices are stored before VAT, with the VAT rate configurable through `PORTAL_VAT_RATE` and the default validity through `PORTAL_QUOTATION_VALIDITY_DAYS`. The current defaults are 13% and 3 days; confirm the tax rate with the business/accountant before production use. Payments currently record Fonepay QR, eSewa, or cash manually; gateway verification is not connected. Warranty duration defaults to 12 months through `PORTAL_WARRANTY_MONTHS` and starts when a completed project receives a warranty start date. Support tickets keep in-portal notifications as the source of truth; ticket pages now offer manual WhatsApp handoff links when a customer or technician number is available. Automatic SMS/WhatsApp delivery still requires a selected provider and credentials.

In-app ticket notifications are active locally. Email delivery is provider-ready but disabled by default; enable it only after choosing a provider and setting server-side `PORTAL_EMAIL_MODE`, `PORTAL_EMAIL_FROM`, and `PORTAL_EMAIL_API_KEY`. SMS and official WhatsApp delivery, inventory, and gateway payment verification remain later phases because no provider credentials or production integrations have been supplied. The quotation picker reads the existing static public catalog by default and stores the selected description and price as a quotation snapshot. Idea 2 adds an owner-only managed product catalog in the local portal database, including integer-paisa pricing, publication/availability states, contact-for-price mode, legacy IDs, image/source fields, and price history. Set `PORTAL_CATALOG_SOURCE=database` only in a separate staging environment after reviewing the migration; the default `static` value preserves the current public catalog.

For isolated Idea 2 staging, use a separate database and build directory, for example: `PORTAL_DATABASE_PATH=data/portal-idea2.sqlite`, `PORTAL_CATALOG_SOURCE=database`, `NEXT_DIST_DIR=.next-idea2`, and a separate local port. The first staging request imports the existing merged catalog into the managed table without changing the original `data/portal.sqlite` file. New images currently use the existing image path/URL convention; managed upload storage is still a follow-up before production use.

## Idea 3 — technician dispatch and SS Rewards

Idea 3 adds a local technician work queue under `/portal/jobs`. Owners and staff create a draft job, then broadcast it to active technicians. The acceptance update is conditional inside a SQLite transaction, so only the first valid acceptance can claim an open job. Other recipients receive an in-portal notification that the job was taken. Owners/staff can also assign a technician manually and retain assignment/status history.

Technicians submit a completion summary, camera quantity when applicable, work notes, and materials used. Owners or staff verify or return the submission. Verified CCTV installation work awards 100 SS Points per completed camera for that customer/job through an idempotent ledger key, so repeating the review cannot award points twice. The other seeded bonus rules remain samples until management confirms them. Every priced EZVIZ camera in the managed catalogue is available as a reward with a point cost equal to its current NPR amount; stock starts at one and remains owner-managed. Owners can edit rules, post documented manual adjustments, manage rewards and stock, and approve redemptions. Approval rechecks current stock and balance in a transaction, decrements stock, and records the points deduction in the ledger.

Notifications are currently in-portal only. SMS and official WhatsApp delivery remain provider-dependent and are not enabled by this local phase. Job evidence upload is private in local storage for this phase; production use still requires reviewed private object storage and retention controls. Use a separate local database for testing, for example `PORTAL_DATABASE_PATH=data/portal-idea3.sqlite`, and do not connect the Idea 3 test server to production data.
