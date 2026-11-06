export type PortalDataBackend = "sqlite" | "firestore";
export type PortalAuthBackend = "sqlite" | "firestore";

export function getPortalDataBackend(): PortalDataBackend {
  return process.env.PORTAL_DATA_BACKEND === "firestore" ? "firestore" : "sqlite";
}

export function isFirestorePortalBackend() {
  return getPortalDataBackend() === "firestore";
}

export function getPortalAuthBackend(): PortalAuthBackend {
  return process.env.PORTAL_AUTH_BACKEND === "firestore" ? "firestore" : "sqlite";
}
