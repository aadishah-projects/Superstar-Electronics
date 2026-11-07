import { getFirebaseAdminDb } from "@/lib/integrations/firebase-admin";
import { getPortalCollection, getPortalDocument, listPortalDocuments, portalCollections, setPortalDocument } from "@/lib/portal/firestore-store";
import { listFirestorePortalUsers } from "@/lib/portal/firestore-users";
import { getPortalToday, normalizePortalPhone } from "@/lib/portal/config";
import { catalogProducts } from "@/data/catalog";
import type {
  ActivityRecord,
  DashboardMetrics,
  CustomerRecord,
  EnquiryRecord,
  InstallationItemRecord,
  JobAssignmentRecord,
  JobAttachmentRecord,
  JobCompletionRecord,
  JobResponseRecord,
  NotificationRecord,
  PaymentAdjustmentRecord,
  PaymentRecord,
  PointRuleRecord,
  PointTransactionRecord,
  ProductPriceHistoryRecord,
  ProductRecord,
  ProjectRecord,
  RedemptionRequestRecord,
  RewardItemRecord,
  PortalUser,
  QuotationRecord,
  ScheduleEventRecord,
  ServiceJobRecord,
  ServiceTicketRecord,
  SiteSurveyRecord,
  TicketAttachmentRecord,
  PortalRole,
} from "@/lib/portal/types";

type StoredRecord = Record<string, unknown>;

const timestamp = () => new Date().toISOString();

function text(value: unknown) {
  return value === null || value === undefined ? "" : String(value);
}

function nullableText(value: unknown) {
  return value === null || value === undefined || value === "" ? null : String(value);
}

function numberOrNull(value: unknown) {
  return value === null || value === undefined || value === "" ? null : Number(value);
}

async function all<T extends StoredRecord>(collection: (typeof portalCollections)[keyof typeof portalCollections]) {
  return listPortalDocuments<T>(collection);
}

async function read<T extends StoredRecord>(collection: (typeof portalCollections)[keyof typeof portalCollections], id: string) {
  return getPortalDocument<T>(collection, id);
}

async function write(collection: (typeof portalCollections)[keyof typeof portalCollections], id: string, value: StoredRecord, merge = false) {
  await setPortalDocument(collection, id, value, merge);
}

async function nextReference(name: string, prefix: string) {
  const db = getFirebaseAdminDb();
  const ref = getPortalCollection(portalCollections.counters).doc(name);
  const value = await db.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(ref);
    const next = Number(snapshot.data()?.value ?? 0) + 1;
    transaction.set(ref, { value: next, updatedAt: timestamp() }, { merge: true });
    return next;
  });
  return `${prefix}-${String(value).padStart(4, "0")}`;
}

async function userMap() {
  const users = await listFirestorePortalUsers();
  return new Map(users.map((user) => [user.id, user]));
}

async function userName(id: string | null | undefined) {
  if (!id) return null;
  return (await userMap()).get(id)?.name ?? null;
}

function matches(value: unknown, search: string) {
  return text(value).toLowerCase().includes(search.toLowerCase());
}

function sortNewest(left: StoredRecord, right: StoredRecord, field = "createdAt") {
  return text(right[field]).localeCompare(text(left[field]));
}

function mapProduct(row: StoredRecord): ProductRecord {
  return {
    id: text(row.id),
    legacyId: nullableText(row.legacyId),
    name: text(row.name),
    brand: text(row.brand),
    model: nullableText(row.model),
    categoryKey: text(row.categoryKey),
    categoryName: text(row.categoryName),
    description: nullableText(row.description),
    specifications: nullableText(row.specifications),
    imagePath: nullableText(row.imagePath),
    imageAlt: nullableText(row.imageAlt),
    sourceUrl: nullableText(row.sourceUrl),
    sourceCategory: nullableText(row.sourceCategory),
    currentPrice: numberOrNull(row.currentPrice),
    referencePrice: numberOrNull(row.referencePrice),
    priceDisplayMode: row.priceDisplayMode as ProductRecord["priceDisplayMode"],
    priceType: row.priceType as ProductRecord["priceType"],
    availability: row.availability as ProductRecord["availability"],
    publicationStatus: row.publicationStatus as ProductRecord["publicationStatus"],
    unit: text(row.unit) || "piece",
    warrantyMonths: numberOrNull(row.warrantyMonths),
    createdBy: nullableText(row.createdBy),
    updatedBy: nullableText(row.updatedBy),
    createdAt: text(row.createdAt),
    updatedAt: text(row.updatedAt),
  };
}

export async function ensureFirestoreCatalogSeeded() {
  const products = await all<StoredRecord>(portalCollections.products);
  if (products.length > 0) return;
  const createdAt = timestamp();
  await Promise.all(catalogProducts.map((product) => write(portalCollections.products, product.id, {
    legacyId: product.id,
    name: product.name,
    brand: product.brand,
    model: product.model,
    categoryKey: product.categoryKey,
    categoryName: product.categoryName,
    description: null,
    specifications: null,
    imagePath: product.image,
    imageAlt: product.name,
    sourceUrl: product.sourceUrl,
    sourceCategory: product.sourceCategory,
    currentPrice: product.price,
    referencePrice: product.originalPrice,
    priceDisplayMode: product.priceDisplayMode ?? "show_price",
    priceType: product.priceType ?? "market",
    availability: product.availability ?? "not_tracked",
    publicationStatus: "published",
    unit: "piece",
    warrantyMonths: null,
    createdBy: null,
    updatedBy: null,
    createdAt,
    updatedAt: createdAt,
  })));
  await ensureFirestoreIdea3Seeded();
}

export async function ensureFirestoreIdea3Seeded() {
  const rules = await all<StoredRecord>(portalCollections.pointRules);
  if (rules.length === 0) {
    const createdAt = timestamp();
    await Promise.all([
      write(portalCollections.pointRules, "sample-verified-completion", { name: "Verified camera for one customer", type: "verified-completion", points: 100, category: "cctv-installation", enabled: true, sampleLabel: "Business rule: 100 points per verified camera for one customer", createdAt, updatedAt: createdAt }),
      write(portalCollections.pointRules, "sample-complex-bonus", { name: "Complex job bonus", type: "category-bonus", points: 20, category: "cctv-installation", enabled: true, sampleLabel: "Sample value – confirm with management", createdAt, updatedAt: createdAt }),
      write(portalCollections.pointRules, "sample-quality-bonus", { name: "Approved quality bonus", type: "quality-bonus", points: 10, category: null, enabled: true, sampleLabel: "Sample value – confirm with management", createdAt, updatedAt: createdAt }),
    ]);
  }

  const rewards = await all<StoredRecord>(portalCollections.rewards);
  if (rewards.length === 0) {
    const createdAt = timestamp();
    await Promise.all([
      write(portalCollections.rewards, "sample-reward-memory", { productId: null, name: "Memory card or storage accessory", description: "Sample reward – replaced by the EZVIZ camera reward catalogue.", category: "CCTV accessories", imagePath: null, pointsCost: 100, stockQuantity: 5, active: false, createdAt, updatedAt: createdAt }),
      write(portalCollections.rewards, "sample-reward-cable", { productId: null, name: "Cable and connector kit", description: "Sample reward – replaced by the EZVIZ camera reward catalogue.", category: "Cables and connectors", imagePath: null, pointsCost: 150, stockQuantity: 5, active: false, createdAt, updatedAt: createdAt }),
      write(portalCollections.rewards, "sample-reward-adapter", { productId: null, name: "Power adapter or networking accessory", description: "Sample reward – replaced by the EZVIZ camera reward catalogue.", category: "Networking accessories", imagePath: null, pointsCost: 200, stockQuantity: 3, active: false, createdAt, updatedAt: createdAt }),
    ]);
  }

  const products = await all<StoredRecord>(portalCollections.products);
  const ezvizProducts = products.filter((product) => text(product.brand).toUpperCase() === "EZVIZ" && numberOrNull(product.currentPrice) !== null);
  const existingRewards = await all<StoredRecord>(portalCollections.rewards);
  const existingByProduct = new Map(existingRewards.map((reward) => [nullableText(reward.productId), reward]));
  const createdAt = timestamp();
  await Promise.all(ezvizProducts.map((product) => {
    const rewardId = `ezviz-reward-${text(product.id)}`;
    const pointsCost = Math.round(Number(product.currentPrice));
    const value = { productId: text(product.id), name: text(product.name), description: `EZVIZ camera reward. Cost is linked to the current managed catalogue amount: NPR ${pointsCost}.`, category: "EZVIZ cameras", imagePath: nullableText(product.imagePath), pointsCost, stockQuantity: Number(existingByProduct.get(text(product.id))?.stockQuantity ?? 1), active: true, updatedAt: createdAt };
    return write(portalCollections.rewards, rewardId, value, Boolean(existingByProduct.get(text(product.id))));
  }));
}

