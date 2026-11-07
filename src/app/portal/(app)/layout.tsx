import { PortalShell } from "@/components/portal/portal-shell";
import { requirePortalUser } from "@/lib/portal/auth";
import { getNotifications } from "@/lib/portal/queries";

export const runtime = "nodejs";

export default async function PortalAppLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const user = await requirePortalUser();
  const initialNotifications = await getNotifications(user.id, 12);
  return <PortalShell user={user} initialNotifications={initialNotifications}>{children}</PortalShell>;
}
