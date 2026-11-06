import Link from "next/link";
import { EnquiryForm } from "@/components/portal/portal-forms";
import { PortalPageHeader, PortalStatusBadge, formatPortalDate, formatPortalDateTime } from "@/components/portal/portal-ui";
import { requirePortalUser } from "@/lib/portal/auth";
import { getActiveUsers, getEnquiries } from "@/lib/portal/queries";

export const runtime = "nodejs";

export default async function PortalEnquiriesPage({ searchParams }: { searchParams: Promise<{ saved?: string; q?: string; status?: string }> }) {
  await requirePortalUser(["owner", "manager", "staff"]);
  const params = await searchParams;
  const enquiries = getEnquiries({ search: params.q, status: params.status });
  const users = getActiveUsers().filter((user) => user.isActive);

  return (
    <div className="space-y-6">
      <PortalPageHeader eyebrow="Lead management" title="Enquiries" description="Log phone calls, WhatsApp requests, walk-ins, and website leads quickly, then keep the follow-up history connected to the customer." />
      {params.saved === "enquiry" ? <p className="rounded-xl border border-brand-blue/20 bg-brand-blue/[0.06] px-4 py-3 text-sm text-brand-blue">Enquiry saved successfully.</p> : null}

      <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <section className="surface-card p-5 sm:p-7">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-blue">Quick entry</p>
          <h2 className="mt-2 font-heading text-2xl tracking-tight text-ink">New enquiry</h2>
          <p className="mt-2 text-sm leading-6 copy-muted">Minimal details are enough to save the lead. More customer and survey information can be added later.</p>
          <div className="mt-5"><EnquiryForm users={users} /></div>
        </section>

        <section className="surface-card min-w-0 p-5 sm:p-7">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-blue">Pipeline</p>
              <h2 className="mt-2 font-heading text-2xl tracking-tight text-ink">{enquiries.length} enquiries</h2>
            </div>
          </div>
          <form method="get" className="mt-5 grid gap-3 sm:grid-cols-[1fr_12rem_auto]">
            <input name="q" defaultValue={params.q ?? ""} placeholder="Search reference, customer, phone, area" className="h-11 rounded-xl border border-line bg-white px-3 text-sm outline-none focus:border-brand-blue" />
            <select name="status" defaultValue={params.status ?? ""} className="h-11 rounded-xl border border-line bg-white px-3 text-sm outline-none focus:border-brand-blue">
              <option value="">All statuses</option><option value="new">New</option><option value="contacted">Contacted</option><option value="survey-required">Survey required</option><option value="quotation-in-progress">Quotation in progress</option><option value="converted">Converted</option><option value="lost">Lost</option>
            </select>
            <button type="submit" className="action-secondary">Filter</button>
          </form>
          {enquiries.length ? (
            <div className="mt-5 space-y-3">
              {enquiries.map((enquiry) => (
                <article key={enquiry.id} className="rounded-xl border border-line bg-white p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-blue"><Link href={`/portal/enquiries/${enquiry.id}`} className="hover:underline">{enquiry.reference}</Link></p>
                      <h3 className="mt-1 font-heading text-xl text-ink"><Link href={`/portal/enquiries/${enquiry.id}`} className="hover:text-brand-blue">{enquiry.customerName}</Link></h3>
                      <p className="mt-1 text-sm copy-muted">{enquiry.customerPhone} · {enquiry.type.replaceAll("-", " ")} · {enquiry.source}</p>
                    </div>
                    <PortalStatusBadge value={enquiry.status} />
                  </div>
                  <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm copy-muted">
                    {enquiry.area ? <span>{enquiry.area}</span> : null}
                    <span>Follow-up: {formatPortalDate(enquiry.followUpAt)}</span>
                    {enquiry.assignedToName ? <span>Assigned: {enquiry.assignedToName}</span> : null}
                  </div>
                  {enquiry.notes ? <p className="mt-3 border-t border-line pt-3 text-sm leading-6 text-ink">{enquiry.notes}</p> : null}
                  <p className="mt-3 text-xs copy-muted">Created {formatPortalDateTime(enquiry.createdAt)}</p>
                  <Link href={`/portal/enquiries/${enquiry.id}`} className="mt-4 inline-flex text-sm font-semibold text-brand-blue hover:underline">Open enquiry record</Link>
                </article>
              ))}
            </div>
          ) : <p className="mt-6 rounded-xl border border-dashed border-line px-4 py-8 text-center text-sm copy-muted">No enquiries recorded yet.</p>}
        </section>
      </div>
    </div>
  );
}
