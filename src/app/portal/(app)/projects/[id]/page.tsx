import Link from "next/link";
import { notFound } from "next/navigation";
import { EditProjectForm, InstallationItemForm, PaymentAdjustmentForm, PaymentForm, SiteSurveyForm } from "@/components/portal/portal-forms";
import { PrintButton } from "@/components/portal/print-button";
import { PortalActivityList, PortalPageHeader, PortalStatusBadge, formatPortalDate, formatPortalDateTime, formatPortalNpr } from "@/components/portal/portal-ui";
import { requirePortalUser } from "@/lib/portal/auth";
import { getPortalToday } from "@/lib/portal/config";
import { getActiveUsers, getEntityActivity, getInstallationItems, getPaymentAdjustments, getPayments, getProject, getQuotations, getSiteSurveys } from "@/lib/portal/queries";

export const runtime = "nodejs";

export default async function PortalProjectDetailPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string }> }) {
  const user = await requirePortalUser();
  const { id } = await params;
  const query = await searchParams;
  const project = await getProject(id);
  if (!project) notFound();
  const [activities, quotations, payments, paymentAdjustments, installationItems, surveys, activeUsers] = await Promise.all([getEntityActivity("project", project.id), getQuotations(project.id), getPayments(project.id), getPaymentAdjustments(project.id), getInstallationItems(project.id), getSiteSurveys(project.id), getActiveUsers()]);
  const surveyUsers = activeUsers.filter((member) => member.isActive);
  const commercialTotal = project.approvedAmount ?? project.estimatedAmount;
  const balance = commercialTotal === null ? null : Math.max(commercialTotal - project.amountPaid, 0);
  const today = getPortalToday();
  const mapQuery = project.siteLatitude !== null && project.siteLongitude !== null
    ? `${project.siteLatitude},${project.siteLongitude}`
    : [project.siteAddress, project.area].filter(Boolean).join(", ");
  const mapHref = mapQuery ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}` : null;

  return (
    <div className="space-y-6">
      <PortalPageHeader
        eyebrow={project.reference}
        title={project.title}
        description={`${project.customerName} · ${project.projectType}`}
        action={<div className="flex flex-wrap gap-2 print:hidden"><PrintButton label="Print project / handover" /><Link href="/portal/projects" className="action-secondary">Back to projects</Link></div>}
      />

      {query.saved === "project" ? <p className="rounded-xl border border-brand-blue/20 bg-brand-blue/[0.06] px-4 py-3 text-sm text-brand-blue">Project updated successfully.</p> : null}
      {query.saved === "installation-item" ? <p className="rounded-xl border border-brand-blue/20 bg-brand-blue/[0.06] px-4 py-3 text-sm text-brand-blue">Installed item recorded successfully.</p> : null}
      {query.saved === "payment-adjustment" ? <p className="rounded-xl border border-brand-blue/20 bg-brand-blue/[0.06] px-4 py-3 text-sm text-brand-blue">Payment correction recorded with an audit entry.</p> : null}

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="surface-card p-5 sm:p-7">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-blue">Work summary</p>
              <h2 className="mt-2 font-heading text-2xl tracking-tight text-ink">Project details</h2>
            </div>
            <PortalStatusBadge value={project.status} />
          </div>
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <div><p className="text-xs font-semibold uppercase tracking-[0.14em] copy-muted">Customer</p><p className="mt-1 text-sm text-ink"><Link href={`/portal/customers/${project.customerId}`} className="font-semibold text-brand-blue hover:underline">{project.customerName}</Link></p></div>
            <div><p className="text-xs font-semibold uppercase tracking-[0.14em] copy-muted">Project type</p><p className="mt-1 text-sm text-ink">{project.projectType}</p></div>
            <div><p className="text-xs font-semibold uppercase tracking-[0.14em] copy-muted">Area / locality</p><p className="mt-1 text-sm text-ink">{project.area ?? "Not set"}</p></div>
            <div><p className="text-xs font-semibold uppercase tracking-[0.14em] copy-muted">Planned installation</p><p className="mt-1 text-sm text-ink">{formatPortalDate(project.plannedInstallDate)}</p></div>
            <div><p className="text-xs font-semibold uppercase tracking-[0.14em] copy-muted">Estimated amount</p><p className="mt-1 text-sm text-ink">{formatPortalNpr(project.estimatedAmount)}</p></div>
            <div><p className="text-xs font-semibold uppercase tracking-[0.14em] copy-muted">Site address</p><p className="mt-1 text-sm text-ink">{project.siteAddress ?? "Not set"}</p></div>
            <div><p className="text-xs font-semibold uppercase tracking-[0.14em] copy-muted">Map location</p><p className="mt-1 text-sm text-ink">{project.siteLatitude !== null && project.siteLongitude !== null ? `${project.siteLatitude}, ${project.siteLongitude}` : "Not pinned"}{mapHref ? <a href={mapHref} target="_blank" rel="noreferrer" className="ml-2 font-semibold text-brand-blue hover:underline">Open map</a> : null}</p></div>
            <div className="sm:col-span-2"><p className="text-xs font-semibold uppercase tracking-[0.14em] copy-muted">Site instructions</p><p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-ink">{project.siteInstructions ?? "No site instructions added."}</p></div>
            <div><p className="text-xs font-semibold uppercase tracking-[0.14em] copy-muted">Warranty start</p><p className="mt-1 text-sm text-ink">{formatPortalDate(project.warrantyStartDate)}</p></div>
            <div><p className="text-xs font-semibold uppercase tracking-[0.14em] copy-muted">Warranty ends</p><p className="mt-1 text-sm text-ink">{formatPortalDate(project.warrantyEndDate)}</p></div>
            <div className="sm:col-span-2"><p className="text-xs font-semibold uppercase tracking-[0.14em] copy-muted">Notes</p><p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-ink">{project.notes ?? "No notes added."}</p></div>
          </div>
          <p className="mt-6 border-t border-line pt-4 text-xs copy-muted">Created {formatPortalDateTime(project.createdAt)}</p>
        </section>

        <section className="surface-card p-5 sm:p-7">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-blue">History</p>
          <h2 className="mt-2 font-heading text-2xl tracking-tight text-ink">Activity</h2>
          <div className="mt-5"><PortalActivityList activities={activities} /></div>
        </section>
      </div>

      <section className="surface-card p-5 sm:p-7">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-blue">Survey record</p>
            <h2 className="mt-2 font-heading text-2xl tracking-tight text-ink">Site surveys</h2>
            <p className="mt-2 text-sm leading-6 copy-muted">Keep technical findings and customer requirements connected to the project. Detailed fields are optional so a quick survey can be recorded without slowing down the team.</p>
          </div>
        </div>

        {user.role === "owner" || user.role === "manager" || user.role === "staff" ? (
          <div className="mt-5 rounded-xl border border-line bg-surface-strong/40 p-4 sm:p-5">
            <h3 className="font-heading text-xl text-ink">Record a site survey</h3>
            <div className="mt-4"><SiteSurveyForm projectId={project.id} users={surveyUsers.map((member) => ({ id: member.id, name: member.name, role: member.role }))} today={today} /></div>
          </div>
        ) : null}

        {surveys.length ? (
          <div className="mt-6 space-y-4">
            {surveys.map((survey) => (
              <article key={survey.id} className="rounded-xl border border-line bg-white p-4 sm:p-5">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div><p className="font-semibold text-ink">Survey {formatPortalDateTime(survey.surveyDate)}</p><p className="mt-1 text-xs copy-muted">Recorded by {survey.recordedByName}{survey.surveyorName ? ` · Surveyor: ${survey.surveyorName}` : ""}</p></div>
                  {survey.outcome ? <span className="rounded-full bg-brand-blue/[0.08] px-3 py-1 text-xs font-semibold text-brand-blue">{survey.outcome}</span> : null}
                </div>
                <div className="mt-4 grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-3">
                  {survey.propertyType ? <div><p className="text-xs font-semibold uppercase tracking-[0.14em] copy-muted">Property</p><p className="mt-1 text-ink">{survey.propertyType}</p></div> : null}
                  {survey.installationArea ? <div><p className="text-xs font-semibold uppercase tracking-[0.14em] copy-muted">Installation area</p><p className="mt-1 text-ink">{survey.installationArea}</p></div> : null}
                  {survey.cameraCount !== null || survey.cameraType ? <div><p className="text-xs font-semibold uppercase tracking-[0.14em] copy-muted">Camera plan</p><p className="mt-1 text-ink">{survey.cameraCount ?? "Count not set"}{survey.cameraType ? ` · ${survey.cameraType}` : ""}</p></div> : null}
                  {survey.cableLength !== null ? <div><p className="text-xs font-semibold uppercase tracking-[0.14em] copy-muted">Cable estimate</p><p className="mt-1 text-ink">{survey.cableLength} m</p></div> : null}
                </div>
                <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                  {[["Indoor / outdoor", survey.indoorOutdoor], ["Cable routes", survey.cableRoutes], ["Storage", survey.storageRequirements], ["Networking / power", survey.networkingNeeds], ["Mounting / access", survey.mountingConstraints], ["Customer requirements", survey.customerRequirements], ["Next steps", survey.nextSteps]].filter(([, value]) => value).map(([label, value]) => <div key={label as string}><p className="text-xs font-semibold uppercase tracking-[0.14em] copy-muted">{label}</p><p className="mt-1 whitespace-pre-wrap leading-6 text-ink">{value}</p></div>)}
                </div>
              </article>
            ))}
          </div>
        ) : <p className="mt-6 rounded-xl border border-dashed border-line px-4 py-8 text-center text-sm copy-muted">No site surveys recorded yet.</p>}
      </section>

      <section className="surface-card p-5 sm:p-7">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-blue">Commercial records</p>
            <h2 className="mt-2 font-heading text-2xl tracking-tight text-ink">Quotations and payments</h2>
            <p className="mt-2 text-sm leading-6 copy-muted">Record payments against this project. Gateway verification is not connected yet, so each entry is a manual business record.</p>
          </div>
          <Link href="/portal/quotations" className="action-secondary">Open quotations</Link>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-line bg-white p-4"><p className="text-xs font-semibold uppercase tracking-[0.14em] copy-muted">Commercial total</p><p className="mt-2 font-heading text-2xl text-ink">{formatPortalNpr(commercialTotal)}</p></div>
          <div className="rounded-xl border border-line bg-white p-4"><p className="text-xs font-semibold uppercase tracking-[0.14em] copy-muted">Paid so far</p><p className="mt-2 font-heading text-2xl text-ink">{formatPortalNpr(project.amountPaid)}</p></div>
          <div className="rounded-xl border border-line bg-white p-4"><p className="text-xs font-semibold uppercase tracking-[0.14em] copy-muted">Remaining balance</p><p className="mt-2 font-heading text-2xl text-ink">{formatPortalNpr(balance)}</p></div>
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
          {user.role === "owner" || user.role === "manager" || user.role === "staff" ? (
            <div className="rounded-xl border border-line bg-surface-strong/40 p-4 sm:p-5">
              <h3 className="font-heading text-xl text-ink">Record a payment</h3>
              <div className="mt-4"><PaymentForm projectId={project.id} quotations={quotations.map((quotation) => ({ id: quotation.id, reference: quotation.reference }))} today={today} /></div>
            </div>
          ) : null}

          <div>
            <h3 className="font-heading text-xl text-ink">Payment history</h3>
            {payments.length ? (
              <div className="mt-4 space-y-3">
                {payments.map((payment) => (
                  <div key={payment.id} className="rounded-xl border border-line bg-white p-4">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div><p className="font-semibold text-ink">{formatPortalNpr(payment.amount)} · {payment.method.replace("fonepay", "Fonepay QR")}</p><p className="mt-1 text-xs copy-muted">{formatPortalDate(payment.paidAt)} · Recorded by {payment.recordedByName}</p></div>
                      {payment.quotationReference ? <Link href={`/portal/quotations/${payment.quotationId}`} className="text-xs font-semibold text-brand-blue hover:underline">{payment.quotationReference}</Link> : null}
                    </div>
                    {payment.reference || payment.notes ? <p className="mt-3 border-t border-line pt-3 text-sm leading-6 text-ink">{[payment.reference, payment.notes].filter(Boolean).join(" · ")}</p> : null}
                  </div>
                ))}
              </div>
            ) : <p className="mt-4 rounded-xl border border-dashed border-line px-4 py-8 text-center text-sm copy-muted">No payments recorded yet.</p>}
            {paymentAdjustments.length ? <div className="mt-6"><h3 className="font-heading text-xl text-ink">Corrections and refunds</h3><div className="mt-4 space-y-3">{paymentAdjustments.map((adjustment) => <div key={adjustment.id} className="rounded-xl border border-brand-red/20 bg-brand-red/[0.03] p-4"><div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between"><div><p className="font-semibold text-ink">{adjustment.type === "refund" ? "Refund" : "Reversal / correction"} · {formatPortalNpr(adjustment.amount)}</p><p className="mt-1 text-xs copy-muted">Recorded by {adjustment.recordedByName} · {formatPortalDateTime(adjustment.createdAt)}</p></div><span className="text-xs copy-muted">{adjustment.paymentReference ?? "Original payment"}</span></div><p className="mt-3 border-t border-line pt-3 text-sm leading-6 text-ink">{adjustment.reason}</p></div>)}</div></div> : null}
          </div>
        </div>
        {user.role === "owner" || user.role === "manager" || user.role === "staff" ? <div className="mt-6 rounded-xl border border-line bg-surface-strong/40 p-4 sm:p-5 print:hidden"><h3 className="font-heading text-xl text-ink">Correct a payment</h3><p className="mt-2 text-sm leading-6 copy-muted">Corrections never delete the original payment. Record a refund or reversal with a reason and the balance will be reduced.</p><div className="mt-4"><PaymentAdjustmentForm projectId={project.id} payments={payments.map((payment) => ({ id: payment.id, label: `${formatPortalNpr(payment.amount)} · ${formatPortalDate(payment.paidAt)}${payment.reference ? ` · ${payment.reference}` : ""}` }))} /></div></div> : null}
      </section>

      <section className="surface-card p-5 sm:p-7">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-blue">Handover record</p>
            <h2 className="mt-2 font-heading text-2xl tracking-tight text-ink">Installed equipment</h2>
            <p className="mt-2 text-sm leading-6 copy-muted">Record what was actually installed. This can differ from the quotation and keeps serial numbers and handover notes with the project.</p>
          </div>
        </div>

          {user.role === "owner" || user.role === "manager" || user.role === "staff" ? (
          <div className="mt-5 rounded-xl border border-line bg-surface-strong/40 p-4 sm:p-5">
            <h3 className="font-heading text-xl text-ink">Add installed item</h3>
            <div className="mt-4"><InstallationItemForm projectId={project.id} /></div>
          </div>
        ) : null}

        {installationItems.length ? (
          <div className="mt-6 grid gap-3 lg:grid-cols-2">
            {installationItems.map((item) => (
              <div key={item.id} className="rounded-xl border border-line bg-white p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="font-semibold text-ink">{item.description}</p>
                    <p className="mt-1 text-xs copy-muted">Recorded by {item.recordedByName} · {formatPortalDateTime(item.createdAt)}</p>
                  </div>
                  <span className="rounded-full bg-brand-blue/[0.08] px-3 py-1 text-xs font-semibold text-brand-blue">Installed: {item.installedQuantity}</span>
                </div>
                <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                  <div><p className="text-xs font-semibold uppercase tracking-[0.14em] copy-muted">Quoted quantity</p><p className="mt-1 text-ink">{item.quotedQuantity ?? "Not recorded"}</p></div>
                  <div><p className="text-xs font-semibold uppercase tracking-[0.14em] copy-muted">Serial / asset number</p><p className="mt-1 text-ink">{item.serialNumber ?? "Not recorded"}</p></div>
                </div>
                {item.notes ? <p className="mt-4 border-t border-line pt-3 text-sm leading-6 text-ink">{item.notes}</p> : null}
              </div>
            ))}
          </div>
        ) : <p className="mt-6 rounded-xl border border-dashed border-line px-4 py-8 text-center text-sm copy-muted">No installed equipment has been recorded yet.</p>}
      </section>

      {user.role === "owner" || user.role === "manager" || user.role === "staff" ? (
        <section className="surface-card p-5 sm:p-7 print:hidden">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-blue">Maintain work item</p>
          <h2 className="mt-2 font-heading text-2xl tracking-tight text-ink">Update project</h2>
          <p className="mt-2 text-sm leading-6 copy-muted">Update the current stage and site details. Commercial totals and payment records are shown separately below.</p>
          <div className="mt-5"><EditProjectForm project={project} /></div>
        </section>
      ) : null}
    </div>
  );
}
