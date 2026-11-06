import { redirect } from "next/navigation";
import { getCurrentPortalUser } from "@/lib/portal/auth";

export const runtime = "nodejs";

export default async function PortalIndexPage() {
  const user = await getCurrentPortalUser();
  redirect(user ? "/portal/dashboard" : "/portal/login");
}
