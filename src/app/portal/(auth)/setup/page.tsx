import Link from "next/link";
import { redirect } from "next/navigation";
import { PortalAuthShell } from "@/components/portal/portal-auth-shell";
import { SetupOwnerForm } from "@/components/portal/portal-forms";
import { getCurrentPortalUser } from "@/lib/portal/auth";
import { countUsers } from "@/lib/portal/db";

export const runtime = "nodejs";

export default async function PortalSetupPage() {
  if (await getCurrentPortalUser()) {
    redirect("/portal/dashboard");
  }

  if (countUsers() > 0) {
    redirect("/portal/login");
  }

  return (
    <PortalAuthShell eyebrow="One-time setup" title="Create the first owner account" description="Use the bootstrap key configured in your local environment. The configured email is restricted to the approved owner address.">
      <SetupOwnerForm />
      <Link href="/portal/login" className="mt-6 inline-flex text-sm font-semibold text-[#1d4f89] hover:text-[#1463d7] hover:underline">Back to sign in</Link>
    </PortalAuthShell>
  );
}
