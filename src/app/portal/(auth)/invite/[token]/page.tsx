import Link from "next/link";
import { AcceptInviteForm } from "@/components/portal/portal-forms";
import { getInvite, hashToken, nowIso } from "@/lib/portal/db";
import { portalRoleLabels } from "@/lib/portal/types";

export const runtime = "nodejs";

export default async function PortalInvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const invite = getInvite(hashToken(token));
  const valid = Boolean(invite && !invite.used_at && invite.expires_at > nowIso());

  return (
    <section className="page-section pt-8 sm:pt-14">
      <div className="mx-auto max-w-xl px-4 sm:px-6">
        <div className="surface-card-strong p-6 sm:p-10">
          <p className="section-kicker">Account invitation</p>
          {valid && invite ? (
            <>
              <h1 className="mt-5 font-heading text-3xl tracking-tight text-ink sm:text-4xl">Activate your portal account</h1>
              <p className="mt-3 text-sm leading-7 copy-muted sm:text-base">An owner invited you to join as <strong className="text-ink">{portalRoleLabels[invite.role]}</strong> using <strong className="text-ink">{invite.email}</strong>.</p>
              <div className="mt-5 grid gap-3 rounded-2xl border border-brand-blue/20 bg-brand-blue/[0.04] p-4 text-sm"><p className="font-semibold text-ink">Your setup steps</p><ol className="list-decimal space-y-1.5 pl-5 leading-6 copy-muted"><li>Create a private password below.</li><li>Sign in from the Staff Portal Login page.</li><li>Use only the areas allowed for your role.</li></ol></div>
              <AcceptInviteForm token={token} />
            </>
          ) : (
            <>
              <h1 className="mt-5 font-heading text-3xl tracking-tight text-ink sm:text-4xl">This invite is no longer valid</h1>
              <p className="mt-3 text-sm leading-7 copy-muted sm:text-base">Ask an owner to create a new invitation.</p>
            </>
          )}
          <Link href="/portal/login" className="mt-6 inline-flex text-sm font-semibold text-brand-blue hover:underline">Go to sign in</Link>
        </div>
      </div>
    </section>
  );
}
