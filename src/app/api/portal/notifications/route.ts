import { getCurrentPortalUser } from "@/lib/portal/auth";
import { getNotifications } from "@/lib/portal/queries";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentPortalUser();
  if (!user) return Response.json({ error: "Authentication required." }, { status: 401 });

  const notifications = await getNotifications(user.id, 12);
  return Response.json({ notifications }, { headers: { "Cache-Control": "no-store" } });
}
