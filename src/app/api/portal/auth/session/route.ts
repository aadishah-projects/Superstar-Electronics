import { startFirebasePortalSession } from "@/lib/portal/firebase-session";
import { getPortalAuthBackend } from "@/lib/portal/backend";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (getPortalAuthBackend() !== "firestore") {
    return Response.json({ error: "Firebase portal authentication is not enabled." }, { status: 404 });
  }

  try {
    const body = await request.json() as { idToken?: unknown };
    if (typeof body.idToken !== "string" || body.idToken.length < 20) {
      return Response.json({ error: "A valid Firebase sign-in token is required." }, { status: 400 });
    }

    await startFirebasePortalSession(body.idToken);
    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: "Unable to create a portal session." }, { status: 401 });
  }
}