export async function getFirestoreProducts(filters: { search?: string; status?: string; availability?: string; priceMode?: string } = {}) {
  await ensureFirestoreCatalogSeeded();
  const search = filters.search?.trim() ?? "";
  const values = (await all<StoredRecord>(portalCollections.products)).filter((product) =>
    (!search || [product.name, product.brand, product.model, product.categoryName, product.legacyId].some((value) => matches(value, search))) &&
    (!filters.status || product.publicationStatus === filters.status) &&
    (!filters.availability || product.availability === filters.availability) &&
    (!filters.priceMode || product.priceDisplayMode === filters.priceMode),
  );
  return values.sort((left, right) => sortNewest(left, right, "updatedAt") || text(left.name).localeCompare(text(right.name))).map(mapProduct);
}

export async function getFirestorePublishedProducts(): Promise<ProductRecord[]> {
  const values = (await all<StoredRecord>(portalCollections.products))
    .filter((product) => product.publicationStatus === "published");
  return values
    .sort((left, right) => sortNewest(left, right, "updatedAt") || text(left.name).localeCompare(text(right.name)))
    .map(mapProduct);
}

export async function getFirestoreProduct(id: string) {
  await ensureFirestoreCatalogSeeded();
  const product = await read<StoredRecord>(portalCollections.products, id);
  return product ? mapProduct(product) : undefined;
}

export async function getFirestoreProductPriceHistory(productId: string): Promise<ProductPriceHistoryRecord[]> {
  const users = await userMap();
  const rows = (await all<StoredRecord>(portalCollections.productPriceHistory)).filter((row) => row.productId === productId).sort((left, right) => sortNewest(left, right));
  return rows.map((row) => ({ id: text(row.id), productId, previousPrice: numberOrNull(row.previousPrice), newPrice: numberOrNull(row.newPrice), previousReferencePrice: numberOrNull(row.previousReferencePrice), newReferencePrice: numberOrNull(row.newReferencePrice), reason: nullableText(row.reason), changedByName: users.get(text(row.changedBy))?.name ?? nullableText(row.changedByName), createdAt: text(row.createdAt) }));
}

function mapCustomer(row: StoredRecord): CustomerRecord {
  return { id: text(row.id), name: text(row.name), businessName: nullableText(row.businessName), customerType: row.customerType as CustomerRecord["customerType"], phonePrimary: text(row.phonePrimary), phoneSecondary: nullableText(row.phoneSecondary), email: nullableText(row.email), address: nullableText(row.address), area: nullableText(row.area), notes: nullableText(row.notes), createdAt: text(row.createdAt), updatedAt: text(row.updatedAt) };
}

export async function getFirestoreCustomers(search = "") {
  const term = search.trim();
  return (await all<StoredRecord>(portalCollections.customers)).filter((row) => !term || [row.id, row.name, row.businessName, row.phonePrimary, row.phoneSecondary, row.email, row.address, row.area].some((value) => matches(value, term))).sort((left, right) => sortNewest(left, right, "updatedAt")).map(mapCustomer);
}

export async function getFirestoreCustomer(id: string) {
  const customer = await read<StoredRecord>(portalCollections.customers, id);
  return customer ? mapCustomer(customer) : undefined;
}

export async function findFirestoreCustomerByPhone(phone: string) {
  const normalized = normalizePortalPhone(phone);
  const customer = (await all<StoredRecord>(portalCollections.customers)).find((row) => normalizePortalPhone(text(row.phonePrimary)) === normalized);
  return customer ? { id: text(customer.id), name: text(customer.name), phone_primary: text(customer.phonePrimary) } : undefined;
}

function mapEnquiry(row: StoredRecord): EnquiryRecord {
  return { id: text(row.id), reference: text(row.reference), customerId: text(row.customerId), customerName: text(row.customerName), customerPhone: text(row.customerPhone), type: row.type as EnquiryRecord["type"], source: row.source as EnquiryRecord["source"], status: row.status as EnquiryRecord["status"], area: nullableText(row.area), notes: nullableText(row.notes), followUpAt: nullableText(row.followUpAt), assignedTo: nullableText(row.assignedTo), assignedToName: nullableText(row.assignedToName), createdAt: text(row.createdAt) };
}

export async function getFirestoreEnquiries(filters: { search?: string; status?: string } = {}) {
  const search = filters.search?.trim() ?? "";
  return (await all<StoredRecord>(portalCollections.enquiries)).filter((row) => (!search || [row.reference, row.customerName, row.customerPhone, row.area, row.notes].some((value) => matches(value, search))) && (!filters.status || row.status === filters.status)).sort((left, right) => (['new', 'contacted', 'survey-required'].includes(text(left.status)) ? -1 : 1) - (['new', 'contacted', 'survey-required'].includes(text(right.status)) ? -1 : 1) || sortNewest(left, right)).map(mapEnquiry);
}

export async function getFirestoreEnquiry(id: string) {
  const row = await read<StoredRecord>(portalCollections.enquiries, id);
  return row ? mapEnquiry(row) : undefined;
}

function mapProject(row: StoredRecord): ProjectRecord {
  return { id: text(row.id), reference: text(row.reference), customerId: text(row.customerId), customerName: text(row.customerName), title: text(row.title), projectType: text(row.projectType), status: row.status as ProjectRecord["status"], siteAddress: nullableText(row.siteAddress), area: nullableText(row.area), siteLatitude: numberOrNull(row.siteLatitude), siteLongitude: numberOrNull(row.siteLongitude), siteInstructions: nullableText(row.siteInstructions), plannedInstallDate: nullableText(row.plannedInstallDate), estimatedAmount: numberOrNull(row.estimatedAmount), approvedAmount: numberOrNull(row.approvedAmount), amountPaid: Number(row.amountPaid ?? 0), warrantyStartDate: nullableText(row.warrantyStartDate), warrantyEndDate: nullableText(row.warrantyEndDate), notes: nullableText(row.notes), createdAt: text(row.createdAt) };
}

export async function getFirestoreProjects(filters: { search?: string; status?: string } = {}) {
  const search = filters.search?.trim() ?? "";
  return (await all<StoredRecord>(portalCollections.projects)).filter((row) => (!search || [row.reference, row.title, row.customerName, row.siteAddress, row.area].some((value) => matches(value, search))) && (!filters.status || row.status === filters.status)).sort((left, right) => sortNewest(left, right)).map(mapProject);
}

export async function getFirestoreProject(id: string) {
  const row = await read<StoredRecord>(portalCollections.projects, id);
  return row ? mapProject(row) : undefined;
}

export async function getFirestoreSiteSurveys(projectId: string) {
  const users = await userMap();
  return (await all<StoredRecord>(portalCollections.siteSurveys)).filter((row) => row.projectId === projectId).sort((left, right) => text(right.surveyDate).localeCompare(text(left.surveyDate)) || sortNewest(left, right)).map((row) => ({ id: text(row.id), projectId, surveyDate: text(row.surveyDate), surveyorId: nullableText(row.surveyorId), surveyorName: nullableText(row.surveyorName) ?? users.get(text(row.surveyorId))?.name ?? null, propertyType: nullableText(row.propertyType), installationArea: nullableText(row.installationArea), cameraCount: numberOrNull(row.cameraCount), cameraType: nullableText(row.cameraType), indoorOutdoor: nullableText(row.indoorOutdoor), cableLength: numberOrNull(row.cableLength), cableRoutes: nullableText(row.cableRoutes), storageRequirements: nullableText(row.storageRequirements), networkingNeeds: nullableText(row.networkingNeeds), mountingConstraints: nullableText(row.mountingConstraints), customerRequirements: nullableText(row.customerRequirements), outcome: nullableText(row.outcome), nextSteps: nullableText(row.nextSteps), recordedByName: nullableText(row.recordedByName) ?? users.get(text(row.recordedBy))?.name ?? "", createdAt: text(row.createdAt), updatedAt: text(row.updatedAt) })) satisfies SiteSurveyRecord[];
}

function mapQuotation(row: StoredRecord): QuotationRecord {
  return { id: text(row.id), reference: text(row.reference), customerId: text(row.customerId), customerName: text(row.customerName), projectId: nullableText(row.projectId), projectReference: nullableText(row.projectReference), status: row.status as QuotationRecord["status"], vatRate: Number(row.vatRate ?? 0), subtotal: Number(row.subtotal ?? 0), vatAmount: Number(row.vatAmount ?? 0), total: Number(row.total ?? 0), validDays: Number(row.validDays ?? 0), validUntil: text(row.validUntil), notes: nullableText(row.notes), items: Array.isArray(row.items) ? row.items as QuotationRecord["items"] : [], createdAt: text(row.createdAt), updatedAt: text(row.updatedAt) };
}

export async function getFirestoreQuotations(projectId?: string) {
  return (await all<StoredRecord>(portalCollections.quotations)).filter((row) => !projectId || row.projectId === projectId).sort((left, right) => sortNewest(left, right)).map(mapQuotation);
}

