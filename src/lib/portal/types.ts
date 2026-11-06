export const portalRoles = ["owner", "manager", "staff", "technician"] as const;
export type PortalRole = (typeof portalRoles)[number];

export const portalRoleLabels: Record<PortalRole, string> = {
  owner: "Owner",
  manager: "Website Manager",
  staff: "Staff",
  technician: "Technician",
};

export const customerTypes = ["individual", "business"] as const;
export type CustomerType = (typeof customerTypes)[number];

export const enquiryTypes = [
  "new-installation",
  "product-purchase",
  "repair-maintenance",
  "other",
] as const;
export type EnquiryType = (typeof enquiryTypes)[number];

export const enquirySources = [
  "phone",
  "whatsapp",
  "website",
  "walk-in",
  "referral",
  "other",
] as const;
export type EnquirySource = (typeof enquirySources)[number];

export const enquiryStatuses = [
  "new",
  "contacted",
  "survey-required",
  "quotation-in-progress",
  "converted",
  "lost",
] as const;
export type EnquiryStatus = (typeof enquiryStatuses)[number];

export const projectStatuses = [
  "new-enquiry",
  "survey-scheduled",
  "survey-completed",
  "quotation-preparation",
  "quotation-sent",
  "awaiting-approval",
  "approved",
  "installation-scheduled",
  "installation-in-progress",
  "completed",
  "cancelled",
] as const;
export type ProjectStatus = (typeof projectStatuses)[number];

export const quotationStatuses = ["draft", "sent", "accepted", "rejected", "expired", "cancelled"] as const;
export type QuotationStatus = (typeof quotationStatuses)[number];

export const paymentMethods = ["fonepay", "esewa", "cash"] as const;
export type PaymentMethod = (typeof paymentMethods)[number];

export const ticketCategories = [
  "camera-offline",
  "app-remote-viewing",
  "recording-storage",
  "physical-damage",
  "routine-maintenance",
  "other",
] as const;
export type TicketCategory = (typeof ticketCategories)[number];

export const ticketPriorities = ["normal", "urgent"] as const;
export type TicketPriority = (typeof ticketPriorities)[number];

export const ticketStatuses = [
  "open",
  "reviewed",
  "assigned",
  "scheduled",
  "in-progress",
  "waiting-customer",
  "resolved",
  "closed",
  "reopened",
] as const;
export type TicketStatus = (typeof ticketStatuses)[number];

export interface PortalUser {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  role: PortalRole;
  isActive: boolean;
}

