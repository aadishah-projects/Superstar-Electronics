import Link from "next/link";
import { PortalAuthShell } from "@/components/portal/portal-auth-shell";
import { AcceptInviteForm } from "@/components/portal/portal-forms";
import { getInvite, hashToken, nowIso } from "@/lib/portal/db";
import { portalRoleLabels } from "@/lib/portal/types";

export const runtime = "nodejs";

export default async function PortalInvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const invite = getInvite(hashToken(token));
  const valid = Boolean(invite && !invite.used_at && invite.expires_at > nowIso());

  return (
    <PortalAuthShell eyebrow="Account invitation" title={valid && invite ? "Activate your portal account" : "This invite is no longer valid"} description={valid && invite ? `An owner invited you to join as ${portalRoleLabels[invite.role]} using ${invite.email}.` : "Ask an owner to create a new invitation."}>
      {valid && invite ? <>
        <div className="mt-7 grid gap-3 rounded-2xl border border-[#b9d5fb] bg-[#eef5ff] p-4 text-sm"><p className="font-semibold text-[#1d426f]">Your setup steps</p><ol className="list-decimal space-y-1.5 pl-5 leading-6 text-[#6f8197]"><li>Create a private password below.</li><li>Sign in from the Staff Portal Login page.</li><li>Use only the areas allowed for your role.</li></ol></div>
        <AcceptInviteForm token={token} />
      </> : null}
      <Link href="/portal/login" className="mt-6 inline-flex text-sm font-semibold text-[#1d4f89] hover:text-[#1463d7] hover:underline">Go to sign in</Link>
    </PortalAuthShell>
  );
}
