import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  createSession,
  createToken,
  deleteSession,
  getUserBySessionHash,
  hashToken,
} from "@/lib/portal/db";
import type { PortalRole, PortalUser } from "@/lib/portal/types";
import { getPortalAuthBackend } from "@/lib/portal/backend";
import { endFirebasePortalSession, getCurrentFirebasePortalUser } from "@/lib/portal/firebase-session";

const sessionCookieName = "sse_portal_session";
const defaultSessionDays = 7;

function toPortalUser(row: ReturnType<typeof getUserBySessionHash>): PortalUser | null {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    email: row.email,
    name: row.name,
    phone: row.phone,
    role: row.role,
    isActive: row.is_active === 1,
  };
}

export async function startPortalSession(userId: string) {
  const rawToken = createToken();
  const tokenHash = hashToken(rawToken);
  const sessionDays = Number(process.env.PORTAL_SESSION_TTL_DAYS ?? defaultSessionDays);
  const expiresAt = new Date(Date.now() + sessionDays * 24 * 60 * 60 * 1000);

  createSession(userId, tokenHash, expiresAt.toISOString());
  const cookieStore = await cookies();
  cookieStore.set(sessionCookieName, rawToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    path: "/",
  });
}

export async function endPortalSession() {
  if (getPortalAuthBackend() === "firestore") {
    await endFirebasePortalSession();
    return;
  }

  const cookieStore = await cookies();
  const rawToken = cookieStore.get(sessionCookieName)?.value;

  if (rawToken) {
    deleteSession(hashToken(rawToken));
  }

  cookieStore.delete(sessionCookieName);
}

export async function getCurrentPortalUser() {
  if (getPortalAuthBackend() === "firestore") {
    return getCurrentFirebasePortalUser();
  }

  const cookieStore = await cookies();
  const rawToken = cookieStore.get(sessionCookieName)?.value;
  return rawToken ? toPortalUser(getUserBySessionHash(hashToken(rawToken))) : null;
}

export async function requirePortalUser(allowedRoles?: PortalRole[]) {
  const user = await getCurrentPortalUser();

  if (!user) {
    redirect("/portal/login");
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    redirect("/portal/dashboard?error=forbidden");
  }

  return user;
}

export function isOwner(user: PortalUser) {
  return user.role === "owner";
}
