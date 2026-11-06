import Link from "next/link";
import { markNotificationReadAction } from "@/lib/portal/actions";
import { JobQuickView } from "@/components/portal/job-quick-view";
import { ProfileForm } from "@/components/portal/portal-forms";
import { PortalIcon, PortalStatusBadge, formatPortalDateTime } from "@/components/portal/portal-ui";
import { requirePortalUser } from "@/lib/portal/auth";
import { ensureDueFollowUpNotifications } from "@/lib/portal/db";
import { getJobLocationLabel } from "@/lib/portal/maps";
import { getActivityFeed, getDashboardMetrics, getNotifications, getServiceJobs } from "@/lib/portal/queries";

export const runtime = "nodejs";

function todayLabel() {
  return new Intl.DateTimeFormat("en-NP", { dateStyle: "medium", timeZone: "Asia/Kathmandu" }).format(new Date());
}

const metricStyles = [
  { icon: "briefcase" as const, tone: "text-[#1463d7] bg-[#e9f1ff]" },
  { icon: "clock" as const, tone: "text-[#d97706] bg-[#fff4db]" },
  { icon: "tool" as const, tone: "text-[#198754] bg-[#e5f7ee]" },
  { icon: "inbox" as const, tone: "text-[#9b59b6] bg-[#f4eafd]" },
  { icon: "wallet" as const, tone: "text-[#1463d7] bg-[#e9f1ff]" },
  { icon: "headphones" as const, tone: "text-[#ef6b4a] bg-[#fff0ec]" },
];