export async function getFirestoreQuotation(id: string) {
  const row = await read<StoredRecord>(portalCollections.quotations, id);
  return row ? mapQuotation(row) : undefined;
}

export async function getFirestorePayments(projectId: string): Promise<PaymentRecord[]> {
  return (await all<StoredRecord>(portalCollections.payments)).filter((row) => row.projectId === projectId).sort((left, right) => text(right.paidAt).localeCompare(text(left.paidAt)) || sortNewest(left, right)).map((row) => ({ id: text(row.id), projectId, quotationId: nullableText(row.quotationId), quotationReference: nullableText(row.quotationReference), method: row.method as PaymentRecord["method"], amount: Number(row.amount ?? 0), paidAt: text(row.paidAt), reference: nullableText(row.reference), notes: nullableText(row.notes), recordedByName: text(row.recordedByName), createdAt: text(row.createdAt) }));
}

export async function getFirestorePaymentAdjustments(projectId: string): Promise<PaymentAdjustmentRecord[]> {
  return (await all<StoredRecord>(portalCollections.paymentAdjustments)).filter((row) => row.projectId === projectId).sort((left, right) => sortNewest(left, right)).map((row) => ({ id: text(row.id), projectId, paymentId: text(row.paymentId), paymentReference: nullableText(row.paymentReference), type: row.type as PaymentAdjustmentRecord["type"], amount: Number(row.amount ?? 0), reason: text(row.reason), recordedByName: text(row.recordedByName), createdAt: text(row.createdAt) }));
}

export async function getFirestoreInstallationItems(projectId: string): Promise<InstallationItemRecord[]> {
  return (await all<StoredRecord>(portalCollections.installationItems)).filter((row) => row.projectId === projectId).sort((left, right) => sortNewest(left, right)).map((row) => ({ id: text(row.id), projectId, description: text(row.description), quotedQuantity: numberOrNull(row.quotedQuantity), installedQuantity: Number(row.installedQuantity ?? 0), serialNumber: nullableText(row.serialNumber), notes: nullableText(row.notes), recordedByName: text(row.recordedByName), createdAt: text(row.createdAt), updatedAt: text(row.updatedAt) }));
}

function mapTicket(row: StoredRecord): ServiceTicketRecord {
  return { id: text(row.id), reference: text(row.reference), customerId: nullableText(row.customerId), customerName: text(row.customerName), phone: text(row.phone), email: nullableText(row.email), projectId: nullableText(row.projectId), projectReference: nullableText(row.projectReference), category: row.category as ServiceTicketRecord["category"], priority: row.priority as ServiceTicketRecord["priority"], status: row.status as ServiceTicketRecord["status"], description: text(row.description), preferredContact: nullableText(row.preferredContact), assignedTo: nullableText(row.assignedTo), assignedToName: nullableText(row.assignedToName), internalNotes: nullableText(row.internalNotes), customerUpdate: nullableText(row.customerUpdate), resolutionSummary: nullableText(row.resolutionSummary), createdAt: text(row.createdAt), updatedAt: text(row.updatedAt) };
}

export async function getFirestoreServiceTickets(assignedTo?: string, filters: { search?: string; status?: string } = {}) {
  const search = filters.search?.trim() ?? "";
  return (await all<StoredRecord>(portalCollections.tickets)).filter((row) => (!assignedTo || row.assignedTo === assignedTo) && (!search || [row.reference, row.customerName, row.phone, row.description].some((value) => matches(value, search))) && (!filters.status || row.status === filters.status)).sort((left, right) => (['open', 'reviewed', 'assigned', 'reopened'].includes(text(left.status)) ? -1 : 1) - (['open', 'reviewed', 'assigned', 'reopened'].includes(text(right.status)) ? -1 : 1) || (text(left.priority) === 'urgent' ? -1 : 1) - (text(right.priority) === 'urgent' ? -1 : 1) || sortNewest(left, right)).map(mapTicket);
}

export async function getFirestoreServiceTicket(id: string) {
  const row = await read<StoredRecord>(portalCollections.tickets, id);
  return row ? mapTicket(row) : undefined;
}

export async function getFirestorePublicSupportTicket(tokenHash: string) {
  const access = (await all<StoredRecord>(portalCollections.counters)).find((row) => row.type === "support-access" && row.tokenHash === tokenHash);
  if (!access || text(access.expiresAt) <= new Date().toISOString()) return undefined;
  const ticket = await read<StoredRecord>(portalCollections.tickets, text(access.ticketId));
  if (!ticket) return undefined;
  return { reference: text(ticket.reference), customerName: text(ticket.customerName), category: text(ticket.category), priority: text(ticket.priority), status: text(ticket.status), description: text(ticket.description), customerUpdate: nullableText(ticket.customerUpdate), resolutionSummary: nullableText(ticket.resolutionSummary), createdAt: text(ticket.createdAt), updatedAt: text(ticket.updatedAt) };
}

export async function getFirestoreTicketAttachments(ticketId: string): Promise<TicketAttachmentRecord[]> {
  const staff = (await all<StoredRecord>(portalCollections.ticketAttachments)).filter((row) => row.ticketId === ticketId).map((row) => ({ id: text(row.id), ticketId, originalName: text(row.originalName), mimeType: text(row.mimeType), sizeBytes: Number(row.sizeBytes ?? 0), uploadedByName: text(row.uploadedByName), createdAt: text(row.createdAt) }));
  const customer = (await all<StoredRecord>(portalCollections.counters)).filter((row) => row.type === "customer-ticket-attachment" && row.ticketId === ticketId).map((row) => ({ id: text(row.id), ticketId, originalName: text(row.originalName), mimeType: text(row.mimeType), sizeBytes: Number(row.sizeBytes ?? 0), uploadedByName: "Customer", createdAt: text(row.createdAt) }));
  return [...staff, ...customer].sort((left, right) => text(right.createdAt).localeCompare(text(left.createdAt)));
}

export async function getFirestoreTicketAttachment(id: string) {
  const staff = await read<StoredRecord>(portalCollections.ticketAttachments, id);
  if (staff) return { id, ticket_id: text(staff.ticketId), original_name: text(staff.originalName), stored_name: text(staff.storedName), mime_type: text(staff.mimeType), size_bytes: Number(staff.sizeBytes ?? 0) };
  const customer = (await all<StoredRecord>(portalCollections.counters)).find((row) => row.type === "customer-ticket-attachment" && row.id === id);
  return customer ? { id, ticket_id: text(customer.ticketId), original_name: text(customer.originalName), stored_name: text(customer.storedName), mime_type: text(customer.mimeType), size_bytes: Number(customer.sizeBytes ?? 0) } : undefined;
}

export async function getFirestoreScheduleEvents(filters: { from: string; to: string; assignedTo?: string }): Promise<ScheduleEventRecord[]> {
  return (await all<StoredRecord>(portalCollections.schedules)).filter((row) => text(row.scheduledStart) >= filters.from && text(row.scheduledStart) < filters.to && (!filters.assignedTo || row.assignedTo === filters.assignedTo)).sort((left, right) => text(left.scheduledStart).localeCompare(text(right.scheduledStart)) || text(left.createdAt).localeCompare(text(right.createdAt))).map((row) => ({ id: text(row.id), eventType: row.eventType as ScheduleEventRecord["eventType"], title: text(row.title), scheduledStart: text(row.scheduledStart), scheduledEnd: text(row.scheduledEnd), status: row.status as ScheduleEventRecord["status"], projectId: nullableText(row.projectId), projectReference: nullableText(row.projectReference), ticketId: nullableText(row.ticketId), ticketReference: nullableText(row.ticketReference), customerName: nullableText(row.customerName), siteAddress: nullableText(row.siteAddress), assignedTo: nullableText(row.assignedTo), assignedToName: nullableText(row.assignedToName), notes: nullableText(row.notes), createdByName: text(row.createdByName), createdAt: text(row.createdAt), updatedAt: text(row.updatedAt) }));
}

export async function getFirestoreNotifications(userId: string, limit = 12): Promise<NotificationRecord[]> {
  return (await all<StoredRecord>(portalCollections.notifications)).filter((row) => row.userId === userId).sort((left, right) => sortNewest(left, right)).slice(0, limit).map((row) => ({ id: text(row.id), type: text(row.type), title: text(row.title), message: text(row.message), entityType: text(row.entityType), entityId: text(row.entityId), readAt: nullableText(row.readAt), createdAt: text(row.createdAt) }));
}

export async function getFirestoreActiveUsers(): Promise<PortalUser[]> {
  return listFirestorePortalUsers();
}

export async function getFirestoreActivityFeed(limit = 8): Promise<ActivityRecord[]> {
  const users = await userMap();
  return (await all<StoredRecord>(portalCollections.activities)).sort((left, right) => sortNewest(left, right)).slice(0, limit).map((row) => ({ action: text(row.action), entityType: text(row.entityType), entityId: text(row.entityId), details: nullableText(row.details), actorName: text(row.actorName) || users.get(text(row.actorId))?.name || "", createdAt: text(row.createdAt) }));
}

