import type { CollectionReference, DocumentData, DocumentSnapshot, Query } from "firebase-admin/firestore";
import { getFirebaseAdminDb } from "@/lib/integrations/firebase-admin";

export const portalCollections = {
  users: "portal_users",
  invites: "portal_invites",
  customers: "portal_customers",
  enquiries: "portal_enquiries",
  projects: "portal_projects",
  siteSurveys: "portal_site_surveys",
  quotations: "portal_quotations",
  payments: "portal_payments",
  paymentAdjustments: "portal_payment_adjustments",
  installationItems: "portal_installation_items",
  tickets: "portal_tickets",
  ticketAttachments: "portal_ticket_attachments",
  jobs: "portal_jobs",
  jobResponses: "portal_job_responses",
  jobAssignments: "portal_job_assignments",
  jobCompletions: "portal_job_completions",
  jobAttachments: "portal_job_attachments",
  schedules: "portal_schedules",
  notifications: "portal_notifications",
  activities: "portal_activities",
  products: "portal_products",
  productPriceHistory: "portal_product_price_history",
  pointRules: "portal_point_rules",
  pointTransactions: "portal_point_transactions",
  rewards: "portal_rewards",
  redemptions: "portal_redemptions",
  counters: "portal_counters",
} as const;

export type PortalCollection = (typeof portalCollections)[keyof typeof portalCollections];

export function getPortalCollection<T extends DocumentData = DocumentData>(collection: PortalCollection) {
  return getFirebaseAdminDb().collection(collection) as CollectionReference<T>;
}

export async function getPortalDocument<T extends DocumentData>(collection: PortalCollection, id: string) {
  const snapshot = await getPortalCollection<T>(collection).doc(id).get();
  return snapshot.exists ? ({ id: snapshot.id, ...snapshot.data() } as T & { id: string }) : null;
}

export async function setPortalDocument<T extends DocumentData>(collection: PortalCollection, id: string, value: T, merge = false) {
  await getPortalCollection<T>(collection).doc(id).set(value, { merge });
}

export async function deletePortalDocument(collection: PortalCollection, id: string) {
  await getPortalCollection(collection).doc(id).delete();
}

export async function listPortalDocuments<T extends DocumentData>(
  collection: PortalCollection,
  configure?: (query: Query<T>) => Query<T>,
) {
  const baseQuery = getPortalCollection<T>(collection) as Query<T>;
  const snapshot = await (configure ? configure(baseQuery) : baseQuery).get();
  return snapshot.docs.map((document) => ({ id: document.id, ...document.data() }) as T & { id: string });
}

export function getPortalDocumentData<T extends DocumentData>(snapshot: DocumentSnapshot<T>) {
  return snapshot.exists ? ({ id: snapshot.id, ...snapshot.data() } as T & { id: string }) : null;
}
