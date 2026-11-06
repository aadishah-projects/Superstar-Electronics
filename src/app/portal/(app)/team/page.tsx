import { DeactivateAccountButton, InviteForm, UpdateRoleForm } from "@/components/portal/portal-forms";
import { PortalPageHeader } from "@/components/portal/portal-ui";
import { requirePortalUser } from "@/lib/portal/auth";
import { getActiveUsers } from "@/lib/portal/queries";
import { portalRoleLabels } from "@/lib/portal/types";

export const runtime = "nodejs";

export default async function PortalTeamPage() {
  await requirePortalUser(["owner"]);
  const users = getActiveUsers();

  return (
    <div className="space-y-6">
      <PortalPageHeader eyebrow="Access management" title="Team" description="Owners can invite account holders, choose their access role, and deactivate access when someone leaves the business." />

      <div className="grid gap-6 xl:grid-cols-[0.75fr_1.25fr]">
        <section className="surface-card p-5 sm:p-7">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-blue">Invite account</p>
          <h2 className="mt-2 font-heading text-2xl tracking-tight text-ink">Add a team member</h2>
          <p className="mt-2 text-sm leading-6 copy-muted">Technicians and staff do not register themselves. Create an invite here, copy the one-time private link, and send it directly to the team member.</p>
          <div className="mt-4 rounded-xl border border-brand-blue/20 bg-brand-blue/[0.04] p-4 text-xs leading-5 text-ink"><span className="font-semibold">Invite flow:</span> owner creates invite → team member opens link → creates password → signs in at <span className="font-semibold">/portal/login</span>.</div>
          <div className="mt-5"><InviteForm /></div>
        </section>

        <section className="surface-card min-w-0 p-5 sm:p-7">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-blue">Accounts</p>
          <h2 className="mt-2 font-heading text-2xl tracking-tight text-ink">{users.length} team members</h2>
          <div className="mt-5 space-y-3">
            {users.map((user) => (
              <article key={user.id} className={`flex flex-col gap-3 rounded-xl border border-line bg-white p-4 sm:flex-row sm:items-center sm:justify-between ${user.isActive ? "" : "opacity-60"}`}>
                <div>
                  <p className="font-heading text-xl text-ink">{user.name}</p>
                  <p className="mt-1 text-sm copy-muted">{user.email} · {portalRoleLabels[user.role]}</p>
                  <p className="mt-1 text-xs copy-muted">WhatsApp / phone: {user.phone ?? "Not set"}</p>
                </div>
                <div className="space-y-3 text-left sm:min-w-64 sm:text-right">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-blue">{user.isActive ? "Active" : "Inactive"}</p>
                  {user.isActive ? <UpdateRoleForm userId={user.id} role={user.role} /> : null}
                  {user.isActive ? <div className="mt-2"><DeactivateAccountButton userId={user.id} /></div> : null}
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
