import { PortalShell } from "@/components/portal/portal-shell";
import { requirePortalUser } from "@/lib/portal/auth";

export const runtime = "nodejs";

export default async function PortalAppLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const user = await requirePortalUser();
  return <PortalShell user={user}>{children}</PortalShell>;
}
