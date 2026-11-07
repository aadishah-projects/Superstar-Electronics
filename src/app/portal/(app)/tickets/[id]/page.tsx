import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { TicketAttachmentForm, TicketUpdateForm } from "@/components/portal/portal-forms";
import { PortalActivityList, PortalPageHeader, PortalStatusBadge, formatPortalDateTime } from "@/components/portal/portal-ui";
import { requirePortalUser } from "@/lib/portal/auth";
import { getPortalWhatsAppHref } from "@/lib/portal/config";
import { getActiveUsers, getEntityActivity, getServiceTicket, getTicketAttachments } from "@/lib/portal/queries";

export const runtime = "nodejs";

export default async function PortalTicketDetailPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string }> }) {
  const user = await requirePortalUser();
  const { id } = await params;
  const query = await searchParams;
  const ticket = await getServiceTicket(id);
  if (!ticket) notFound();
  if (user.role === "technician" && ticket.assignedTo !== user.id) redirect("/portal/tickets?error=forbidden");

  const [activities, attachments, activeUsers] = await Promise.all([getEntityActivity("service-ticket", ticket.id), getTicketAttachments(ticket.id), getActiveUsers()]);
  const technicians = activeUsers.filter((member) => member.isActive && member.role === "technician");
  const assignedTechnician = technicians.find((technician) => technician.id === ticket.assignedTo);
  const canAssign = user.role === "owner" || user.role === "manager" || user.role === "staff";

  return (
    <div className="space-y-6">
      <PortalPageHeader
        eyebrow={ticket.reference}
        title={ticket.customerName}
        description={`${ticket.phone} · ${ticket.category.replaceAll("-", " ")}`}
        action={<Link href="/portal/tickets" className="action-secondary">Back to tickets</Link>}
      />

      {query.saved === "ticket" ? <p className="rounded-xl border border-brand-blue/20 bg-brand-blue/[0.06] px-4 py-3 text-sm text-brand-blue">Support ticket updated successfully.</p> : null}
      {query.saved === "attachment" ? <p className="rounded-xl border border-brand-blue/20 bg-brand-blue/[0.06] px-4 py-3 text-sm text-brand-blue">Attachment added securely.</p> : null}

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="surface-card p-5 sm:p-7">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-blue">Service request</p>
              <h2 className="mt-2 font-heading text-2xl tracking-tight text-ink">Issue details</h2>
            </div>
            <div className="flex flex-wrap gap-2"><PortalStatusBadge value={ticket.priority} /><PortalStatusBadge value={ticket.status} /></div>
          </div>
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <div><p className="text-xs font-semibold uppercase tracking-[0.14em] copy-muted">Customer phone</p><p className="mt-1 text-sm text-ink">{ticket.phone}</p></div>
            <div><p className="text-xs font-semibold uppercase tracking-[0.14em] copy-muted">Email</p><p className="mt-1 text-sm text-ink">{ticket.email ?? "Not provided"}</p></div>
            <div><p className="text-xs font-semibold uppercase tracking-[0.14em] copy-muted">Assigned technician</p><p className="mt-1 text-sm text-ink">{ticket.assignedToName ?? "Unassigned"}</p></div>
            <div><p className="text-xs font-semibold uppercase tracking-[0.14em] copy-muted">Preferred contact</p><p className="mt-1 text-sm text-ink">{ticket.preferredContact ?? "Not specified"}</p></div>
            {ticket.customerId ? <div><p className="text-xs font-semibold uppercase tracking-[0.14em] copy-muted">Customer record</p><p className="mt-1 text-sm text-ink"><Link href={`/portal/customers/${ticket.customerId}`} className="font-semibold text-brand-blue hover:underline">Open customer</Link></p></div> : null}
            {ticket.projectId ? <div><p className="text-xs font-semibold uppercase tracking-[0.14em] copy-muted">Related project</p><p className="mt-1 text-sm text-ink"><Link href={`/portal/projects/${ticket.projectId}`} className="font-semibold text-brand-blue hover:underline">{ticket.projectReference}</Link></p></div> : null}
            <div className="sm:col-span-2"><p className="text-xs font-semibold uppercase tracking-[0.14em] copy-muted">Description</p><p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-ink">{ticket.description}</p></div>
            {ticket.internalNotes ? <div className="sm:col-span-2"><p className="text-xs font-semibold uppercase tracking-[0.14em] copy-muted">Internal notes</p><p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-ink">{ticket.internalNotes}</p></div> : null}
            {ticket.customerUpdate ? <div className="sm:col-span-2"><p className="text-xs font-semibold uppercase tracking-[0.14em] copy-muted">Customer-visible update</p><p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-ink">{ticket.customerUpdate}</p></div> : null}
            {ticket.resolutionSummary ? <div className="sm:col-span-2"><p className="text-xs font-semibold uppercase tracking-[0.14em] copy-muted">Resolution summary</p><p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-ink">{ticket.resolutionSummary}</p></div> : null}
          </div>
          <p className="mt-6 border-t border-line pt-4 text-xs copy-muted">Received {formatPortalDateTime(ticket.createdAt)} · Updated {formatPortalDateTime(ticket.updatedAt)}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <a href={getPortalWhatsAppHref(ticket.phone)} target="_blank" rel="noreferrer" className="action-secondary text-xs">Open customer WhatsApp</a>
            {assignedTechnician?.phone ? <a href={getPortalWhatsAppHref(assignedTechnician.phone, `${ticket.reference} has been assigned to you. Please review the portal ticket.`)} target="_blank" rel="noreferrer" className="action-secondary text-xs">Message assigned technician</a> : null}
          </div>
        </section>

        <section className="surface-card p-5 sm:p-7">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-blue">History</p>
          <h2 className="mt-2 font-heading text-2xl tracking-tight text-ink">Activity</h2>
          <div className="mt-5"><PortalActivityList activities={activities} /></div>
        </section>
      </div>

      <section className="surface-card p-5 sm:p-7">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-blue">Maintain service record</p>
        <h2 className="mt-2 font-heading text-2xl tracking-tight text-ink">Update ticket</h2>
        <p className="mt-2 text-sm leading-6 copy-muted">Assignment notifications are recorded in the portal. The WhatsApp links provide a manual handoff; automatic SMS and WhatsApp delivery will need a configured provider later.</p>
        <div className="mt-5"><TicketUpdateForm ticket={ticket} technicians={technicians.map((technician) => ({ id: technician.id, name: technician.name }))} canAssign={canAssign} /></div>
      </section>

      <section className="surface-card p-5 sm:p-7">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-blue">Private files</p>
        <h2 className="mt-2 font-heading text-2xl tracking-tight text-ink">Attachments</h2>
        <p className="mt-2 text-sm leading-6 copy-muted">Files are restricted to authorized portal users. Customer-facing status pages never expose internal files.</p>
        {attachments.length ? (
          <div className="mt-5 space-y-3">
            {attachments.map((attachment) => (
              <div key={attachment.id} className="flex flex-col gap-2 rounded-xl border border-line bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
                <div><a href={`/portal/tickets/${ticket.id}/attachments/${attachment.id}`} target="_blank" rel="noreferrer" className="font-semibold text-brand-blue hover:underline">{attachment.originalName}</a><p className="mt-1 text-xs copy-muted">{attachment.mimeType} · {(attachment.sizeBytes / (1024 * 1024)).toFixed(2)} MB · {attachment.uploadedByName}</p></div>
                <span className="text-xs copy-muted">{formatPortalDateTime(attachment.createdAt)}</span>
              </div>
            ))}
          </div>
        ) : <p className="mt-5 rounded-xl border border-dashed border-line px-4 py-8 text-center text-sm copy-muted">No private files attached.</p>}
        <div className="mt-6 max-w-xl"><TicketAttachmentForm ticketId={ticket.id} /></div>
      </section>
    </div>
  );
}