export default async function PortalDashboardPage({ searchParams }: { searchParams: Promise<{ error?: string; saved?: string }> }) {
  const user = await requirePortalUser();
  ensureDueFollowUpNotifications();
  const metrics = getDashboardMetrics();
  const activity = getActivityFeed();
  const notifications = getNotifications(user.id);
  const jobs = getServiceJobs({ role: user.role, userId: user.id });
  const params = await searchParams;
  const activeJobs = jobs.filter((job) => !["completed", "cancelled", "expired"].includes(job.status));
  const dispatchJobs = activeJobs.slice(0, 4);
  const metricCards = [
    { label: "Active jobs", value: activeJobs.length, href: "/portal/jobs", note: "Open dispatch board" },
    { label: "Waiting for acceptance", value: jobs.filter((job) => job.status === "open").length, href: "/portal/jobs", note: "Needs a technician" },
    { label: "Active installations", value: metrics.inProgressProjects, href: "/portal/projects?status=installation-in-progress", note: "Work in progress" },
    { label: "Pending enquiries", value: metrics.newEnquiries, href: "/portal/enquiries", note: "Customer follow-up" },
    { label: "Outstanding payments", value: metrics.openBalances, href: "/portal/projects", note: "Projects with balance" },
    { label: "Service requests", value: metrics.openTickets, href: "/portal/tickets", note: metrics.urgentTickets ? `${metrics.urgentTickets} urgent` : "All caught up" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 border-b border-[#e4eaf2] pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[0.68rem] font-medium text-[#8b98aa]">Home <span className="px-1">/</span> Dashboard</p>
          <h1 className="mt-2 font-heading text-3xl font-semibold tracking-tight text-[#1d2b3e]">Dashboard</h1>
        </div>
        <div className="flex items-center gap-2 text-[0.7rem] text-[#758398]"><span className="inline-flex items-center gap-1.5 rounded-full bg-[#e5f7ee] px-2.5 py-1.5 font-semibold text-[#198754]"><span className="h-1.5 w-1.5 rounded-full bg-[#198754]" />Open</span><span>Shop is open</span><span className="hidden sm:inline">· {todayLabel()}</span></div>
      </div>

      {params.error === "forbidden" ? <p className="rounded-xl border border-brand-red/30 bg-brand-red/[0.06] px-4 py-3 text-sm text-brand-red">You do not have permission to open that area.</p> : null}
      {params.saved === "profile" ? <p className="rounded-xl border border-brand-blue/20 bg-brand-blue/[0.06] px-4 py-3 text-sm text-brand-blue">Your contact number was updated.</p> : null}

      <section className="rounded-2xl border border-[#dce6f2] bg-gradient-to-r from-[#eef5ff] via-white to-white p-5 shadow-[0_8px_30px_rgba(20,67,125,0.05)] sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div><p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[#1463d7]">Good morning, {user.name.split(" ")[0]} <span aria-hidden="true">👋</span></p><h2 className="mt-1 font-heading text-2xl font-semibold tracking-tight text-[#1d2b3e]">Here&apos;s what&apos;s happening today.</h2></div>
          <div className="flex flex-wrap gap-2">
            {user.role !== "technician" ? <Link href="/portal/jobs#quick-create" className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#1463d7] px-4 text-[0.72rem] font-semibold text-white shadow-[0_8px_18px_rgba(20,99,215,0.18)] transition hover:bg-[#0f55bb]"><PortalIcon name="plus" className="h-4 w-4" />New job</Link> : null}
            <Link href="/portal/customers" className="inline-flex h-10 items-center gap-2 rounded-lg border border-[#d9e3ef] bg-white px-4 text-[0.72rem] font-semibold text-[#35516f] transition hover:border-[#8cb4f7] hover:text-[#1463d7]"><PortalIcon name="users" className="h-4 w-4" />Add customer</Link>
            {user.role !== "technician" ? <Link href="/portal/quotations" className="inline-flex h-10 items-center gap-2 rounded-lg border border-[#d9e3ef] bg-white px-4 text-[0.72rem] font-semibold text-[#35516f] transition hover:border-[#8cb4f7] hover:text-[#1463d7]"><PortalIcon name="file" className="h-4 w-4" />Create quotation</Link> : null}
          </div>
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between"><div><p className="text-[0.64rem] font-bold uppercase tracking-[0.16em] text-[#8b98aa]">Today&apos;s operations</p><h2 className="mt-1 font-heading text-xl font-semibold text-[#1d2b3e]">What needs attention</h2></div><Link href="/portal/jobs" className="text-[0.72rem] font-semibold text-[#1463d7] hover:underline">View all work <span aria-hidden="true">→</span></Link></div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
          {metricCards.map((card, index) => <Link key={card.label} href={card.href} className="group rounded-xl border border-[#e0e7f0] bg-white p-4 transition hover:-translate-y-0.5 hover:border-[#8cb4f7] hover:shadow-[0_12px_26px_rgba(20,67,125,0.07)]"><div className="flex items-start justify-between gap-2"><span className={`inline-flex h-8 w-8 items-center justify-center rounded-lg ${metricStyles[index].tone}`}><PortalIcon name={metricStyles[index].icon} className="h-4 w-4" /></span><PortalIcon name="arrow" className="h-3.5 w-3.5 text-[#a6b1c0] transition group-hover:text-[#1463d7]" /></div><p className="mt-4 font-heading text-2xl font-semibold text-[#1d2b3e]">{card.value}</p><p className="mt-1 text-[0.72rem] font-semibold leading-5 text-[#4c5b70]">{card.label}</p><p className="mt-1 text-[0.64rem] text-[#9aa5b4]">{card.note}</p></Link>)}
        </div>
      </section>

      <section className="rounded-2xl border border-[#cfe0fb] bg-gradient-to-br from-[#eef5ff] via-white to-[#fff8f5] p-5 shadow-[0_8px_30px_rgba(20,67,125,0.05)] sm:p-6">
        <div className="flex flex-col gap-3 border-b border-[#dce6f2] pb-4 sm:flex-row sm:items-end sm:justify-between">
          <div><p className="text-[0.64rem] font-bold uppercase tracking-[0.16em] text-[#1463d7]">Main workflow</p><h2 className="mt-1 font-heading text-xl font-semibold text-[#1d2b3e]">Dispatch board</h2><p className="mt-1 text-[0.72rem] text-[#6f7f93]">Deploy work, let technicians claim it, and track every job to verification.</p></div>
          <Link href="/portal/jobs" className="inline-flex items-center gap-1 text-[0.72rem] font-semibold text-[#1463d7] hover:underline">Open full board <span aria-hidden="true">→</span></Link>
        </div>
        {dispatchJobs.length ? <div className="mt-4 grid gap-3 md:grid-cols-2">{dispatchJobs.map((job) => <article key={job.id} className="rounded-xl border border-[#dce6f2] bg-white/90 p-4"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="text-[0.6rem] font-semibold uppercase tracking-[0.16em] text-[#173f70]">{job.reference}</p><h3 className="mt-1 truncate font-heading text-lg text-[#1d2b3e]">{job.title}</h3></div><PortalStatusBadge value={job.status} /></div><p className="mt-3 text-[0.72rem] font-semibold text-[#34465c]">{job.customerName}</p><p className="mt-1 truncate text-[0.68rem] text-[#8b98aa]">{getJobLocationLabel(job)} · {job.assignedTechnicianName ?? "Waiting for acceptance"}</p><div className="mt-3 flex items-center justify-between border-t border-[#edf0f5] pt-3"><JobQuickView job={job} canRespond={user.role === "technician"} /><Link href={`/portal/jobs/${job.id}`} className="text-[0.7rem] font-semibold text-[#1463d7]">Open record →</Link></div></article>)}</div> : <div className="mt-4 rounded-xl border border-dashed border-[#cfe0fb] bg-white/70 px-4 py-8 text-center text-sm text-[#7d899a]">No active jobs. Create a job to start the dispatch workflow.</div>}
      </section>

      <div className="grid gap-5 xl:grid-cols-[1.05fr_1fr_0.85fr]">
        <section className="rounded-xl border border-[#e0e7f0] bg-white p-5 shadow-[0_6px_24px_rgba(20,67,125,0.035)]">
          <div className="flex items-start justify-between"><div><p className="text-[0.64rem] font-bold uppercase tracking-[0.16em] text-[#8b98aa]">Workload</p><h2 className="mt-1 font-heading text-lg font-semibold text-[#1d2b3e]">Project delivery</h2></div><Link href="/portal/projects" className="text-[0.7rem] font-semibold text-[#1463d7]">Open</Link></div>
          <div className="mt-5 space-y-4">
            {[{ label: "Active projects", value: metrics.activeProjects, color: "bg-[#1463d7]" }, { label: "Installation in progress", value: metrics.inProgressProjects, color: "bg-[#22a06b]" }, { label: "Upcoming installations", value: metrics.upcomingInstallations, color: "bg-[#f0a52b]" }, { label: "Follow-ups due", value: metrics.followUpsDue, color: "bg-[#ef6b4a]" }].map((item) => { const width = Math.min(100, Math.max(item.value ? 12 : 4, item.value * 12)); return <div key={item.label}><div className="flex items-center justify-between text-[0.72rem]"><span className="text-[#59687b]">{item.label}</span><span className="font-semibold text-[#27364a]">{item.value}</span></div><div className="mt-2 h-1.5 rounded-full bg-[#eef2f7]"><div className={`h-1.5 rounded-full ${item.color}`} style={{ width: `${width}%` }} /></div></div>; })}
          </div>
        </section>

        <section className="rounded-xl border border-[#e0e7f0] bg-white p-5 shadow-[0_6px_24px_rgba(20,67,125,0.035)]">
          <div className="flex items-start justify-between"><div><p className="text-[0.64rem] font-bold uppercase tracking-[0.16em] text-[#8b98aa]">Timeline</p><h2 className="mt-1 font-heading text-lg font-semibold text-[#1d2b3e]">Recent activity</h2></div><Link href="/portal/reports" className="text-[0.7rem] font-semibold text-[#1463d7]">Reports</Link></div>
          {activity.length ? <div className="mt-4 space-y-3">{activity.slice(0, 5).map((item, index) => <div key={`${item.created_at}-${index}`} className="flex gap-3"><span className="mt-1 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#eef5ff] text-[#1463d7]"><PortalIcon name="check" className="h-3.5 w-3.5" /></span><div className="min-w-0"><p className="truncate text-[0.73rem] font-semibold capitalize text-[#34465c]">{item.action.replaceAll("_", " ")}</p><p className="mt-0.5 truncate text-[0.64rem] text-[#9aa5b4]">{item.actor_name} · {formatPortalDateTime(item.created_at)}</p></div></div>)}</div> : <p className="mt-5 text-sm text-[#8b98aa]">Activity will appear as the team works.</p>}
        </section>

        <section className="rounded-xl border border-[#e0e7f0] bg-white p-5 shadow-[0_6px_24px_rgba(20,67,125,0.035)]">
          <div className="flex items-start justify-between"><div><p className="text-[0.64rem] font-bold uppercase tracking-[0.16em] text-[#8b98aa]">Service desk</p><h2 className="mt-1 font-heading text-lg font-semibold text-[#1d2b3e]">At a glance</h2></div><Link href="/portal/tickets" className="text-[0.7rem] font-semibold text-[#1463d7]">Open queue</Link></div>
          <div className="mt-4 space-y-2.5"><Link href="/portal/tickets" className="flex items-center justify-between rounded-lg bg-[#fff5f1] px-3 py-3 text-[0.72rem] transition hover:bg-[#ffede7]"><span className="flex items-center gap-2 font-semibold text-[#78412f]"><PortalIcon name="headphones" className="h-4 w-4" />Open requests</span><strong className="text-[#ef6b4a]">{metrics.openTickets}</strong></Link><Link href="/portal/enquiries" className="flex items-center justify-between rounded-lg bg-[#f4eafd] px-3 py-3 text-[0.72rem] transition hover:bg-[#edddfb]"><span className="flex items-center gap-2 font-semibold text-[#6d3d84]"><PortalIcon name="inbox" className="h-4 w-4" />New enquiries</span><strong className="text-[#9b59b6]">{metrics.newEnquiries}</strong></Link><Link href="/portal/projects" className="flex items-center justify-between rounded-lg bg-[#eef5ff] px-3 py-3 text-[0.72rem] transition hover:bg-[#e3efff]"><span className="flex items-center gap-2 font-semibold text-[#35516f]"><PortalIcon name="wallet" className="h-4 w-4" />Outstanding balances</span><strong className="text-[#1463d7]">{metrics.openBalances}</strong></Link></div>
          <div className="mt-5 border-t border-[#edf0f5] pt-4"><p className="text-[0.65rem] text-[#8b98aa]">Team members</p><p className="mt-1 font-heading text-2xl font-semibold text-[#1d2b3e]">{metrics.teamMembers}</p></div>
        </section>
      </div>

      <section id="notifications" className="rounded-xl border border-[#e0e7f0] bg-white p-5 shadow-[0_6px_24px_rgba(20,67,125,0.035)]">
        <div className="flex items-center justify-between"><div><p className="text-[0.64rem] font-bold uppercase tracking-[0.16em] text-[#8b98aa]">Inbox</p><h2 className="mt-1 font-heading text-lg font-semibold text-[#1d2b3e]">Notifications</h2></div><PortalIcon name="bell" className="h-5 w-5 text-[#1463d7]" /></div>
        {notifications.length ? <div className="mt-4 grid gap-2 md:grid-cols-2">{notifications.slice(0, 6).map((notification) => { const notificationHref = notification.entityType === "service-ticket" ? `/portal/tickets/${notification.entityId}` : notification.entityType === "enquiry" ? `/portal/enquiries/${notification.entityId}` : notification.entityType === "schedule-event" ? "/portal/schedule" : "/portal/dashboard"; return <div key={notification.id} className={`flex items-start justify-between gap-3 rounded-lg border px-3 py-3 ${notification.readAt ? "border-[#e7edf4]" : "border-[#cfe0fb] bg-[#f6f9ff]"}`}><Link href={notificationHref} className="min-w-0"><p className="truncate text-[0.72rem] font-semibold text-[#34465c]">{notification.title}</p><p className="mt-1 line-clamp-1 text-[0.65rem] text-[#8b98aa]">{notification.message}</p></Link>{!notification.readAt ? <form action={markNotificationReadAction.bind(null, notification.id)}><button type="submit" className="shrink-0 text-[0.65rem] font-semibold text-[#1463d7]">Mark read</button></form> : null}</div>; })}</div> : <p className="mt-4 text-sm text-[#8b98aa]">No new notifications.</p>}
      </section>

      <details id="profile" className="rounded-xl border border-[#e0e7f0] bg-white shadow-[0_6px_24px_rgba(20,67,125,0.035)]"><summary className="flex cursor-pointer list-none items-center justify-between px-5 py-4 text-[0.78rem] font-semibold text-[#34465c]"><span>Profile &amp; contact routing</span><PortalIcon name="chevron" className="h-4 w-4 text-[#8792a2] transition group-open:rotate-180" /></summary><div className="border-t border-[#edf0f5] px-5 pb-5 pt-4"><p className="text-[0.72rem] text-[#8b98aa]">Keep a number on your account for direct WhatsApp handoff.</p><div className="mt-4 max-w-xl"><ProfileForm phone={user.phone} /></div></div></details>
    </div>
  );
}
