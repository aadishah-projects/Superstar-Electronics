import Link from "next/link";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/portal/portal-forms";
import { getCurrentPortalUser } from "@/lib/portal/auth";
import { countUsers } from "@/lib/portal/db";

export const runtime = "nodejs";

export default async function PortalLoginPage() {
  if (await getCurrentPortalUser()) {
    redirect("/portal/dashboard");
  }

  const hasUsers = countUsers() > 0;

  return (
    <section className="page-section pt-8 sm:pt-14">
      <div className="mx-auto max-w-xl px-4 sm:px-6">
        <div className="surface-card-strong p-6 sm:p-10">
          <p className="section-kicker">Private workspace</p>
          <h1 className="mt-5 font-heading text-3xl tracking-tight text-ink sm:text-4xl">Sign in to the business portal</h1>
              <p className="mt-3 text-sm leading-7 copy-muted sm:text-base">For authorized owners, website managers, staff, and technicians. Customers can submit support requests from the public website.</p>
          {hasUsers ? <LoginForm /> : (
            <div className="mt-6 rounded-xl border border-brand-blue/20 bg-brand-blue/[0.06] p-4 text-sm leading-6 text-brand-blue">
              No owner account exists yet. Complete the secure <Link href="/portal/setup" className="font-semibold underline">initial setup</Link> first.
            </div>
          )}
          {hasUsers ? <div className="mt-6 grid gap-3 rounded-2xl border border-line bg-surface-strong/60 p-4 sm:grid-cols-2 lg:grid-cols-4"><div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-blue">Owner</p><p className="mt-1 text-xs leading-5 copy-muted">Controls accounts, approvals, and business settings.</p></div><div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-blue">Website manager</p><p className="mt-1 text-xs leading-5 copy-muted">Maintains the public catalog and day-to-day sales workspace.</p></div><div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-blue">Staff</p><p className="mt-1 text-xs leading-5 copy-muted">Handles customers, projects, quotations, and support.</p></div><div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-blue">Technician</p><p className="mt-1 text-xs leading-5 copy-muted">Uses an owner-issued invite to access assigned jobs.</p></div></div> : null}
          {hasUsers ? <p className="mt-4 text-xs leading-5 copy-muted">There is no public technician sign-up. Ask an owner to invite you from <span className="font-semibold text-ink">Team</span>; open the private invite link, create your password, then sign in here.</p> : null}
          <Link href="/" className="mt-6 inline-flex text-sm font-semibold text-brand-blue hover:underline">Return to public website</Link>
        </div>
      </div>
    </section>
  );
}