export async function getFirestoreEntityActivity(entityType: string, entityId: string): Promise<ActivityRecord[]> {
  const users = await userMap();
  return (await all<StoredRecord>(portalCollections.activities)).filter((row) => row.entityType === entityType && row.entityId === entityId).sort((left, right) => sortNewest(left, right)).map((row) => ({ action: text(row.action), entityType, entityId, details: nullableText(row.details), actorName: text(row.actorName) || users.get(text(row.actorId))?.name || "", createdAt: text(row.createdAt) }));
}

function mapJob(row: StoredRecord): ServiceJobRecord {
  return { id: text(row.id), reference: text(row.reference), customerId: nullableText(row.customerId), customerName: text(row.customerName), phone: text(row.phone), siteAddress: nullableText(row.siteAddress), siteArea: nullableText(row.siteArea), siteLatitude: numberOrNull(row.siteLatitude), siteLongitude: numberOrNull(row.siteLongitude), category: row.category as ServiceJobRecord["category"], title: text(row.title), description: text(row.description), requiredSkills: nullableText(row.requiredSkills), preferredStart: nullableText(row.preferredStart), preferredEnd: nullableText(row.preferredEnd), urgency: row.urgency as ServiceJobRecord["urgency"], estimatedMinutes: numberOrNull(row.estimatedMinutes), internalNotes: nullableText(row.internalNotes), technicianNotes: nullableText(row.technicianNotes), acceptanceDeadline: nullableText(row.acceptanceDeadline), status: row.status as ServiceJobRecord["status"], assignedTechnicianId: nullableText(row.assignedTechnicianId), assignedTechnicianName: nullableText(row.assignedTechnicianName), createdByName: text(row.createdByName), createdAt: text(row.createdAt), updatedAt: text(row.updatedAt) };
}

export async function getFirestoreServiceJobs(input: { role: PortalRole; userId: string; status?: string }) {
  const jobs = await all<StoredRecord>(portalCollections.jobs);
  const responses = await all<StoredRecord>(portalCollections.jobResponses);
  return jobs
    .filter((job) => {
      const visibleToTechnician = input.role !== "technician"
        || job.assignedTechnicianId === input.userId
        || job.status === "open"
        || responses.some((response) => response.jobId === job.id && response.technicianId === input.userId && response.status === "accepted");
      return (!input.status || job.status === input.status) && visibleToTechnician;
    })
    .sort((left, right) => (text(left.status) === "open" ? -1 : 1) - (text(right.status) === "open" ? -1 : 1) || sortNewest(left, right))
    .map(mapJob);
}

export async function getFirestoreServiceJob(id: string) {
  const row = await read<StoredRecord>(portalCollections.jobs, id);
  return row ? mapJob(row) : undefined;
}

export async function getFirestoreJobResponses(jobId: string): Promise<JobResponseRecord[]> {
  return (await all<StoredRecord>(portalCollections.jobResponses)).filter((row) => row.jobId === jobId).sort((left, right) => sortNewest(left, right, "respondedAt")).map((row) => ({ id: text(row.id), jobId, technicianId: text(row.technicianId), technicianName: text(row.technicianName), status: row.status as JobResponseRecord["status"], reason: nullableText(row.reason), respondedAt: text(row.respondedAt) }));
}

export async function getFirestoreJobAssignments(jobId: string): Promise<JobAssignmentRecord[]> {
  return (await all<StoredRecord>(portalCollections.jobAssignments)).filter((row) => row.jobId === jobId).sort((left, right) => sortNewest(left, right, "assignedAt")).map((row) => ({ id: text(row.id), jobId, technicianId: text(row.technicianId), technicianName: text(row.technicianName), assignmentType: row.assignmentType as JobAssignmentRecord["assignmentType"], assignedByName: text(row.assignedByName), reason: nullableText(row.reason), assignedAt: text(row.assignedAt), unassignedAt: nullableText(row.unassignedAt) }));
}

export async function getFirestoreJobCompletion(jobId: string): Promise<JobCompletionRecord | undefined> {
  const rows = (await all<StoredRecord>(portalCollections.jobCompletions)).filter((row) => row.jobId === jobId).sort((left, right) => sortNewest(left, right, "submittedAt"));
  const row = rows[0];
  return row ? { id: text(row.id), jobId, submittedByName: text(row.submittedByName), summary: text(row.summary), workNotes: nullableText(row.workNotes), materials: nullableText(row.materials), cameraCount: numberOrNull(row.cameraCount), status: row.status as JobCompletionRecord["status"], returnReason: nullableText(row.returnReason), submittedAt: text(row.submittedAt), verifiedByName: nullableText(row.verifiedByName), verifiedAt: nullableText(row.verifiedAt) } : undefined;
}

export async function getFirestoreJobAttachments(jobId: string): Promise<JobAttachmentRecord[]> {
  return (await all<StoredRecord>(portalCollections.jobAttachments)).filter((row) => row.jobId === jobId).sort((left, right) => sortNewest(left, right)).map((row) => ({ id: text(row.id), jobId, originalName: text(row.originalName), mimeType: text(row.mimeType), sizeBytes: Number(row.sizeBytes ?? 0), uploadedByName: text(row.uploadedByName), createdAt: text(row.createdAt) }));
}

export async function getFirestoreJobAttachment(id: string) {
  const row = await read<StoredRecord>(portalCollections.jobAttachments, id);
  return row ? { id, job_id: text(row.jobId), original_name: text(row.originalName), stored_name: text(row.storedName), mime_type: text(row.mimeType), size_bytes: Number(row.sizeBytes ?? 0) } : undefined;
}

export async function getFirestoreTechnicians() {
  return (await listFirestorePortalUsers()).filter((user) => user.role === "technician" && user.isActive).map((user) => ({ id: user.id, name: user.name, email: user.email, phone: user.phone }));
}

export async function getFirestorePointRules(): Promise<PointRuleRecord[]> {
  await ensureFirestoreIdea3Seeded();
  return (await all<StoredRecord>(portalCollections.pointRules)).sort((left, right) => Number(Boolean(right.enabled)) - Number(Boolean(left.enabled)) || text(left.name).localeCompare(text(right.name))).map((row) => ({ id: text(row.id), name: text(row.name), type: row.type as PointRuleRecord["type"], points: Number(row.points ?? 0), category: row.category as PointRuleRecord["category"], enabled: Boolean(row.enabled), sampleLabel: nullableText(row.sampleLabel), createdAt: text(row.createdAt), updatedAt: text(row.updatedAt) }));
}

export async function getFirestorePointTransactions(technicianId?: string): Promise<PointTransactionRecord[]> {
  return (await all<StoredRecord>(portalCollections.pointTransactions)).filter((row) => !technicianId || row.technicianId === technicianId).sort((left, right) => sortNewest(left, right)).map((row) => ({ id: text(row.id), technicianId: text(row.technicianId), technicianName: text(row.technicianName), type: row.type as PointTransactionRecord["type"], points: Number(row.points ?? 0), jobId: nullableText(row.jobId), jobReference: nullableText(row.jobReference), redemptionId: nullableText(row.redemptionId), ruleId: nullableText(row.ruleId), ruleName: nullableText(row.ruleName), reason: nullableText(row.reason), actorName: nullableText(row.actorName), createdAt: text(row.createdAt) }));
}

export async function getFirestorePointBalance(technicianId: string) {
  const rows = await getFirestorePointTransactions(technicianId);
  return { balance: rows.reduce((sum, row) => sum + row.points, 0), earned: rows.filter((row) => row.points > 0).reduce((sum, row) => sum + row.points, 0), redeemed: rows.filter((row) => row.points < 0).reduce((sum, row) => sum - row.points, 0) };
}

export async function getFirestoreRewardItems(includeInactive = false): Promise<RewardItemRecord[]> {
  await ensureFirestoreIdea3Seeded();
  return (await all<StoredRecord>(portalCollections.rewards)).filter((row) => includeInactive || Boolean(row.active)).sort((left, right) => Number(Boolean(right.active)) - Number(Boolean(left.active)) || text(left.name).localeCompare(text(right.name))).map((row) => ({ id: text(row.id), productId: nullableText(row.productId), name: text(row.name), description: nullableText(row.description), category: text(row.category), imagePath: nullableText(row.imagePath), pointsCost: Number(row.pointsCost ?? 0), stockQuantity: Number(row.stockQuantity ?? 0), active: Boolean(row.active), createdAt: text(row.createdAt), updatedAt: text(row.updatedAt) }));
}

