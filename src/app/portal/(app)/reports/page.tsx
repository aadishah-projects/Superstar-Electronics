import { PortalPageHeader, formatPortalNpr } from "@/components/portal/portal-ui";
import { requirePortalUser } from "@/lib/portal/auth";
import { getReportSummary } from "@/lib/portal/queries";

export const runtime = "nodejs";

function addDays(value: string, days: number) {
  const date = new Date(`${value}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export default async function PortalReportsPage({ searchParams }: { searchParams: Promise<{ from?: string; to?: string }> }) {
  await requirePortalUser(["owner", "manager", "staff"]);
  const params = await searchParams;
  const today = new Date().toISOString().slice(0, 10);
  const from = params.from && /^\d{4}-\d{2}-\d{2}$/.test(params.from) ? params.from : today.slice(0, 8) + "01";
  const to = params.to && /^\d{4}-\d{2}-\d{2}$/.test(params.to) ? params.to : today;
  const summary = await getReportSummary(`${from}T00:00:00.000Z`, `${addDays(to, 1)}T00:00:00.000Z`);

  return (
    <div className="space-y-6">
      <PortalPageHeader eyebrow="Business intelligence" title="Reports" description="Review validated portal records by period. Cash received is shown separately from project and enquiry counts." />
      <section className="surface-card p-5 sm:p-7">
        <form method="get" className="flex flex-wrap items-end gap-3"><label className="text-xs font-semibold text-ink">From<input type="date" name="from" defaultValue={from} className="mt-1 block h-10 rounded-lg border border-line bg-white px-3 text-sm" /></label><label className="text-xs font-semibold text-ink">To<input type="date" name="to" defaultValue={to} className="mt-1 block h-10 rounded-lg border border-line bg-white px-3 text-sm" /></label><button type="submit" className="action-secondary h-10">Refresh report</button></form>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><div className="rounded-xl border border-line bg-white p-4"><p className="text-xs font-semibold uppercase tracking-[0.14em] copy-muted">Enquiries</p><p className="mt-2 font-heading text-3xl text-ink">{summary.totals.enquiries}</p><p className="mt-1 text-xs copy-muted">{summary.totals.convertedEnquiries} converted · {summary.totals.conversionRate.toFixed(1)}%</p></div><div className="rounded-xl border border-line bg-white p-4"><p className="text-xs font-semibold uppercase tracking-[0.14em] copy-muted">Projects</p><p className="mt-2 font-heading text-3xl text-ink">{summary.totals.projects}</p></div><div className="rounded-xl border border-line bg-white p-4"><p className="text-xs font-semibold uppercase tracking-[0.14em] copy-muted">Support tickets</p><p className="mt-2 font-heading text-3xl text-ink">{summary.totals.tickets}</p><p className="mt-1 text-xs copy-muted">{summary.totals.resolvedTickets} resolved · {summary.totals.averageResolutionDays.toFixed(1)} days average</p></div><div className="rounded-xl border border-line bg-white p-4"><p className="text-xs font-semibold uppercase tracking-[0.14em] copy-muted">Net payments received</p><p className="mt-2 font-heading text-3xl text-ink">{formatPortalNpr(summary.totals.netPayments)}</p><p className="mt-1 text-xs copy-muted">Gross {formatPortalNpr(summary.totals.payments)}</p></div></div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><div className="rounded-xl border border-line bg-white p-4"><p className="text-xs font-semibold uppercase tracking-[0.14em] copy-muted">Outstanding balances</p><p className="mt-2 font-heading text-2xl text-ink">{formatPortalNpr(summary.totals.outstandingBalance)}</p><p className="mt-1 text-xs copy-muted">Current project balance snapshot</p></div><div className="rounded-xl border border-line bg-white p-4"><p className="text-xs font-semibold uppercase tracking-[0.14em] copy-muted">Overdue surveys</p><p className="mt-2 font-heading text-2xl text-ink">{summary.totals.overdueSurveys}</p></div><div className="rounded-xl border border-line bg-white p-4"><p className="text-xs font-semibold uppercase tracking-[0.14em] copy-muted">Overdue installations</p><p className="mt-2 font-heading text-2xl text-ink">{summary.totals.overdueInstallations}</p></div></div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <ReportList title="Enquiries by source" rows={summary.enquiriesBySource.map((row) => ({ label: String(row.source), value: String(row.count) }))} empty="No enquiries in this period." />
        <ReportList title="Projects by stage" rows={summary.projectsByStatus.map((row) => ({ label: String(row.status).replaceAll("-", " "), value: String(row.count) }))} empty="No projects in this period." />
        <ReportList title="Support tickets by status" rows={summary.ticketsByStatus.map((row) => ({ label: String(row.status).replaceAll("-", " "), value: String(row.count) }))} empty="No tickets in this period." />
        <ReportList title="Payments by method" rows={summary.paymentsByMethod.map((row) => ({ label: row.method.replace("fonepay", "Fonepay QR"), value: `${formatPortalNpr(row.total)} · ${row.count} ${row.count === 1 ? "payment" : "payments"}` })).concat(summary.totals.paymentAdjustments ? [{ label: "Refunds / reversals", value: `-${formatPortalNpr(summary.totals.paymentAdjustments)}` }] : [])} empty="No payments in this period." />
        <ReportList title="Technician workload" rows={summary.staffWorkload.map((row) => ({ label: row.name, value: `${row.count} scheduled` }))} empty="No assigned work in this period." />
      </div>
    </div>
  );
}

function ReportList({ title, rows, empty }: { title: string; rows: Array<{ label: string; value: string }>; empty: string }) {
  return <section className="surface-card p-5 sm:p-7"><p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-blue">Report</p><h2 className="mt-2 font-heading text-2xl tracking-tight text-ink">{title}</h2>{rows.length ? <div className="mt-5 space-y-3">{rows.map((row) => <div key={row.label} className="flex items-center justify-between gap-4 border-b border-line pb-3 last:border-0 last:pb-0"><span className="text-sm capitalize text-ink">{row.label}</span><span className="text-sm font-semibold text-ink">{row.value}</span></div>)}</div> : <p className="mt-5 text-sm copy-muted">{empty}</p>}</section>;
}