export interface CustomerRecord {
  id: string;
  name: string;
  businessName: string | null;
  customerType: CustomerType;
  phonePrimary: string;
  phoneSecondary: string | null;
  email: string | null;
  address: string | null;
  area: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface EnquiryRecord {
  id: string;
  reference: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  type: EnquiryType;
  source: EnquirySource;
  status: EnquiryStatus;
  area: string | null;
  notes: string | null;
  followUpAt: string | null;
  assignedTo: string | null;
  assignedToName: string | null;
  createdAt: string;
}

export interface ProjectRecord {
  id: string;
  reference: string;
  customerId: string;
  customerName: string;
  title: string;
  projectType: string;
  status: ProjectStatus;
  siteAddress: string | null;
  area: string | null;
  siteLatitude: number | null;
  siteLongitude: number | null;
  siteInstructions: string | null;
  plannedInstallDate: string | null;
  estimatedAmount: number | null;
  approvedAmount: number | null;
  amountPaid: number;
  warrantyStartDate: string | null;
  warrantyEndDate: string | null;
  notes: string | null;
  createdAt: string;
}

export interface SiteSurveyRecord {
  id: string;
  projectId: string;
  surveyDate: string;
  surveyorId: string | null;
  surveyorName: string | null;
  propertyType: string | null;
  installationArea: string | null;
  cameraCount: number | null;
  cameraType: string | null;
  indoorOutdoor: string | null;
  cableLength: number | null;
  cableRoutes: string | null;
  storageRequirements: string | null;
  networkingNeeds: string | null;
  mountingConstraints: string | null;
  customerRequirements: string | null;
  outcome: string | null;
  nextSteps: string | null;
  recordedByName: string;
  createdAt: string;
  updatedAt: string;
}

export interface QuotationItemRecord {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  sortOrder: number;
}

export interface QuotationRecord {
  id: string;
  reference: string;
  customerId: string;
  customerName: string;
  projectId: string | null;
  projectReference: string | null;
  status: QuotationStatus;
  vatRate: number;
  subtotal: number;
  vatAmount: number;
  total: number;
  validDays: number;
  validUntil: string;
  notes: string | null;
  items: QuotationItemRecord[];
  createdAt: string;
  updatedAt: string;
}

export interface PaymentRecord {
  id: string;
  projectId: string;
  quotationId: string | null;
  quotationReference: string | null;
  method: PaymentMethod;
  amount: number;
  paidAt: string;
  reference: string | null;
  notes: string | null;
  recordedByName: string;
  createdAt: string;
}

export const paymentAdjustmentTypes = ["refund", "reversal"] as const;
export type PaymentAdjustmentType = (typeof paymentAdjustmentTypes)[number];

export interface PaymentAdjustmentRecord {
  id: string;
  projectId: string;
  paymentId: string;
  paymentReference: string | null;
  type: PaymentAdjustmentType;
  amount: number;
  reason: string;
  recordedByName: string;
  createdAt: string;
}

export const productPriceDisplayModes = ["show_price", "contact_for_price"] as const;
export type ProductPriceDisplayMode = (typeof productPriceDisplayModes)[number];

export const productPriceTypes = ["market", "mrp"] as const;
export type ProductPriceType = (typeof productPriceTypes)[number];

export const productAvailabilities = ["in_stock", "out_of_stock", "unavailable", "not_tracked"] as const;
export type ProductAvailability = (typeof productAvailabilities)[number];

export const productPublicationStatuses = ["draft", "published", "archived"] as const;
export type ProductPublicationStatus = (typeof productPublicationStatuses)[number];

export interface ProductRecord {
  id: string;
  legacyId: string | null;
  name: string;
  brand: string;
  model: string | null;
  categoryKey: string;
  categoryName: string;
  description: string | null;
  specifications: string | null;
  imagePath: string | null;
  imageAlt: string | null;
  sourceUrl: string | null;
  sourceCategory: string | null;
  currentPrice: number | null;
  referencePrice: number | null;
  priceType: ProductPriceType;
  priceDisplayMode: ProductPriceDisplayMode;
  availability: ProductAvailability;
  publicationStatus: ProductPublicationStatus;
  unit: string;
  warrantyMonths: number | null;
  createdBy: string | null;
  updatedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProductPriceHistoryRecord {
  id: string;
  productId: string;
  previousPrice: number | null;
  newPrice: number | null;
  previousReferencePrice: number | null;
  newReferencePrice: number | null;
  reason: string | null;
  changedByName: string | null;
  createdAt: string;
}

export const jobCategories = ["cctv-installation", "cctv-repair", "maintenance", "networking", "router-wifi", "access-control", "other"] as const;
export type JobCategory = (typeof jobCategories)[number];

export const jobStatuses = ["draft", "open", "assigned", "in-progress", "awaiting-verification", "completed", "reassignment-required", "cancelled", "expired"] as const;
export type JobStatus = (typeof jobStatuses)[number];

export const jobUrgencies = ["normal", "urgent"] as const;
export type JobUrgency = (typeof jobUrgencies)[number];

export const jobResponseStatuses = ["accepted", "declined"] as const;
export type JobResponseStatus = (typeof jobResponseStatuses)[number];

export interface ServiceJobRecord {
  id: string;
  reference: string;
  customerId: string | null;
  customerName: string;
  phone: string;
  siteAddress: string | null;
  siteArea: string | null;
  siteLatitude: number | null;
  siteLongitude: number | null;
  category: JobCategory;
  title: string;
  description: string;
  requiredSkills: string | null;
  preferredStart: string | null;
  preferredEnd: string | null;
  urgency: JobUrgency;
  estimatedMinutes: number | null;
  internalNotes: string | null;
  technicianNotes: string | null;
  acceptanceDeadline: string | null;
  status: JobStatus;
  assignedTechnicianId: string | null;
  assignedTechnicianName: string | null;
  createdByName: string;
  createdAt: string;
  updatedAt: string;
}

export interface JobResponseRecord {
  id: string;
  jobId: string;
  technicianId: string;
  technicianName: string;
  status: JobResponseStatus;
  reason: string | null;
  respondedAt: string;
}

export interface JobAssignmentRecord {
  id: string;
  jobId: string;
  technicianId: string;
  technicianName: string;
  assignmentType: "claim" | "manual" | "reassignment";
  assignedByName: string;
  reason: string | null;
  assignedAt: string;
  unassignedAt: string | null;
}

export interface JobCompletionRecord {
  id: string;
  jobId: string;
  submittedByName: string;
  summary: string;
  workNotes: string | null;
  materials: string | null;
  cameraCount: number | null;
  status: "pending" | "approved" | "returned";
  returnReason: string | null;
  submittedAt: string;
  verifiedByName: string | null;
  verifiedAt: string | null;
}

export interface JobAttachmentRecord {
  id: string;
  jobId: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  uploadedByName: string;
  createdAt: string;
}

export const pointRuleTypes = ["verified-completion", "category-bonus", "urgent-bonus", "quality-bonus", "milestone-bonus"] as const;
export type PointRuleType = (typeof pointRuleTypes)[number];

export const pointTransactionTypes = ["job-reward", "bonus", "redemption", "reversal", "admin-adjustment"] as const;
export type PointTransactionType = (typeof pointTransactionTypes)[number];

export interface PointRuleRecord {
  id: string;
  name: string;
  type: PointRuleType;
  points: number;
  category: JobCategory | null;
  enabled: boolean;
  sampleLabel: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PointTransactionRecord {
  id: string;
  technicianId: string;
  technicianName: string;
  type: PointTransactionType;
  points: number;
  jobId: string | null;
  jobReference: string | null;
  redemptionId: string | null;
  ruleId: string | null;
  ruleName: string | null;
  reason: string | null;
  actorName: string | null;
  createdAt: string;
}

export interface RewardItemRecord {
  id: string;
  productId: string | null;
  name: string;
  description: string | null;
  category: string;
  imagePath: string | null;
  pointsCost: number;
  stockQuantity: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export const redemptionStatuses = ["requested", "pending-approval", "approved", "ready", "collected", "rejected", "cancelled"] as const;
export type RedemptionStatus = (typeof redemptionStatuses)[number];

export interface RedemptionRequestRecord {
  id: string;
  reference: string;
  technicianId: string;
  technicianName: string;
  rewardId: string;
  rewardName: string;
  pointsCost: number;
  quantity: number;
  status: RedemptionStatus;
  notes: string | null;
  approvedByName: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface InstallationItemRecord {
  id: string;
  projectId: string;
  description: string;
  quotedQuantity: number | null;
  installedQuantity: number;
  serialNumber: string | null;
  notes: string | null;
  recordedByName: string;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceTicketRecord {
  id: string;
  reference: string;
  customerId: string | null;
  customerName: string;
  phone: string;
  email: string | null;
  projectId: string | null;
  projectReference: string | null;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  description: string;
  preferredContact: string | null;
  assignedTo: string | null;
  assignedToName: string | null;
  internalNotes: string | null;
  customerUpdate: string | null;
  resolutionSummary: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TicketAttachmentRecord {
  id: string;
  ticketId: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  uploadedByName: string;
  createdAt: string;
}

export const scheduleEventTypes = ["survey", "installation", "service-visit"] as const;
export type ScheduleEventType = (typeof scheduleEventTypes)[number];

export const scheduleEventStatuses = ["scheduled", "in-progress", "completed", "cancelled", "rescheduled"] as const;
export type ScheduleEventStatus = (typeof scheduleEventStatuses)[number];

export interface ScheduleEventRecord {
  id: string;
  eventType: ScheduleEventType;
  title: string;
  scheduledStart: string;
  scheduledEnd: string;
  status: ScheduleEventStatus;
  projectId: string | null;
  projectReference: string | null;
  ticketId: string | null;
  ticketReference: string | null;
  customerName: string | null;
  siteAddress: string | null;
  assignedTo: string | null;
  assignedToName: string | null;
  notes: string | null;
  createdByName: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationRecord {
  id: string;
  type: string;
  title: string;
  message: string;
  entityType: string;
  entityId: string;
  readAt: string | null;
  createdAt: string;
}

export interface DashboardMetrics {
  newEnquiries: number;
  followUpsDue: number;
  surveysDue: number;
  activeProjects: number;
  upcomingInstallations: number;
  inProgressProjects: number;
  openBalances: number;
  openTickets: number;
  urgentTickets: number;
  teamMembers: number;
}

export interface ActivityRecord {
  action: string;
  entityType: string;
  entityId: string;
  details: string | null;
  actorName: string;
  createdAt: string;
}
