import Link from "next/link";
import { notFound } from "next/navigation";
import { EditEnquiryForm } from "@/components/portal/portal-forms";
import { PortalActivityList, PortalPageHeader, PortalStatusBadge, formatPortalDate, formatPortalDateTime } from "@/components/portal/portal-ui";
import { requirePortalUser } from "@/lib/portal/auth";
import { getActiveUsers, getEnquiry, getEntityActivity } from "@/lib/portal/queries";

export const runtime = "nodejs";

export default async function PortalEnquiryDetailPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string }> }) {
  await requirePortalUser(["owner", "manager", "staff"]);
  const { id } = await params;
  const query = await searchParams;
  const enquiry = await getEnquiry(id);
  if (!enquiry) notFound();
  const [activities, activeUsers] = await Promise.all([getEntityActivity("enquiry", enquiry.id), getActiveUsers()]);
  const users = activeUsers.filter((user) => user.isActive);

  return (
    <div className="space-y-6">
      <PortalPageHeader
        eyebrow={enquiry.reference}
        title={enquiry.customerName}
        description={`${enquiry.customerPhone} · ${enquiry.type.replaceAll("-", " ")} · ${enquiry.source}`}
        action={<Link href="/portal/enquiries" className="action-secondary">Back to enquiries</Link>}
      />

      {query.saved === "enquiry" ? <p className="rounded-xl border border-brand-blue/20 bg-brand-blue/[0.06] px-4 py-3 text-sm text-brand-blue">Enquiry updated successfully.</p> : null}

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="surface-card p-5 sm:p-7">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-blue">Lead summary</p>
              <h2 className="mt-2 font-heading text-2xl tracking-tight text-ink">Current enquiry</h2>
            </div>
            <PortalStatusBadge value={enquiry.status} />
          </div>
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <div><p className="text-xs font-semibold uppercase tracking-[0.14em] copy-muted">Customer phone</p><p className="mt-1 text-sm text-ink">{enquiry.customerPhone}</p></div>
            <div><p className="text-xs font-semibold uppercase tracking-[0.14em] copy-muted">Assigned to</p><p className="mt-1 text-sm text-ink">{enquiry.assignedToName ?? "Unassigned"}</p></div>
            <div><p className="text-xs font-semibold uppercase tracking-[0.14em] copy-muted">Area / locality</p><p className="mt-1 text-sm text-ink">{enquiry.area ?? "Not set"}</p></div>
            <div><p className="text-xs font-semibold uppercase tracking-[0.14em] copy-muted">Follow-up</p><p className="mt-1 text-sm text-ink">{formatPortalDate(enquiry.followUpAt)}</p></div>
            <div className="sm:col-span-2"><p className="text-xs font-semibold uppercase tracking-[0.14em] copy-muted">Notes</p><p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-ink">{enquiry.notes ?? "No notes added."}</p></div>
          </div>
          <div className="mt-6 border-t border-line pt-4 text-xs copy-muted">Created {formatPortalDateTime(enquiry.createdAt)} · <Link href={`/portal/customers/${enquiry.customerId}`} className="font-semibold text-brand-blue hover:underline">Open customer record</Link></div>
        </section>

        <section className="surface-card p-5 sm:p-7">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-blue">History</p>
          <h2 className="mt-2 font-heading text-2xl tracking-tight text-ink">Activity</h2>
          <div className="mt-5"><PortalActivityList activities={activities} /></div>
        </section>
      </div>

      <section className="surface-card p-5 sm:p-7">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-blue">Maintain pipeline</p>
        <h2 className="mt-2 font-heading text-2xl tracking-tight text-ink">Update enquiry</h2>
        <p className="mt-2 text-sm leading-6 copy-muted">Move the enquiry through the current pipeline and keep the next follow-up visible to the team.</p>
        <div className="mt-5"><EditEnquiryForm enquiry={enquiry} users={users} /></div>
      </section>
    </div>
  );
}
