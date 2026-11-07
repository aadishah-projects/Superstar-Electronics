import Link from "next/link";
import { redirect } from "next/navigation";
import { PortalAuthShell } from "@/components/portal/portal-auth-shell";
import { LoginForm } from "@/components/portal/portal-forms";
import { FirebaseLoginForm } from "@/components/portal/firebase-login-form";
import { getCurrentPortalUser } from "@/lib/portal/auth";
import { countUsers } from "@/lib/portal/db";
import { countFirestorePortalUsers } from "@/lib/portal/firestore-users";
import { getPortalAuthBackend } from "@/lib/portal/backend";

export const runtime = "nodejs";

export default async function PortalLoginPage() {
  if (await getCurrentPortalUser()) {
    redirect("/portal/dashboard");
  }

  const authBackend = getPortalAuthBackend();
  let hasUsers = false;
  try {
    // If Firestore is temporarily quota-limited, still render the Firebase
    // sign-in form so an existing staff member receives a useful login path.
    hasUsers = authBackend === "firestore" ? (await countFirestorePortalUsers()) > 0 : countUsers() > 0;
  } catch {
    hasUsers = authBackend === "firestore";
  }

  return (
    <PortalAuthShell eyebrow="Private workspace" title="Sign in to the business portal" description="For authorized owners, website managers, staff, and technicians. Customers can submit support requests from the public website.">
      {hasUsers ? (authBackend === "firestore" ? <FirebaseLoginForm /> : <LoginForm />) : (
        <div className="mt-8 rounded-2xl border border-[#b9d5fb] bg-[#eef5ff] p-4 text-sm leading-6 text-[#1b559f]">
          No owner account exists yet. Complete the secure <Link href="/portal/setup" className="font-semibold underline underline-offset-2">initial setup</Link> first.
        </div>
      )}
      {hasUsers ? <>
        <div className="mt-8 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-[#dce6f2] bg-[#f8fbff] p-3"><p className="text-[0.62rem] font-bold uppercase tracking-[0.14em] text-[#1463d7]">Owner</p><p className="mt-1 text-xs leading-5 text-[#73849a]">Approvals & settings</p></div>
          <div className="rounded-2xl border border-[#dce6f2] bg-[#f8fbff] p-3"><p className="text-[0.62rem] font-bold uppercase tracking-[0.14em] text-[#1463d7]">Manager</p><p className="mt-1 text-xs leading-5 text-[#73849a]">Catalog & daily sales</p></div>
          <div className="rounded-2xl border border-[#dce6f2] bg-[#f8fbff] p-3"><p className="text-[0.62rem] font-bold uppercase tracking-[0.14em] text-[#1463d7]">Staff</p><p className="mt-1 text-xs leading-5 text-[#73849a]">Customers & support</p></div>
          <div className="rounded-2xl border border-[#dce6f2] bg-[#f8fbff] p-3"><p className="text-[0.62rem] font-bold uppercase tracking-[0.14em] text-[#1463d7]">Technician</p><p className="mt-1 text-xs leading-5 text-[#73849a]">Assigned field jobs</p></div>
        </div>
        <p className="mt-5 text-xs leading-5 text-[#7d8da0]">Technicians join through an owner-issued invite from <span className="font-semibold text-[#31516f]">Team</span>. There is no public technician sign-up.</p>
      </> : null}
      <Link href="/" className="mt-6 inline-flex text-sm font-semibold text-[#1d4f89] hover:text-[#1463d7] hover:underline">Return to public website</Link>
    </PortalAuthShell>
  );
}
