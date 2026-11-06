import Link from "next/link";
import { redirect } from "next/navigation";
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
    <section className="page-section pt-8 sm:pt-14">
      <div className="mx-auto max-w-xl px-4 sm:px-6">
        <div className="surface-card-strong p-6 sm:p-10">
          <p className="section-kicker">One-time setup</p>
          <h1 className="mt-5 font-heading text-3xl tracking-tight text-ink sm:text-4xl">Create the first owner account</h1>
          <p className="mt-3 text-sm leading-7 copy-muted sm:text-base">Use the bootstrap key configured in your local environment. The configured email is restricted to the approved owner address.</p>
          <SetupOwnerForm />
          <Link href="/portal/login" className="mt-6 inline-flex text-sm font-semibold text-brand-blue hover:underline">Back to sign in</Link>
        </div>
      </div>
    </section>
  );
}
