import Link from "next/link";
import { PortalPageHeader, PortalStatusBadge, formatPortalDateTime } from "@/components/portal/portal-ui";
import { requirePortalUser } from "@/lib/portal/auth";
import { getServiceTickets } from "@/lib/portal/queries";

export const runtime = "nodejs";

export default async function PortalTicketsPage({ searchParams }: { searchParams: Promise<{ q?: string; status?: string }> }) {
  const user = await requirePortalUser();
  const params = await searchParams;
  const tickets = await getServiceTickets(user.role === "technician" ? user.id : undefined, { search: params.q, status: params.status });

  return (
    <div className="space-y-6">
      <PortalPageHeader
        eyebrow="Customer service"
        title="Support tickets"
        description={user.role === "technician" ? "Review tickets assigned to you and keep the team updated on the work." : "Review customer support requests, assign technicians, and keep service history in one place."}
        action={<Link href="/support" target="_blank" className="action-secondary">Open public form</Link>}
      />

      <section className="surface-card p-5 sm:p-7">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-blue">Queue</p>
            <h2 className="mt-2 font-heading text-2xl tracking-tight text-ink">{tickets.length} {tickets.length === 1 ? "ticket" : "tickets"}</h2>
          </div>
          <p className="text-sm copy-muted">New tickets are visible to active owners in the portal.</p>
        </div>
        <form method="get" className="mt-5 grid gap-3 sm:grid-cols-[1fr_13rem_auto]">
          <input name="q" defaultValue={params.q ?? ""} placeholder="Search reference, customer, phone" className="h-11 rounded-xl border border-line bg-white px-3 text-sm outline-none focus:border-brand-blue" />
          <select name="status" defaultValue={params.status ?? ""} className="h-11 rounded-xl border border-line bg-white px-3 text-sm outline-none focus:border-brand-blue">
            <option value="">All statuses</option><option value="open">Open</option><option value="reviewed">Reviewed</option><option value="assigned">Assigned</option><option value="scheduled">Scheduled</option><option value="in-progress">In progress</option><option value="waiting-customer">Waiting for customer</option><option value="resolved">Resolved</option><option value="closed">Closed</option><option value="reopened">Reopened</option>
          </select>
          <button type="submit" className="action-secondary">Filter</button>
        </form>

        {tickets.length ? (
          <div className="mt-5 space-y-3">
            {tickets.map((ticket) => (
              <article key={ticket.id} className="rounded-xl border border-line bg-white p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-blue"><Link href={`/portal/tickets/${ticket.id}`} className="hover:underline">{ticket.reference}</Link></p>
                    <h3 className="mt-1 font-heading text-xl text-ink"><Link href={`/portal/tickets/${ticket.id}`} className="hover:text-brand-blue">{ticket.customerName}</Link></h3>
                    <p className="mt-1 text-sm copy-muted">{ticket.phone} · {ticket.category.replaceAll("-", " ")}{ticket.projectReference ? ` · ${ticket.projectReference}` : ""}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <PortalStatusBadge value={ticket.priority} />
                    <PortalStatusBadge value={ticket.status} />
                  </div>
                </div>
                <p className="mt-3 line-clamp-2 text-sm leading-6 text-ink">{ticket.description}</p>
                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs copy-muted">
                  <span>Assigned: {ticket.assignedToName ?? "Unassigned"}</span>
                  <span>Received: {formatPortalDateTime(ticket.createdAt)}</span>
                </div>
                <Link href={`/portal/tickets/${ticket.id}`} className="mt-4 inline-flex text-sm font-semibold text-brand-blue hover:underline">Open ticket record</Link>
              </article>
            ))}
          </div>
        ) : <p className="mt-6 rounded-xl border border-dashed border-line px-4 py-8 text-center text-sm copy-muted">No support tickets are assigned or recorded yet.</p>}
      </section>
    </div>
  );
}
