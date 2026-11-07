import Link from "next/link";
import { ScheduleEventForm, ScheduleEventRescheduleForm, ScheduleEventStatusForm } from "@/components/portal/portal-forms";
import { PortalPageHeader, PortalStatusBadge, formatPortalDateTime } from "@/components/portal/portal-ui";
import { getPortalToday } from "@/lib/portal/config";
import { requirePortalUser } from "@/lib/portal/auth";
import { getActiveUsers, getProjects, getScheduleEvents, getServiceTickets } from "@/lib/portal/queries";

export const runtime = "nodejs";

function addDays(value: string, days: number) {
  const date = new Date(`${value}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export default async function PortalSchedulePage({ searchParams }: { searchParams: Promise<{ from?: string; view?: string; saved?: string }> }) {
  const user = await requirePortalUser();
  const params = await searchParams;
  const fromDate = params.from && /^\d{4}-\d{2}-\d{2}$/.test(params.from) ? params.from : getPortalToday();
  const days = params.view === "day" ? 1 : 7;
  const toDate = addDays(fromDate, days);
  const [events, activeUsers, projects, tickets] = await Promise.all([getScheduleEvents({ from: `${fromDate}T00:00`, to: `${toDate}T00:00`, assignedTo: user.role === "technician" ? user.id : undefined }), getActiveUsers(), user.role === "technician" ? Promise.resolve([]) : getProjects(), user.role === "technician" ? Promise.resolve([]) : getServiceTickets()]);
  const users = activeUsers.filter((member) => member.isActive);

  return (
    <div className="space-y-6">
      <PortalPageHeader eyebrow="Operations" title="Schedule" description={user.role === "technician" ? "Review your surveys, installations, and service visits." : "Schedule surveys, installations, and service visits with assignment and conflict checks."} />
      {params.saved === "event" ? <p className="rounded-xl border border-brand-blue/20 bg-brand-blue/[0.06] px-4 py-3 text-sm text-brand-blue">Work was scheduled successfully.</p> : null}
      {params.saved === "status" ? <p className="rounded-xl border border-brand-blue/20 bg-brand-blue/[0.06] px-4 py-3 text-sm text-brand-blue">Schedule status updated.</p> : null}
      {params.saved === "rescheduled" ? <p className="rounded-xl border border-brand-blue/20 bg-brand-blue/[0.06] px-4 py-3 text-sm text-brand-blue">Schedule time updated and history recorded.</p> : null}

      {user.role === "owner" || user.role === "manager" || user.role === "staff" ? (
        <section className="surface-card p-5 sm:p-7">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-blue">New schedule item</p>
          <h2 className="mt-2 font-heading text-2xl tracking-tight text-ink">Plan work</h2>
          <p className="mt-2 text-sm leading-6 copy-muted">The system warns about overlapping assignments, but an authorized user can override a conflict with an explicit confirmation.</p>
          <div className="mt-5"><ScheduleEventForm projects={projects.map((project) => ({ id: project.id, reference: project.reference, title: project.title }))} tickets={tickets.map((ticket) => ({ id: ticket.id, reference: ticket.reference, customerName: ticket.customerName }))} users={users.map((member) => ({ id: member.id, name: member.name, role: member.role }))} today={fromDate} /></div>
        </section>
      ) : null}

      <section className="surface-card p-5 sm:p-7">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div><p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-blue">Calendar view</p><h2 className="mt-2 font-heading text-2xl tracking-tight text-ink">{days === 1 ? "Daily schedule" : "Next seven days"}</h2></div>
          <form method="get" className="flex flex-wrap items-end gap-2"><label className="text-xs font-semibold text-ink">Start date<input type="date" name="from" defaultValue={fromDate} className="mt-1 block h-10 rounded-lg border border-line bg-white px-3 text-sm" /></label><label className="text-xs font-semibold text-ink">View<select name="view" defaultValue={params.view === "day" ? "day" : "week"} className="mt-1 block h-10 rounded-lg border border-line bg-white px-3 text-sm"><option value="week">7 days</option><option value="day">1 day</option></select></label><button type="submit" className="action-secondary h-10">Show</button></form>
        </div>
        {events.length ? (
          <div className="mt-5 space-y-3">
            {events.map((event) => (
              <article key={event.id} className="rounded-xl border border-line bg-white p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-blue">{event.eventType.replaceAll("-", " ")} · {formatPortalDateTime(event.scheduledStart)}–{formatPortalDateTime(event.scheduledEnd)}</p><h3 className="mt-1 font-heading text-xl text-ink">{event.title}</h3><p className="mt-1 text-sm copy-muted">{event.customerName ?? "No customer linked"}{event.siteAddress ? ` · ${event.siteAddress}` : ""} · Assigned: {event.assignedToName ?? "Unassigned"}</p></div>
                  <PortalStatusBadge value={event.status} />
                </div>
                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs copy-muted">{event.projectId ? <Link href={`/portal/projects/${event.projectId}`} className="font-semibold text-brand-blue hover:underline">{event.projectReference}</Link> : null}{event.ticketId ? <Link href={`/portal/tickets/${event.ticketId}`} className="font-semibold text-brand-blue hover:underline">{event.ticketReference}</Link> : null}{event.notes ? <span>{event.notes}</span> : null}</div>
                 <div className="mt-4"><ScheduleEventStatusForm event={event} />{user.role === "owner" || user.role === "manager" || user.role === "staff" ? <ScheduleEventRescheduleForm event={event} /> : null}</div>
              </article>
            ))}
          </div>
        ) : <p className="mt-6 rounded-xl border border-dashed border-line px-4 py-8 text-center text-sm copy-muted">No work is scheduled for this view.</p>}
      </section>
    </div>
  );
}
