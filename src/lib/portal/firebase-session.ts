import { cookies } from "next/headers";
import { getFirebaseAdminAuth } from "@/lib/integrations/firebase-admin";
import { getFirestorePortalUser } from "@/lib/portal/firestore-users";
import { ensureSqlitePortalShadowUser } from "@/lib/portal/shadow-user";

const firebaseSessionCookieName = "sse_firebase_session";
const defaultSessionDays = 7;

function getSessionDurationMs() {
  const days = Number(process.env.PORTAL_SESSION_TTL_DAYS ?? defaultSessionDays);
  const safeDays = Number.isFinite(days) && days > 0 ? Math.min(days, 14) : defaultSessionDays;
  return safeDays * 24 * 60 * 60 * 1000;
}

export async function startFirebasePortalSession(idToken: string) {
  const auth = getFirebaseAdminAuth();
  const decoded = await auth.verifyIdToken(idToken);
  const portalUser = await getFirestorePortalUser(decoded.uid);
  if (!portalUser?.isActive) {
    throw new Error("This Firebase account is not enabled for the business portal.");
  }
  const sessionCookie = await auth.createSessionCookie(idToken, { expiresIn: getSessionDurationMs() });
  const cookieStore = await cookies();
  cookieStore.set(firebaseSessionCookieName, sessionCookie, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    expires: new Date(Date.now() + getSessionDurationMs()),
    path: "/",
  });
  return decoded.uid;
}

export async function endFirebasePortalSession() {
  const cookieStore = await cookies();
  cookieStore.delete(firebaseSessionCookieName);
}

export async function getCurrentFirebasePortalUser() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(firebaseSessionCookieName)?.value;
  if (!sessionCookie) return null;

  try {
    const decoded = await getFirebaseAdminAuth().verifySessionCookie(sessionCookie, true);
    const user = await getFirestorePortalUser(decoded.uid);
    if (!user?.isActive) return null;
    await ensureSqlitePortalShadowUser(user);
    return user;
  } catch {
    cookieStore.delete(firebaseSessionCookieName);
    return null;
  }
}
