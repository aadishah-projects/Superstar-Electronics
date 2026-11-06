import Link from "next/link";
import { ProjectForm } from "@/components/portal/portal-forms";
import { PortalPageHeader, PortalStatusBadge, formatPortalDate, formatPortalNpr } from "@/components/portal/portal-ui";
import { requirePortalUser } from "@/lib/portal/auth";
import { getCustomers, getProjects } from "@/lib/portal/queries";

export const runtime = "nodejs";

export default async function PortalProjectsPage({ searchParams }: { searchParams: Promise<{ saved?: string; q?: string; status?: string }> }) {
  await requirePortalUser();
  const params = await searchParams;
  const customers = getCustomers();
  const projects = getProjects({ search: params.q, status: params.status });

  return (
    <div className="space-y-6">
      <PortalPageHeader eyebrow="Work tracking" title="Projects" description="Create an installation or service project, record its current stage, and keep the customer site details available to the team." />
      {params.saved === "project" ? <p className="rounded-xl border border-brand-blue/20 bg-brand-blue/[0.06] px-4 py-3 text-sm text-brand-blue">Project saved successfully.</p> : null}

      <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <section className="surface-card p-5 sm:p-7">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-blue">New work item</p>
          <h2 className="mt-2 font-heading text-2xl tracking-tight text-ink">Create project</h2>
          <p className="mt-2 text-sm leading-6 copy-muted">Keep project stages, payment state, and the one-year warranty window visible as separate business records.</p>
          <div className="mt-5"><ProjectForm customers={customers.map((customer) => ({ id: customer.id, name: customer.name, phonePrimary: customer.phonePrimary }))} /></div>
        </section>

        <section className="surface-card min-w-0 p-5 sm:p-7">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-blue">Work pipeline</p>
            <h2 className="mt-2 font-heading text-2xl tracking-tight text-ink">{projects.length} projects</h2>
          </div>
          <form method="get" className="mt-5 grid gap-3 sm:grid-cols-[1fr_13rem_auto]">
            <input name="q" defaultValue={params.q ?? ""} placeholder="Search reference, title, customer, site" className="h-11 rounded-xl border border-line bg-white px-3 text-sm outline-none focus:border-brand-blue" />
            <select name="status" defaultValue={params.status ?? ""} className="h-11 rounded-xl border border-line bg-white px-3 text-sm outline-none focus:border-brand-blue">
              <option value="">All stages</option><option value="new-enquiry">New enquiry</option><option value="survey-scheduled">Survey scheduled</option><option value="survey-completed">Survey completed</option><option value="quotation-preparation">Quotation preparation</option><option value="quotation-sent">Quotation sent</option><option value="awaiting-approval">Awaiting approval</option><option value="approved">Approved</option><option value="installation-scheduled">Installation scheduled</option><option value="installation-in-progress">Installation in progress</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option>
            </select>
            <button type="submit" className="action-secondary">Filter</button>
          </form>
          {projects.length ? (
            <div className="mt-5 space-y-3">
              {projects.map((project) => (
                <article key={project.id} className="rounded-xl border border-line bg-white p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-blue"><Link href={`/portal/projects/${project.id}`} className="hover:underline">{project.reference}</Link></p>
                      <h3 className="mt-1 font-heading text-xl text-ink"><Link href={`/portal/projects/${project.id}`} className="hover:text-brand-blue">{project.title}</Link></h3>
                      <p className="mt-1 text-sm copy-muted">{project.customerName} · {project.projectType}</p>
                    </div>
                    <PortalStatusBadge value={project.status} />
                  </div>
                  <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm copy-muted">
                    {project.area ? <span>{project.area}</span> : null}
                    {project.siteAddress ? <span>{project.siteAddress}</span> : null}
                    <span>Planned: {formatPortalDate(project.plannedInstallDate)}</span>
                    {project.estimatedAmount !== null ? <span>{formatPortalNpr(project.estimatedAmount)}</span> : null}
                  </div>
                  {project.notes ? <p className="mt-3 border-t border-line pt-3 text-sm leading-6 text-ink">{project.notes}</p> : null}
                  <Link href={`/portal/projects/${project.id}`} className="mt-4 inline-flex text-sm font-semibold text-brand-blue hover:underline">Open project record</Link>
                </article>
              ))}
            </div>
          ) : <p className="mt-6 rounded-xl border border-dashed border-line px-4 py-8 text-center text-sm copy-muted">No projects recorded yet.</p>}
        </section>
      </div>
    </div>
  );
}