export async function getFirestoreRedemptionRequests(technicianId?: string): Promise<RedemptionRequestRecord[]> {
  return (await all<StoredRecord>(portalCollections.redemptions)).filter((row) => !technicianId || row.technicianId === technicianId).sort((left, right) => sortNewest(left, right)).map((row) => ({ id: text(row.id), reference: text(row.reference), technicianId: text(row.technicianId), technicianName: text(row.technicianName), rewardId: text(row.rewardId), rewardName: text(row.rewardName), pointsCost: Number(row.pointsCost ?? 0), quantity: Number(row.quantity ?? 0), status: row.status as RedemptionRequestRecord["status"], notes: nullableText(row.notes), approvedByName: nullableText(row.approvedByName), createdAt: text(row.createdAt), updatedAt: text(row.updatedAt) }));
}

export async function getFirestoreDashboardMetrics(): Promise<DashboardMetrics> {
  const [enquiries, projects, schedules, tickets, users] = await Promise.all([all<StoredRecord>(portalCollections.enquiries), all<StoredRecord>(portalCollections.projects), all<StoredRecord>(portalCollections.schedules), all<StoredRecord>(portalCollections.tickets), listFirestorePortalUsers()]);
  const today = getPortalToday();
  const tomorrow = new Date(`${today}T00:00:00Z`); tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
  const tomorrowValue = tomorrow.toISOString().slice(0, 10);
  return {
    newEnquiries: enquiries.filter((row) => ["new", "contacted", "survey-required"].includes(text(row.status))).length,
    followUpsDue: enquiries.filter((row) => text(row.followUpAt) && text(row.followUpAt) <= `${today}T23:59:59` && !["converted", "lost"].includes(text(row.status))).length,
    surveysDue: schedules.filter((row) => row.eventType === "survey" && text(row.scheduledStart) < `${tomorrowValue}T00:00` && ["scheduled", "rescheduled"].includes(text(row.status))).length,
    activeProjects: projects.filter((row) => !["completed", "cancelled"].includes(text(row.status))).length,
    upcomingInstallations: schedules.filter((row) => row.eventType === "installation" && text(row.scheduledStart) >= `${today}T00:00` && text(row.scheduledStart) < `${tomorrowValue}T00:00` && ["scheduled", "rescheduled"].includes(text(row.status))).length,
    inProgressProjects: projects.filter((row) => row.status === "installation-in-progress").length,
    openBalances: projects.filter((row) => Number(row.approvedAmount ?? row.estimatedAmount ?? 0) > Number(row.amountPaid ?? 0) && row.status !== "cancelled").length,
    openTickets: tickets.filter((row) => !["resolved", "closed"].includes(text(row.status))).length,
    urgentTickets: tickets.filter((row) => row.priority === "urgent" && !["resolved", "closed"].includes(text(row.status))).length,
    teamMembers: users.filter((user) => user.isActive).length,
  };
}

export async function getFirestoreReportSummary(from: string, to: string) {
  const [enquiries, projects, tickets, payments, adjustments, schedules, users] = await Promise.all([all<StoredRecord>(portalCollections.enquiries), all<StoredRecord>(portalCollections.projects), all<StoredRecord>(portalCollections.tickets), all<StoredRecord>(portalCollections.payments), all<StoredRecord>(portalCollections.paymentAdjustments), all<StoredRecord>(portalCollections.schedules), listFirestorePortalUsers()]);
  const inRange = (value: unknown) => text(value) >= from && text(value) < to;
  const groupCount = (rows: StoredRecord[], field: string) => Object.entries(rows.filter((row) => inRange(row.createdAt)).reduce<Record<string, number>>((result, row) => { const key = text(row[field]); result[key] = (result[key] ?? 0) + 1; return result; }, {})).map(([key, count]) => ({ [field === "source" ? "source" : "status"]: key, count }));
  const rangePayments = payments.filter((row) => text(row.paidAt) >= from.slice(0, 10) && text(row.paidAt) < to.slice(0, 10));
  const paymentAdjustments = adjustments.filter((row) => inRange(row.createdAt));
  const converted = enquiries.filter((row) => inRange(row.createdAt) && row.status === "converted").length;
  return { enquiriesBySource: groupCount(enquiries, "source"), projectsByStatus: groupCount(projects, "status"), ticketsByStatus: groupCount(tickets, "status"), paymentsByMethod: Object.entries(rangePayments.reduce<Record<string, { total: number; count: number }>>((result, row) => { const key = text(row.method); result[key] ??= { total: 0, count: 0 }; result[key].total += Number(row.amount ?? 0); result[key].count += 1; return result; }, {})).map(([method, value]) => ({ method, ...value })), staffWorkload: Object.entries(schedules.filter((row) => text(row.scheduledStart) >= from && text(row.scheduledStart) < to).reduce<Record<string, number>>((result, row) => { const key = text(row.assignedToName) || users.find((user) => user.id === row.assignedTo)?.name || "Unassigned"; result[key] = (result[key] ?? 0) + 1; return result; }, {})).map(([name, count]) => ({ name, count })), totals: { enquiries: enquiries.filter((row) => inRange(row.createdAt)).length, projects: projects.filter((row) => inRange(row.createdAt)).length, tickets: tickets.filter((row) => inRange(row.createdAt)).length, payments: rangePayments.reduce((sum, row) => sum + Number(row.amount ?? 0), 0), paymentAdjustments: paymentAdjustments.reduce((sum, row) => sum + Number(row.amount ?? 0), 0), netPayments: rangePayments.reduce((sum, row) => sum + Number(row.amount ?? 0), 0) - paymentAdjustments.reduce((sum, row) => sum + Number(row.amount ?? 0), 0), convertedEnquiries: converted, conversionRate: enquiries.filter((row) => inRange(row.createdAt)).length ? converted / enquiries.filter((row) => inRange(row.createdAt)).length * 100 : 0, outstandingBalance: projects.filter((row) => row.status !== "cancelled").reduce((sum, row) => sum + Math.max(Number(row.approvedAmount ?? row.estimatedAmount ?? 0) - Number(row.amountPaid ?? 0), 0), 0), overdueSurveys: schedules.filter((row) => row.eventType === "survey" && text(row.scheduledStart) < to && ["scheduled", "rescheduled"].includes(text(row.status))).length, overdueInstallations: schedules.filter((row) => row.eventType === "installation" && text(row.scheduledStart) < to && ["scheduled", "rescheduled"].includes(text(row.status))).length, resolvedTickets: tickets.filter((row) => inRange(row.updatedAt) && ["resolved", "closed"].includes(text(row.status))).length, averageResolutionDays: 0 } };
}

export async function createFirestoreNotification(input: { id: string; userId: string; type: string; title: string; message: string; entityType: string; entityId: string }) {
  await write(portalCollections.notifications, input.id, { userId: input.userId, type: input.type, title: input.title, message: input.message, entityType: input.entityType, entityId: input.entityId, readAt: null, createdAt: timestamp() });
}

export async function ensureFirestoreDueFollowUpNotifications() {
  const [enquiries, users, notifications] = await Promise.all([
    getFirestoreEnquiries(),
    listFirestorePortalUsers(),
    all<StoredRecord>(portalCollections.notifications),
  ]);
  const now = timestamp();
  const dueEnquiries = enquiries.filter((enquiry) => enquiry.followUpAt && enquiry.followUpAt <= now && !["converted", "lost"].includes(enquiry.status));
  const recipients = users.filter((user) => user.isActive && ["owner", "manager", "staff"].includes(user.role));
  const existing = new Set(notifications.filter((notification) => notification.type === "overdue-follow-up").map((notification) => `${text(notification.userId)}:${text(notification.entityId)}`));
  const writes = dueEnquiries.flatMap((enquiry) => recipients.flatMap((recipient) => {
    const key = `${recipient.id}:${enquiry.id}`;
    if (existing.has(key)) return [];
    return [{
      id: `overdue-follow-up-${recipient.id}-${enquiry.id}`,
      userId: recipient.id,
      type: "overdue-follow-up",
      title: "Follow-up is due",
      message: `${enquiry.reference} needs a follow-up for ${enquiry.customerName}.`,
      entityType: "enquiry",
      entityId: enquiry.id,
    }];
  }));
  await Promise.all(writes.map((notification) => createFirestoreNotification(notification)));
}

export async function markFirestoreNotificationRead(id: string, userId: string) {
  const current = await read<StoredRecord>(portalCollections.notifications, id);
  if (current?.userId === userId) await write(portalCollections.notifications, id, { readAt: timestamp() }, true);
}

export async function markAllFirestoreNotificationsRead(userId: string) {
  const notifications = (await all<StoredRecord>(portalCollections.notifications)).filter((notification) => notification.userId === userId && !notification.readAt);
  const readAt = timestamp();
  await Promise.all(notifications.map((notification) => write(portalCollections.notifications, text(notification.id), { readAt }, true)));
}

