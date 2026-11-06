import { getFirebaseAdminAuth } from "@/lib/integrations/firebase-admin";
import { getPortalCollection, getPortalDocument, portalCollections, setPortalDocument } from "@/lib/portal/firestore-store";
import type { PortalRole, PortalUser } from "@/lib/portal/types";

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function nowIso() {
  return new Date().toISOString();
}

type FirestorePortalUser = {
  email: string;
  name: string;
  phone: string | null;
  role: PortalRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

type FirestorePortalInvite = {
  tokenHash: string;
  email: string;
  name: string;
  phone: string | null;
  role: PortalRole;
  invitedBy: string;
  expiresAt: string;
  usedAt: string | null;
  createdAt: string;
};

function mapUser(id: string, value: FirestorePortalUser): PortalUser {
  return {
    id,
    email: value.email,
    name: value.name,
    phone: value.phone ?? null,
    role: value.role,
    isActive: value.isActive,
  };
}

export async function countFirestorePortalUsers() {
  const snapshot = await getPortalCollection<FirestorePortalUser>(portalCollections.users).limit(1).get();
  return snapshot.size;
}

export async function getFirestorePortalUser(uid: string) {
  const value = await getPortalDocument<FirestorePortalUser>(portalCollections.users, uid);
  return value ? mapUser(uid, value) : null;
}

export async function getFirestorePortalUserByEmail(email: string) {
  const snapshot = await getPortalCollection<FirestorePortalUser>(portalCollections.users).where("email", "==", normalizeEmail(email)).limit(1).get();
  const document = snapshot.docs[0];
  return document ? mapUser(document.id, document.data()) : null;
}

export async function listFirestorePortalUsers() {
  const snapshot = await getPortalCollection<FirestorePortalUser>(portalCollections.users).get();
  return snapshot.docs
    .map((document) => mapUser(document.id, document.data()))
    .sort((left, right) => left.name.localeCompare(right.name));
}

export async function createFirestorePortalUser(input: {
  email: string;
  name: string;
  phone?: string | null;
  role: PortalRole;
  password: string;
}) {
  const email = normalizeEmail(input.email);
  const authUser = await getFirebaseAdminAuth().createUser({
    email,
    password: input.password,
    displayName: input.name.trim(),
  });

  const timestamp = nowIso();
  try {
    await getFirebaseAdminAuth().setCustomUserClaims(authUser.uid, { role: input.role });
    await setPortalDocument<FirestorePortalUser>(portalCollections.users, authUser.uid, {
      email,
      name: input.name.trim(),
      phone: input.phone?.trim() || null,
      role: input.role,
      isActive: true,
      createdAt: timestamp,
      updatedAt: timestamp,
    });
  } catch (error) {
    await getFirebaseAdminAuth().deleteUser(authUser.uid).catch(() => undefined);
    throw error;
  }

  return authUser.uid;
}

export async function updateFirestorePortalUserRole(uid: string, role: PortalRole) {
  await getFirebaseAdminAuth().setCustomUserClaims(uid, { role });
  await setPortalDocument<Partial<FirestorePortalUser>>(portalCollections.users, uid, { role, updatedAt: nowIso() }, true);
}

export async function updateFirestorePortalUserPhone(uid: string, phone: string | null) {
  await setPortalDocument<Partial<FirestorePortalUser>>(portalCollections.users, uid, { phone, updatedAt: nowIso() }, true);
}

export async function deactivateFirestorePortalUser(uid: string) {
  await getFirebaseAdminAuth().updateUser(uid, { disabled: true });
  await setPortalDocument<Partial<FirestorePortalUser>>(portalCollections.users, uid, { isActive: false, updatedAt: nowIso() }, true);
}

export async function deleteFirestorePortalUser(uid: string) {
  await getFirebaseAdminAuth().deleteUser(uid).catch(() => undefined);
  await getPortalCollection(portalCollections.users).doc(uid).delete().catch(() => undefined);
}

export async function createFirestorePortalInvite(input: Omit<FirestorePortalInvite, "createdAt" | "usedAt">) {
  await setPortalDocument<FirestorePortalInvite>(portalCollections.invites, input.tokenHash, { ...input, usedAt: null, createdAt: nowIso() });
}

export async function getFirestorePortalInvite(tokenHash: string) {
  return getPortalDocument<FirestorePortalInvite>(portalCollections.invites, tokenHash);
}

export async function markFirestorePortalInviteUsed(tokenHash: string) {
  await setPortalDocument<Partial<FirestorePortalInvite>>(portalCollections.invites, tokenHash, { usedAt: nowIso() }, true);
}
