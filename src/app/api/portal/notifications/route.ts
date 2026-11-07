import { getCurrentPortalUser } from "@/lib/portal/auth";
import { getNotifications, markAllPortalNotificationsRead, markPortalNotificationRead } from "@/lib/portal/queries";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentPortalUser();
  if (!user) return Response.json({ error: "Authentication required." }, { status: 401 });

  const notifications = await getNotifications(user.id, 12);
  return Response.json({ notifications }, { headers: { "Cache-Control": "no-store" } });
}

export async function PATCH(request: Request) {
  const user = await getCurrentPortalUser();
  if (!user) return Response.json({ error: "Authentication required." }, { status: 401 });

  const body = await request.json().catch(() => ({})) as { notificationId?: unknown; all?: unknown };
  if (body.all === true) {
    await markAllPortalNotificationsRead(user.id);
  } else if (typeof body.notificationId === "string" && body.notificationId.trim()) {
    await markPortalNotificationRead(user.id, body.notificationId);
  } else {
    return Response.json({ error: "Choose a notification to mark read." }, { status: 400 });
  }

  const notifications = await getNotifications(user.id, 12);
  return Response.json({ notifications }, { headers: { "Cache-Control": "no-store" } });
}