export async function recordFirestoreActivity(input: { entityType: string; entityId: string; action: string; actorId: string; details?: unknown }) {
  const actor = (await listFirestorePortalUsers()).find((user) => user.id === input.actorId);
  await write(portalCollections.activities, crypto.randomUUID(), { entityType: input.entityType, entityId: input.entityId, action: input.action, actorId: input.actorId, actorName: actor?.name ?? "", details: input.details ? JSON.stringify(input.details) : null, createdAt: timestamp() });
}

export async function createFirestoreSupportAccessToken(input: { tokenHash: string; ticketId: string; expiresAt: string }) {
  await write(portalCollections.counters, `support-access-${input.tokenHash}`, { type: "support-access", tokenHash: input.tokenHash, ticketId: input.ticketId, expiresAt: input.expiresAt, createdAt: timestamp() });
}

export async function getFirestoreEntity(collection: (typeof portalCollections)[keyof typeof portalCollections], id: string) {
  return read<StoredRecord>(collection, id);
}

export async function saveFirestoreCustomer(input: { id: string; name: string; businessName: string | null; customerType: string; phonePrimary: string; phoneSecondary: string | null; email: string | null; address: string | null; area: string | null; notes: string | null; createdBy?: string }) {
  const existing = await read<StoredRecord>(portalCollections.customers, input.id);
  await write(portalCollections.customers, input.id, { ...input, createdAt: existing?.createdAt ?? timestamp(), updatedAt: timestamp() }, Boolean(existing));
}

export async function saveFirestoreProduct(input: StoredRecord) {
  const existing = await read<StoredRecord>(portalCollections.products, text(input.id));
  await write(portalCollections.products, text(input.id), { ...input, createdAt: existing?.createdAt ?? input.createdAt ?? timestamp(), updatedAt: timestamp() }, Boolean(existing));
  if (existing && (existing.currentPrice !== input.currentPrice || existing.referencePrice !== input.referencePrice)) {
    await write(portalCollections.productPriceHistory, crypto.randomUUID(), { productId: text(input.id), previousPrice: numberOrNull(existing.currentPrice), newPrice: numberOrNull(input.currentPrice), previousReferencePrice: numberOrNull(existing.referencePrice), newReferencePrice: numberOrNull(input.referencePrice), reason: nullableText(input.priceChangeReason), changedBy: nullableText(input.updatedBy), createdAt: timestamp() });
  }
}

export async function saveFirestoreEnquiry(input: StoredRecord) {
  const customer = await read<StoredRecord>(portalCollections.customers, text(input.customerId));
  const assignee = input.assignedTo ? (await listFirestorePortalUsers()).find((user) => user.id === input.assignedTo) : null;
  await write(portalCollections.enquiries, text(input.id), { ...input, customerName: text(customer?.name), customerPhone: text(customer?.phonePrimary), assignedToName: assignee?.name ?? null, createdAt: input.createdAt ?? timestamp(), updatedAt: timestamp() }, Boolean(await read<StoredRecord>(portalCollections.enquiries, text(input.id))));
}

export async function saveFirestoreProject(input: StoredRecord) {
  const customer = await read<StoredRecord>(portalCollections.customers, text(input.customerId));
  const existing = await read<StoredRecord>(portalCollections.projects, text(input.id));
  await write(portalCollections.projects, text(input.id), { ...input, customerName: text(customer?.name), amountPaid: Number(existing?.amountPaid ?? input.amountPaid ?? 0), createdAt: existing?.createdAt ?? input.createdAt ?? timestamp(), updatedAt: timestamp() }, Boolean(existing));
}

export async function saveFirestoreSurvey(input: StoredRecord) {
  const users = await userMap();
  await write(portalCollections.siteSurveys, text(input.id), { ...input, surveyorName: input.surveyorId ? users.get(text(input.surveyorId))?.name ?? null : null, recordedByName: users.get(text(input.recordedBy))?.name ?? "", createdAt: input.createdAt ?? timestamp(), updatedAt: timestamp() });
}

export async function saveFirestoreQuotation(input: StoredRecord) {
  const customer = await read<StoredRecord>(portalCollections.customers, text(input.customerId));
  const project = input.projectId ? await read<StoredRecord>(portalCollections.projects, text(input.projectId)) : null;
  await write(portalCollections.quotations, text(input.id), { ...input, customerName: text(customer?.name), projectReference: nullableText(project?.reference), createdAt: input.createdAt ?? timestamp(), updatedAt: timestamp() });
}

export async function saveFirestorePayment(input: StoredRecord) {
  const quotation = input.quotationId ? await read<StoredRecord>(portalCollections.quotations, text(input.quotationId)) : null;
  const user = input.recordedBy ? (await listFirestorePortalUsers()).find((item) => item.id === input.recordedBy) : null;
  await write(portalCollections.payments, text(input.id), { ...input, quotationReference: nullableText(quotation?.reference), recordedByName: user?.name ?? "", createdAt: input.createdAt ?? timestamp() });
  const project = await read<StoredRecord>(portalCollections.projects, text(input.projectId));
  if (project) await write(portalCollections.projects, text(input.projectId), { amountPaid: Number(project.amountPaid ?? 0) + Number(input.amount ?? 0), updatedAt: timestamp() }, true);
}

export async function saveFirestorePaymentAdjustment(input: StoredRecord) {
  const payment = await read<StoredRecord>(portalCollections.payments, text(input.paymentId));
  const user = input.recordedBy ? (await listFirestorePortalUsers()).find((item) => item.id === input.recordedBy) : null;
  await write(portalCollections.paymentAdjustments, text(input.id), { ...input, paymentReference: nullableText(payment?.reference), recordedByName: user?.name ?? "", createdAt: input.createdAt ?? timestamp() });
  const project = await read<StoredRecord>(portalCollections.projects, text(input.projectId));
  if (project) await write(portalCollections.projects, text(input.projectId), { amountPaid: Math.max(Number(project.amountPaid ?? 0) - Number(input.amount ?? 0), 0), updatedAt: timestamp() }, true);
}

export async function saveFirestoreInstallationItem(input: StoredRecord) {
  const user = input.recordedBy ? (await listFirestorePortalUsers()).find((item) => item.id === input.recordedBy) : null;
  await write(portalCollections.installationItems, text(input.id), { ...input, recordedByName: user?.name ?? "", createdAt: input.createdAt ?? timestamp(), updatedAt: timestamp() });
}

export async function saveFirestoreTicket(input: StoredRecord) {
  const project = input.projectId ? await read<StoredRecord>(portalCollections.projects, text(input.projectId)) : null;
  await write(portalCollections.tickets, text(input.id), { ...input, projectReference: nullableText(project?.reference), assignedToName: null, createdAt: input.createdAt ?? timestamp(), updatedAt: timestamp() });
  const owners = (await listFirestorePortalUsers()).filter((user) => user.role === "owner" && user.isActive);
  await Promise.all(owners.map((owner) => createFirestoreNotification({ id: crypto.randomUUID(), userId: owner.id, type: "new-service-ticket", title: "New support ticket", message: `${text(input.reference)} from ${text(input.customerName)} needs review.`, entityType: "service-ticket", entityId: text(input.id) })));
}

export async function saveFirestoreTicketAttachment(input: StoredRecord) {
  const user = input.uploadedBy ? (await listFirestorePortalUsers()).find((item) => item.id === input.uploadedBy) : null;
  await write(portalCollections.ticketAttachments, text(input.id), { ...input, uploadedByName: user?.name ?? "", createdAt: input.createdAt ?? timestamp() });
}

export async function saveFirestoreCustomerTicketAttachment(input: StoredRecord) {
  await write(portalCollections.counters, text(input.id), { type: "customer-ticket-attachment", ...input, createdAt: input.createdAt ?? timestamp() });
}

export async function saveFirestoreSchedule(input: StoredRecord) {
  const users = await userMap();
  const project = input.projectId ? await read<StoredRecord>(portalCollections.projects, text(input.projectId)) : null;
  const ticket = input.ticketId ? await read<StoredRecord>(portalCollections.tickets, text(input.ticketId)) : null;
  await write(portalCollections.schedules, text(input.id), { ...input, projectReference: nullableText(project?.reference), ticketReference: nullableText(ticket?.reference), customerName: nullableText(project?.customerName) ?? nullableText(ticket?.customerName), siteAddress: nullableText(project?.siteAddress), assignedToName: input.assignedTo ? users.get(text(input.assignedTo))?.name ?? null : null, createdByName: users.get(text(input.createdBy))?.name ?? "", createdAt: input.createdAt ?? timestamp(), updatedAt: timestamp() });
}

export async function saveFirestoreJob(input: StoredRecord) {
  const users = await userMap();
  await write(portalCollections.jobs, text(input.id), { ...input, createdByName: users.get(text(input.createdBy))?.name ?? text(input.createdByName), assignedTechnicianName: input.assignedTechnicianId ? users.get(text(input.assignedTechnicianId))?.name ?? null : null, createdAt: input.createdAt ?? timestamp(), updatedAt: timestamp() });
}

export async function saveFirestoreJobResponse(input: StoredRecord) {
  const user = (await listFirestorePortalUsers()).find((item) => item.id === input.technicianId);
  await write(portalCollections.jobResponses, text(input.id), { ...input, technicianName: user?.name ?? "", respondedAt: input.respondedAt ?? timestamp() });
}

export async function saveFirestoreJobAssignment(input: StoredRecord) {
  const users = await userMap();
  await write(portalCollections.jobAssignments, text(input.id), { ...input, technicianName: users.get(text(input.technicianId))?.name ?? "", assignedByName: users.get(text(input.assignedBy))?.name ?? "", assignedAt: input.assignedAt ?? timestamp() });
}

export async function saveFirestoreJobCompletion(input: StoredRecord) {
  const users = await userMap();
  await write(portalCollections.jobCompletions, text(input.id), { ...input, submittedByName: users.get(text(input.submittedBy))?.name ?? "", verifiedByName: input.verifiedBy ? users.get(text(input.verifiedBy))?.name ?? null : null, submittedAt: input.submittedAt ?? timestamp() });
}

export async function saveFirestoreJobAttachment(input: StoredRecord) {
  const user = (await listFirestorePortalUsers()).find((item) => item.id === input.uploadedBy);
  await write(portalCollections.jobAttachments, text(input.id), { ...input, uploadedByName: user?.name ?? "", createdAt: input.createdAt ?? timestamp() });
}

export async function saveFirestorePointRule(input: StoredRecord) {
  const existing = await read<StoredRecord>(portalCollections.pointRules, text(input.id));
  await write(portalCollections.pointRules, text(input.id), { ...input, enabled: input.enabled ?? true, createdAt: existing?.createdAt ?? input.createdAt ?? timestamp(), updatedAt: timestamp() }, Boolean(existing));
}

export async function saveFirestorePointTransaction(input: StoredRecord) {
  const users = await userMap();
  const job = input.jobId ? await read<StoredRecord>(portalCollections.jobs, text(input.jobId)) : null;
  const rule = input.ruleId ? await read<StoredRecord>(portalCollections.pointRules, text(input.ruleId)) : null;
  await write(portalCollections.pointTransactions, text(input.id), { ...input, technicianName: users.get(text(input.technicianId))?.name ?? "", jobReference: nullableText(job?.reference), ruleName: nullableText(rule?.name), actorName: input.actorId ? users.get(text(input.actorId))?.name ?? null : null, createdAt: input.createdAt ?? timestamp() });
}

export async function saveFirestoreReward(input: StoredRecord) {
  const existing = await read<StoredRecord>(portalCollections.rewards, text(input.id));
  await write(portalCollections.rewards, text(input.id), { ...input, active: input.active ?? true, createdAt: existing?.createdAt ?? input.createdAt ?? timestamp(), updatedAt: timestamp() }, Boolean(existing));
}

export async function saveFirestoreRedemption(input: StoredRecord) {
  const users = await userMap();
  await write(portalCollections.redemptions, text(input.id), { ...input, technicianName: users.get(text(input.technicianId))?.name ?? "", approvedByName: input.approvedBy ? users.get(text(input.approvedBy))?.name ?? null : null, createdAt: input.createdAt ?? timestamp(), updatedAt: timestamp() });
}

export async function getFirestoreOwnerUsers() {
  return (await listFirestorePortalUsers()).filter((user) => user.role === "owner" && user.isActive);
}

export async function getFirestoreActivePortalUser(id: string) {
  const users = await listFirestorePortalUsers();
  return users.find((user) => user.id === id && user.isActive) ?? null;
}

export async function hasFirestoreDocument(collection: (typeof portalCollections)[keyof typeof portalCollections], id: string) {
  return Boolean(await read<StoredRecord>(collection, id));
}

export async function findFirestoreScheduleConflict(input: { start: string; end: string; assignedTo: string; excludeId?: string }) {
  const events = await all<StoredRecord>(portalCollections.schedules);
  return events.find((event) => event.id !== input.excludeId && event.assignedTo === input.assignedTo && !["cancelled", "completed"].includes(text(event.status)) && text(event.scheduledStart) < input.end && text(event.scheduledEnd) > input.start);
}

export async function updateFirestoreDocument(collection: (typeof portalCollections)[keyof typeof portalCollections], id: string, value: StoredRecord) {
  await write(collection, id, { ...value, updatedAt: timestamp() }, true);
}

export async function fsNextReference(name: string, prefix: string) {
  return nextReference(name, prefix);
}

export async function broadcastFirestoreJob(jobId: string, actorId: string, acceptanceDeadline: string | null) {
  const job = await getFirestoreServiceJob(jobId);
  if (!job) throw new Error("That job no longer exists.");
  if (job.status !== "draft" && job.status !== "reassignment-required") throw new Error("Only draft or reassignment jobs can be broadcast.");
  const technicians = await getFirestoreTechnicians();
  if (!technicians.length) throw new Error("NO_ACTIVE_TECHNICIANS");
  await updateFirestoreDocument(portalCollections.jobs, jobId, { status: "open", acceptanceDeadline, broadcastedBy: actorId, broadcastedAt: timestamp() });
  await Promise.all(technicians.map((technician) => createFirestoreNotification({ id: crypto.randomUUID(), userId: technician.id, type: "job-broadcast", title: "New technician job", message: `${job.reference}: ${job.title} is open for acceptance.`, entityType: "service-job", entityId: jobId })));
}

export async function respondFirestoreToJob(input: { jobId: string; technicianId: string; status: "accepted" | "declined"; reason: string | null }) {
  const db = getFirebaseAdminDb();
  const jobRef = getPortalCollection(portalCollections.jobs).doc(input.jobId);
  const responseId = crypto.randomUUID();
  const responseRef = getPortalCollection(portalCollections.jobResponses).doc(responseId);
  const now = timestamp();
  let accepted = false;
  await db.runTransaction(async (transaction) => {
    const jobSnapshot = await transaction.get(jobRef);
    if (!jobSnapshot.exists) throw new Error("JOB_NOT_AVAILABLE");
    const job = jobSnapshot.data() as StoredRecord;
    if (job.status !== "open" || (job.acceptanceDeadline && String(job.acceptanceDeadline) <= now)) throw new Error("JOB_NOT_AVAILABLE");
    if (input.status === "declined") {
      if (job[`response_${input.technicianId}`] === "declined") throw new Error("JOB_ALREADY_RESPONDED");
      transaction.set(responseRef, { jobId: input.jobId, technicianId: input.technicianId, status: "declined", reason: input.reason, respondedAt: now });
      transaction.set(jobRef, { [`response_${input.technicianId}`]: "declined", updatedAt: now }, { merge: true });
      return;
    }
    if (job.status !== "open" || (job.acceptanceDeadline && String(job.acceptanceDeadline) <= now)) throw new Error("JOB_ALREADY_TAKEN");
    transaction.update(jobRef, { status: "assigned", assignedTechnicianId: input.technicianId, updatedAt: now });
    transaction.set(responseRef, { jobId: input.jobId, technicianId: input.technicianId, status: "accepted", reason: input.reason, respondedAt: now });
    accepted = true;
  });
  if (accepted) {
    const user = (await listFirestorePortalUsers()).find((item) => item.id === input.technicianId);
    await saveFirestoreJobAssignment({ id: crypto.randomUUID(), jobId: input.jobId, technicianId: input.technicianId, assignmentType: "claim", assignedBy: input.technicianId, reason: "First valid acceptance" });
    const job = await getFirestoreServiceJob(input.jobId);
    if (job) {
      const technicians = await getFirestoreTechnicians();
      await Promise.all(technicians.filter((technician) => technician.id !== input.technicianId).map((technician) => createFirestoreNotification({ id: crypto.randomUUID(), userId: technician.id, type: "job-taken", title: "Job already taken", message: `${job.reference} was accepted by another technician.`, entityType: "service-job", entityId: input.jobId })));
      const owners = await getFirestoreOwnerUsers();
      await Promise.all(owners.map((owner) => createFirestoreNotification({ id: crypto.randomUUID(), userId: owner.id, type: "job-accepted", title: "Job accepted", message: `${job.reference} was accepted by ${user?.name ?? "a technician"}.`, entityType: "service-job", entityId: input.jobId })));
    }
  }
  return { accepted };
}

export async function assignFirestoreJob(input: { jobId: string; technicianId: string; actorId: string; reason: string | null }) {
  const job = await getFirestoreServiceJob(input.jobId);
  const technician = await getFirestoreActivePortalUser(input.technicianId);
  if (!job) throw new Error("That job no longer exists.");
  if (!technician || technician.role !== "technician") throw new Error("Select an active technician.");
  if (["completed", "cancelled", "expired"].includes(job.status)) throw new Error("JOB_NOT_ASSIGNABLE");
  await updateFirestoreDocument(portalCollections.jobs, input.jobId, { status: "assigned", assignedTechnicianId: input.technicianId });
  await saveFirestoreJobAssignment({ id: crypto.randomUUID(), jobId: input.jobId, technicianId: input.technicianId, assignmentType: job.assignedTechnicianId ? "reassignment" : "manual", assignedBy: input.actorId, reason: input.reason });
  await createFirestoreNotification({ id: crypto.randomUUID(), userId: input.technicianId, type: "job-assigned", title: "Job assigned", message: "A service job has been assigned to you.", entityType: "service-job", entityId: input.jobId });
}

export async function updateFirestoreJobStatus(input: { jobId: string; status: string; actorId: string; reason: string | null }) {
  const job = await getFirestoreServiceJob(input.jobId);
  if (!job) throw new Error("That job no longer exists.");
  const allowed: Record<string, string[]> = { draft: ["cancelled"], open: ["expired", "cancelled", "reassignment-required"], assigned: ["in-progress", "reassignment-required", "cancelled"], "in-progress": ["reassignment-required", "cancelled"], "awaiting-verification": ["in-progress", "reassignment-required", "cancelled"], "reassignment-required": ["cancelled"], completed: [], cancelled: [], expired: [] };
  if (!allowed[job.status]?.includes(input.status)) throw new Error("INVALID_JOB_TRANSITION");
  if (["assigned", "in-progress", "awaiting-verification"].includes(input.status) && !job.assignedTechnicianId) throw new Error("JOB_REQUIRES_TECHNICIAN");
  await updateFirestoreDocument(portalCollections.jobs, input.jobId, { status: input.status, statusReason: input.reason, statusChangedBy: input.actorId });
}

export async function submitFirestoreJobCompletion(input: { jobId: string; technicianId: string; summary: string; workNotes: string | null; materials: string | null; cameraCount: number | null }) {
  const job = await getFirestoreServiceJob(input.jobId);
  if (!job || job.assignedTechnicianId !== input.technicianId) throw new Error("Only the assigned technician can submit completion.");
  if (job.category === "cctv-installation" && (!input.cameraCount || input.cameraCount < 1)) throw new Error("Enter the number of cameras completed for this customer.");
  await saveFirestoreJobCompletion({ id: crypto.randomUUID(), jobId: input.jobId, submittedBy: input.technicianId, summary: input.summary, workNotes: input.workNotes, materials: input.materials, cameraCount: input.cameraCount, status: "pending" });
  await updateFirestoreDocument(portalCollections.jobs, input.jobId, { status: "awaiting-verification" });
  const owners = await getFirestoreOwnerUsers();
  await Promise.all(owners.map((owner) => createFirestoreNotification({ id: crypto.randomUUID(), userId: owner.id, type: "job-completion-submitted", title: "Job completion needs review", message: `${job.reference}: ${job.title} has been submitted for verification.`, entityType: "service-job", entityId: input.jobId })));
}

export async function verifyFirestoreJobCompletion(input: { jobId: string; reviewerId: string; approve: boolean; reason: string | null }) {
  const job = await getFirestoreServiceJob(input.jobId);
  const completion = await getFirestoreJobCompletion(input.jobId);
  if (!job || !completion || !job.assignedTechnicianId || completion.status !== "pending") throw new Error("No pending completion was found for this job.");
  if (input.approve) {
    await updateFirestoreDocument(portalCollections.jobCompletions, completion.id, { status: "approved", verifiedBy: input.reviewerId, verifiedAt: timestamp() });
    await updateFirestoreDocument(portalCollections.jobs, input.jobId, { status: "completed", verifiedBy: input.reviewerId });
    const rules = await getFirestorePointRules();
    const rule = rules.find((item) => item.type === "verified-completion" && item.enabled);
    const points = rule ? Number(completion.cameraCount ?? 0) * rule.points : 0;
    if (rule && points > 0) await saveFirestorePointTransaction({ id: crypto.randomUUID(), technicianId: job.assignedTechnicianId, type: "job-reward", points, jobId: input.jobId, ruleId: rule.id, reason: `${rule.name}: ${completion.cameraCount ?? 0} camera(s) × ${rule.points} points`, actorId: input.reviewerId });
    await createFirestoreNotification({ id: crypto.randomUUID(), userId: job.assignedTechnicianId, type: "job-completed", title: "Job verified", message: `${job.reference} was verified and your SS Points ledger was updated.`, entityType: "service-job", entityId: input.jobId });
  } else {
    await updateFirestoreDocument(portalCollections.jobCompletions, completion.id, { status: "returned", returnReason: input.reason, verifiedBy: input.reviewerId, verifiedAt: timestamp() });
    await updateFirestoreDocument(portalCollections.jobs, input.jobId, { status: "in-progress" });
    await createFirestoreNotification({ id: crypto.randomUUID(), userId: job.assignedTechnicianId, type: "job-completion-returned", title: "Completion needs correction", message: `${job.reference} was returned for more work.`, entityType: "service-job", entityId: input.jobId });
  }
}

export async function requestFirestoreRedemption(input: { id: string; reference: string; technicianId: string; rewardId: string; quantity: number; notes: string | null }) {
  const reward = (await getFirestoreRewardItems(true)).find((item) => item.id === input.rewardId);
  const balance = await getFirestorePointBalance(input.technicianId);
  if (!reward || !reward.active) throw new Error("That reward is no longer available.");
  if (reward.stockQuantity < input.quantity) throw new Error("There is not enough reward stock available.");
  const required = reward.pointsCost * input.quantity;
  if (balance.balance < required) throw new Error("You do not have enough SS Points for this request.");
  await saveFirestoreRedemption({ id: input.id, reference: input.reference, technicianId: input.technicianId, rewardId: input.rewardId, rewardName: reward.name, pointsCost: reward.pointsCost, quantity: input.quantity, status: "pending-approval", notes: input.notes });
  const owners = await getFirestoreOwnerUsers();
  await Promise.all(owners.map((owner) => createFirestoreNotification({ id: crypto.randomUUID(), userId: owner.id, type: "redemption-requested", title: "Reward redemption requested", message: `${input.reference} needs approval.`, entityType: "redemption", entityId: input.id })));
}

export async function approveFirestoreRedemption(input: { redemptionId: string; actorId: string; approve: boolean; reason: string | null }) {
  const redemption = (await getFirestoreRedemptionRequests()).find((item) => item.id === input.redemptionId);
  if (!redemption || redemption.status !== "pending-approval") throw new Error("That redemption is no longer pending approval.");
  if (!input.approve) {
    await updateFirestoreDocument(portalCollections.redemptions, input.redemptionId, { status: "rejected", approvedBy: input.actorId, rejectionReason: input.reason });
    return;
  }
  const reward = (await getFirestoreRewardItems(true)).find((item) => item.id === redemption.rewardId);
  const balance = await getFirestorePointBalance(redemption.technicianId);
  const required = redemption.pointsCost * redemption.quantity;
  if (!reward || !reward.active || reward.stockQuantity < redemption.quantity) throw new Error("Reward stock is no longer sufficient.");
  if (balance.balance < required) throw new Error("The technician no longer has enough SS Points.");
  await saveFirestoreReward({ id: reward.id, productId: reward.productId, name: reward.name, description: reward.description, category: reward.category, imagePath: reward.imagePath, pointsCost: reward.pointsCost, stockQuantity: reward.stockQuantity - redemption.quantity, active: reward.active });
  await updateFirestoreDocument(portalCollections.redemptions, input.redemptionId, { status: "approved", approvedBy: input.actorId, approvalReason: input.reason });
  await saveFirestorePointTransaction({ id: crypto.randomUUID(), technicianId: redemption.technicianId, type: "redemption", points: -required, redemptionId: redemption.id, reason: `Reward redemption ${redemption.reference}`, actorId: input.actorId });
  await createFirestoreNotification({ id: crypto.randomUUID(), userId: redemption.technicianId, type: "redemption-approved", title: "Reward redemption approved", message: `${redemption.reference} was approved.`, entityType: "redemption", entityId: input.redemptionId });
}

export async function updateFirestoreRedemptionStatus(input: { redemptionId: string; status: "ready" | "collected" | "cancelled"; actorId: string; reason: string | null }) {
  const redemption = (await getFirestoreRedemptionRequests()).find((item) => item.id === input.redemptionId);
  if (!redemption) throw new Error("That redemption no longer exists.");
  await updateFirestoreDocument(portalCollections.redemptions, input.redemptionId, { status: input.status, statusReason: input.reason, statusChangedBy: input.actorId, collectedAt: input.status === "collected" ? timestamp() : null });
  if (input.status === "ready" || input.status === "collected") await createFirestoreNotification({ id: crypto.randomUUID(), userId: redemption.technicianId, type: "redemption-status", title: "Reward redemption updated", message: `Your redemption is ${input.status}.`, entityType: "redemption", entityId: input.redemptionId });
}
