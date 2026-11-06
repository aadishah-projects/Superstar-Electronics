import { getPortalDatabase } from "@/lib/portal/db";
import { getPortalToday } from "@/lib/portal/config";
import type { ActivityRecord, DashboardMetrics, CustomerRecord, EnquiryRecord, InstallationItemRecord, JobAssignmentRecord, JobAttachmentRecord, JobCompletionRecord, JobResponseRecord, NotificationRecord, PaymentAdjustmentRecord, PaymentRecord, PointRuleRecord, PointTransactionRecord, ProductPriceHistoryRecord, ProductRecord, ProjectRecord, RedemptionRequestRecord, RewardItemRecord, PortalUser, QuotationRecord, ScheduleEventRecord, ServiceJobRecord, ServiceTicketRecord, SiteSurveyRecord, TicketAttachmentRecord } from "@/lib/portal/types";

function mapCustomer(row: Record<string, unknown>) {
  return {
    id: String(row.id),
    name: String(row.name),
    businessName: (row.business_name as string | null) ?? null,
    customerType: row.customer_type as CustomerRecord["customerType"],
    phonePrimary: String(row.phone_primary),
    phoneSecondary: (row.phone_secondary as string | null) ?? null,
    email: (row.email as string | null) ?? null,
    address: (row.address as string | null) ?? null,
    area: (row.area as string | null) ?? null,
    notes: (row.notes as string | null) ?? null,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  } satisfies CustomerRecord;
}

function mapProduct(row: Record<string, unknown>) {
  const money = (value: unknown) => value === null || value === undefined ? null : Number(value) / 100;
  return {
    id: String(row.id),
    legacyId: (row.legacy_id as string | null) ?? null,
    name: String(row.name),
    brand: String(row.brand),
    model: (row.model as string | null) ?? null,
    categoryKey: String(row.category_key),
    categoryName: String(row.category_name),
    description: (row.description as string | null) ?? null,
    specifications: (row.specifications as string | null) ?? null,
    imagePath: (row.image_path as string | null) ?? null,
    imageAlt: (row.image_alt as string | null) ?? null,
    sourceUrl: (row.source_url as string | null) ?? null,
    sourceCategory: (row.source_category as string | null) ?? null,
    currentPrice: money(row.current_price_paisa),
    referencePrice: money(row.reference_price_paisa),
    priceDisplayMode: row.price_display_mode as ProductRecord["priceDisplayMode"],
    priceType: row.price_type as ProductRecord["priceType"],
    availability: row.availability as ProductRecord["availability"],
    publicationStatus: row.publication_status as ProductRecord["publicationStatus"],
    unit: String(row.unit),
    warrantyMonths: row.warranty_months === null ? null : Number(row.warranty_months),
    createdBy: (row.created_by as string | null) ?? null,
    updatedBy: (row.updated_by as string | null) ?? null,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  } satisfies ProductRecord;
}

export function getProducts(filters: { search?: string; status?: string; availability?: string; priceMode?: string } = {}) {
  const conditions = ["1 = 1"];
  const parameters: string[] = [];
  const search = filters.search?.trim() ?? "";
  if (search) {
    const term = `%${search}%`;
    conditions.push("(name LIKE ? OR brand LIKE ? OR model LIKE ? OR category_name LIKE ? OR legacy_id LIKE ?)");
    parameters.push(term, term, term, term, term);
  }
  if (filters.status) {
    conditions.push("publication_status = ?");
    parameters.push(filters.status);
  }
  if (filters.availability) {
    conditions.push("availability = ?");
    parameters.push(filters.availability);
  }
  if (filters.priceMode) {
    conditions.push("price_display_mode = ?");
    parameters.push(filters.priceMode);
  }

  const rows = getPortalDatabase().prepare(
    `SELECT id, legacy_id, name, brand, model, category_key, category_name, description, specifications,
      image_path, image_alt, source_url, source_category, current_price_paisa, reference_price_paisa,
      price_display_mode, price_type, availability, publication_status, unit, warranty_months, created_by, updated_by, created_at, updated_at
     FROM products WHERE ${conditions.join(" AND ")} ORDER BY updated_at DESC, name ASC`,
  ).all(...parameters) as Array<Record<string, unknown>>;
  return rows.map(mapProduct);
}

export function getProduct(id: string) {
  const row = getPortalDatabase().prepare(
    `SELECT id, legacy_id, name, brand, model, category_key, category_name, description, specifications,
      image_path, image_alt, source_url, source_category, current_price_paisa, reference_price_paisa,
      price_display_mode, price_type, availability, publication_status, unit, warranty_months, created_by, updated_by, created_at, updated_at
     FROM products WHERE id = ? LIMIT 1`,
  ).get(id) as Record<string, unknown> | undefined;
  return row ? mapProduct(row) : undefined;
}

export function getProductPriceHistory(productId: string) {
  const rows = getPortalDatabase().prepare(
    `SELECT product_price_history.id, product_price_history.product_id, product_price_history.previous_price_paisa,
      product_price_history.new_price_paisa, product_price_history.previous_reference_price_paisa,
      product_price_history.new_reference_price_paisa, product_price_history.reason, users.name AS changed_by_name,
      product_price_history.created_at
     FROM product_price_history
     LEFT JOIN users ON users.id = product_price_history.changed_by
     WHERE product_price_history.product_id = ? ORDER BY product_price_history.created_at DESC`,
  ).all(productId) as Array<Record<string, unknown>>;
  const money = (value: unknown) => value === null || value === undefined ? null : Number(value) / 100;
  return rows.map((row) => ({
    id: String(row.id),
    productId: String(row.product_id),
    previousPrice: money(row.previous_price_paisa),
    newPrice: money(row.new_price_paisa),
    previousReferencePrice: money(row.previous_reference_price_paisa),
    newReferencePrice: money(row.new_reference_price_paisa),
    reason: (row.reason as string | null) ?? null,
    changedByName: (row.changed_by_name as string | null) ?? null,
    createdAt: String(row.created_at),
  })) satisfies ProductPriceHistoryRecord[];
}

export function getDashboardMetrics(): DashboardMetrics {
  const database = getPortalDatabase();
  const today = getPortalToday();
  const tomorrow = new Date(`${today}T00:00:00Z`);
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
  const tomorrowValue = tomorrow.toISOString().slice(0, 10);
  const metrics = database
    .prepare(
      `SELECT
        (SELECT COUNT(*) FROM enquiries WHERE status IN ('new', 'contacted', 'survey-required')) AS new_enquiries,
        (SELECT COUNT(*) FROM enquiries WHERE follow_up_at IS NOT NULL AND follow_up_at <= ? AND status NOT IN ('converted', 'lost')) AS follow_ups_due,
        (SELECT COUNT(*) FROM schedule_events WHERE event_type = 'survey' AND scheduled_start < ? AND status IN ('scheduled', 'rescheduled')) AS surveys_due,
        (SELECT COUNT(*) FROM projects WHERE status NOT IN ('completed', 'cancelled')) AS active_projects,
        (SELECT COUNT(*) FROM schedule_events WHERE event_type = 'installation' AND scheduled_start >= ? AND scheduled_start < ? AND status IN ('scheduled', 'rescheduled')) AS upcoming_installations,
        (SELECT COUNT(*) FROM projects WHERE status = 'installation-in-progress') AS in_progress_projects,
        (SELECT COUNT(*) FROM projects WHERE COALESCE(approved_amount, estimated_amount, 0) > amount_paid AND status NOT IN ('cancelled')) AS open_balances,
        (SELECT COUNT(*) FROM service_tickets WHERE status NOT IN ('resolved', 'closed')) AS open_tickets,
        (SELECT COUNT(*) FROM service_tickets WHERE priority = 'urgent' AND status NOT IN ('resolved', 'closed')) AS urgent_tickets,
        (SELECT COUNT(*) FROM users WHERE is_active = 1) AS team_members`,
    )
    .get(`${today}T23:59:59`, `${tomorrowValue}T00:00`, `${today}T00:00`, `${tomorrowValue}T00:00`) as {
    new_enquiries: number;
    follow_ups_due: number;
    surveys_due: number;
    active_projects: number;
    upcoming_installations: number;
    in_progress_projects: number;
    open_balances: number;
    open_tickets: number;
    urgent_tickets: number;
    team_members: number;
  };

  return {
    newEnquiries: metrics.new_enquiries,
    followUpsDue: metrics.follow_ups_due,
    surveysDue: metrics.surveys_due,
    activeProjects: metrics.active_projects,
    upcomingInstallations: metrics.upcoming_installations,
    inProgressProjects: metrics.in_progress_projects,
    openBalances: metrics.open_balances,
    openTickets: metrics.open_tickets,
    urgentTickets: metrics.urgent_tickets,
    teamMembers: metrics.team_members,
  };
}

export function getCustomers(search = "") {
  const term = `%${search.trim()}%`;
  const rows = getPortalDatabase()
    .prepare(
      `SELECT id, name, business_name, customer_type, phone_primary, phone_secondary, email, address, area, notes, created_at, updated_at
       FROM customers
       WHERE (? = '' OR id LIKE ? OR name LIKE ? OR business_name LIKE ? OR phone_primary LIKE ? OR phone_secondary LIKE ? OR email LIKE ? OR address LIKE ? OR area LIKE ?)
       ORDER BY updated_at DESC`,
    )
    .all(search.trim(), term, term, term, term, term, term, term, term) as Array<Record<string, unknown>>;

  return rows.map(mapCustomer);
}

export function getCustomer(id: string) {
  const row = getPortalDatabase()
    .prepare(
      `SELECT id, name, business_name, customer_type, phone_primary, phone_secondary, email, address, area, notes, created_at, updated_at
       FROM customers WHERE id = ? LIMIT 1`,
    )
    .get(id) as Record<string, unknown> | undefined;

  return row ? mapCustomer(row) : undefined;
}

export function getEnquiries(filters: { search?: string; status?: string } = {}) {
  const conditions = ["1 = 1"];
  const parameters: string[] = [];
  const search = filters.search?.trim() ?? "";
  if (search) {
    const term = `%${search}%`;
    conditions.push("(enquiries.reference LIKE ? OR customers.name LIKE ? OR customers.phone_primary LIKE ? OR enquiries.area LIKE ? OR enquiries.notes LIKE ?)");
    parameters.push(term, term, term, term, term);
  }
  if (filters.status) {
    conditions.push("enquiries.status = ?");
    parameters.push(filters.status);
  }

  const rows = getPortalDatabase()
    .prepare(
      `SELECT enquiries.id, enquiries.reference, enquiries.customer_id, customers.name AS customer_name,
        customers.phone_primary AS customer_phone, enquiries.type, enquiries.source, enquiries.status,
        enquiries.area, enquiries.notes, enquiries.follow_up_at, enquiries.assigned_to, users.name AS assigned_to_name, enquiries.created_at
       FROM enquiries
       JOIN customers ON customers.id = enquiries.customer_id
       LEFT JOIN users ON users.id = enquiries.assigned_to
       WHERE ${conditions.join(" AND ")}
       ORDER BY CASE WHEN enquiries.status IN ('new', 'contacted', 'survey-required') THEN 0 ELSE 1 END, enquiries.created_at DESC`,
    )
    .all(...parameters) as Array<Record<string, unknown>>;

  return rows.map((row) => ({
    id: String(row.id),
    reference: String(row.reference),
    customerId: String(row.customer_id),
    customerName: String(row.customer_name),
    customerPhone: String(row.customer_phone),
    type: row.type as EnquiryRecord["type"],
    source: row.source as EnquiryRecord["source"],
    status: row.status as EnquiryRecord["status"],
    area: (row.area as string | null) ?? null,
    notes: (row.notes as string | null) ?? null,
    followUpAt: (row.follow_up_at as string | null) ?? null,
    assignedTo: (row.assigned_to as string | null) ?? null,
    assignedToName: (row.assigned_to_name as string | null) ?? null,
    createdAt: String(row.created_at),
  })) satisfies EnquiryRecord[];
}

export function getEnquiry(id: string) {
  const row = getPortalDatabase()
    .prepare(
      `SELECT enquiries.id, enquiries.reference, enquiries.customer_id, customers.name AS customer_name,
        customers.phone_primary AS customer_phone, enquiries.type, enquiries.source, enquiries.status,
        enquiries.area, enquiries.notes, enquiries.follow_up_at, enquiries.assigned_to,
        users.name AS assigned_to_name, enquiries.created_at
       FROM enquiries
       JOIN customers ON customers.id = enquiries.customer_id
       LEFT JOIN users ON users.id = enquiries.assigned_to
       WHERE enquiries.id = ? LIMIT 1`,
    )
    .get(id) as Record<string, unknown> | undefined;

  if (!row) return undefined;
  return {
    id: String(row.id),
    reference: String(row.reference),
    customerId: String(row.customer_id),
    customerName: String(row.customer_name),
    customerPhone: String(row.customer_phone),
    type: row.type as EnquiryRecord["type"],
    source: row.source as EnquiryRecord["source"],
    status: row.status as EnquiryRecord["status"],
    area: (row.area as string | null) ?? null,
    notes: (row.notes as string | null) ?? null,
    followUpAt: (row.follow_up_at as string | null) ?? null,
    assignedTo: (row.assigned_to as string | null) ?? null,
    assignedToName: (row.assigned_to_name as string | null) ?? null,
    createdAt: String(row.created_at),
  } satisfies EnquiryRecord;
}

export function getProjects(filters: { search?: string; status?: string } = {}) {
  const conditions = ["1 = 1"];
  const parameters: string[] = [];
  const search = filters.search?.trim() ?? "";
  if (search) {
    const term = `%${search}%`;
    conditions.push("(projects.reference LIKE ? OR projects.title LIKE ? OR customers.name LIKE ? OR customers.phone_primary LIKE ? OR projects.site_address LIKE ? OR projects.area LIKE ?)");
    parameters.push(term, term, term, term, term, term);
  }
  if (filters.status) {
    conditions.push("projects.status = ?");
    parameters.push(filters.status);
  }

  const rows = getPortalDatabase()
    .prepare(
      `SELECT projects.id, projects.reference, projects.customer_id, customers.name AS customer_name,
        projects.title, projects.project_type, projects.status, projects.site_address, projects.area,
        projects.site_latitude, projects.site_longitude, projects.site_instructions,
        projects.planned_install_date, projects.estimated_amount, projects.approved_amount, projects.amount_paid,
        projects.warranty_start_date, projects.warranty_end_date, projects.notes, projects.created_at
       FROM projects JOIN customers ON customers.id = projects.customer_id
       WHERE ${conditions.join(" AND ")}
       ORDER BY projects.created_at DESC`,
    )
    .all(...parameters) as Array<Record<string, unknown>>;

  return rows.map((row) => ({
    id: String(row.id),
    reference: String(row.reference),
    customerId: String(row.customer_id),
    customerName: String(row.customer_name),
    title: String(row.title),
    projectType: String(row.project_type),
    status: row.status as ProjectRecord["status"],
    siteAddress: (row.site_address as string | null) ?? null,
    area: (row.area as string | null) ?? null,
    siteLatitude: row.site_latitude === null ? null : Number(row.site_latitude),
    siteLongitude: row.site_longitude === null ? null : Number(row.site_longitude),
    siteInstructions: (row.site_instructions as string | null) ?? null,
    plannedInstallDate: (row.planned_install_date as string | null) ?? null,
    estimatedAmount: typeof row.estimated_amount === "number" ? row.estimated_amount : null,
    approvedAmount: typeof row.approved_amount === "number" ? row.approved_amount : null,
    amountPaid: typeof row.amount_paid === "number" ? row.amount_paid : 0,
    warrantyStartDate: (row.warranty_start_date as string | null) ?? null,
    warrantyEndDate: (row.warranty_end_date as string | null) ?? null,
    notes: (row.notes as string | null) ?? null,
    createdAt: String(row.created_at),
  })) satisfies ProjectRecord[];
}

export function getProject(id: string) {
  const row = getPortalDatabase()
    .prepare(
      `SELECT projects.id, projects.reference, projects.customer_id, customers.name AS customer_name,
        projects.title, projects.project_type, projects.status, projects.site_address, projects.area,
        projects.site_latitude, projects.site_longitude, projects.site_instructions,
        projects.planned_install_date, projects.estimated_amount, projects.approved_amount, projects.amount_paid,
        projects.warranty_start_date, projects.warranty_end_date, projects.notes, projects.created_at
       FROM projects JOIN customers ON customers.id = projects.customer_id
       WHERE projects.id = ? LIMIT 1`,
    )
    .get(id) as Record<string, unknown> | undefined;

  if (!row) return undefined;
  return {
    id: String(row.id),
    reference: String(row.reference),
    customerId: String(row.customer_id),
    customerName: String(row.customer_name),
    title: String(row.title),
    projectType: String(row.project_type),
    status: row.status as ProjectRecord["status"],
    siteAddress: (row.site_address as string | null) ?? null,
    area: (row.area as string | null) ?? null,
    siteLatitude: row.site_latitude === null ? null : Number(row.site_latitude),
    siteLongitude: row.site_longitude === null ? null : Number(row.site_longitude),
    siteInstructions: (row.site_instructions as string | null) ?? null,
    plannedInstallDate: (row.planned_install_date as string | null) ?? null,
    estimatedAmount: typeof row.estimated_amount === "number" ? row.estimated_amount : null,
    approvedAmount: typeof row.approved_amount === "number" ? row.approved_amount : null,
    amountPaid: typeof row.amount_paid === "number" ? row.amount_paid : 0,
    warrantyStartDate: (row.warranty_start_date as string | null) ?? null,
    warrantyEndDate: (row.warranty_end_date as string | null) ?? null,
    notes: (row.notes as string | null) ?? null,
    createdAt: String(row.created_at),
  } satisfies ProjectRecord;
}

export function getSiteSurveys(projectId: string) {
  const rows = getPortalDatabase()
    .prepare(
      `SELECT site_surveys.id, site_surveys.project_id, site_surveys.survey_date, site_surveys.surveyor_id,
        surveyors.name AS surveyor_name, site_surveys.property_type, site_surveys.installation_area,
        site_surveys.camera_count, site_surveys.camera_type, site_surveys.indoor_outdoor,
        site_surveys.cable_length, site_surveys.cable_routes, site_surveys.storage_requirements,
        site_surveys.networking_needs, site_surveys.mounting_constraints, site_surveys.customer_requirements,
        site_surveys.outcome, site_surveys.next_steps, recorders.name AS recorded_by_name,
        site_surveys.created_at, site_surveys.updated_at
       FROM site_surveys
       LEFT JOIN users AS surveyors ON surveyors.id = site_surveys.surveyor_id
       JOIN users AS recorders ON recorders.id = site_surveys.recorded_by
       WHERE site_surveys.project_id = ?
       ORDER BY site_surveys.survey_date DESC, site_surveys.created_at DESC`,
    )
    .all(projectId) as Array<Record<string, unknown>>;

  return rows.map((row) => ({
    id: String(row.id),
    projectId: String(row.project_id),
    surveyDate: String(row.survey_date),
    surveyorId: (row.surveyor_id as string | null) ?? null,
    surveyorName: (row.surveyor_name as string | null) ?? null,
    propertyType: (row.property_type as string | null) ?? null,
    installationArea: (row.installation_area as string | null) ?? null,
    cameraCount: row.camera_count === null ? null : Number(row.camera_count),
    cameraType: (row.camera_type as string | null) ?? null,
    indoorOutdoor: (row.indoor_outdoor as string | null) ?? null,
    cableLength: row.cable_length === null ? null : Number(row.cable_length),
    cableRoutes: (row.cable_routes as string | null) ?? null,
    storageRequirements: (row.storage_requirements as string | null) ?? null,
    networkingNeeds: (row.networking_needs as string | null) ?? null,
    mountingConstraints: (row.mounting_constraints as string | null) ?? null,
    customerRequirements: (row.customer_requirements as string | null) ?? null,
    outcome: (row.outcome as string | null) ?? null,
    nextSteps: (row.next_steps as string | null) ?? null,
    recordedByName: String(row.recorded_by_name),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  })) satisfies SiteSurveyRecord[];
}

function mapQuotation(row: Record<string, unknown>): QuotationRecord {
  const items = getPortalDatabase()
    .prepare(
      `SELECT id, description, quantity, unit_price, line_total, sort_order
       FROM quotation_items WHERE quotation_id = ? ORDER BY sort_order ASC`,
    )
    .all(String(row.id)) as Array<Record<string, unknown>>;

  return {
    id: String(row.id),
    reference: String(row.reference),
    customerId: String(row.customer_id),
    customerName: String(row.customer_name),
    projectId: (row.project_id as string | null) ?? null,
    projectReference: (row.project_reference as string | null) ?? null,
    status: row.status as QuotationRecord["status"],
    vatRate: Number(row.vat_rate),
    subtotal: Number(row.subtotal),
    vatAmount: Number(row.vat_amount),
    total: Number(row.total),
    validDays: Number(row.valid_days),
    validUntil: String(row.valid_until),
    notes: (row.notes as string | null) ?? null,
    items: items.map((item) => ({
      id: String(item.id),
      description: String(item.description),
      quantity: Number(item.quantity),
      unitPrice: Number(item.unit_price),
      lineTotal: Number(item.line_total),
      sortOrder: Number(item.sort_order),
    })),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

export function getQuotations(projectId?: string) {
  const filter = projectId ?? null;
  const rows = getPortalDatabase()
    .prepare(
      `SELECT quotations.id, quotations.reference, quotations.customer_id, customers.name AS customer_name,
        quotations.project_id, projects.reference AS project_reference, quotations.status, quotations.vat_rate,
        quotations.subtotal, quotations.vat_amount, quotations.total, quotations.valid_days, quotations.valid_until,
        quotations.notes, quotations.created_at, quotations.updated_at
       FROM quotations
       JOIN customers ON customers.id = quotations.customer_id
       LEFT JOIN projects ON projects.id = quotations.project_id
       WHERE (? IS NULL OR quotations.project_id = ?)
       ORDER BY quotations.created_at DESC`,
    )
    .all(filter, filter) as Array<Record<string, unknown>>;

  return rows.map(mapQuotation);
}

export function getQuotation(id: string) {
  const row = getPortalDatabase()
    .prepare(
      `SELECT quotations.id, quotations.reference, quotations.customer_id, customers.name AS customer_name,
        quotations.project_id, projects.reference AS project_reference, quotations.status, quotations.vat_rate,
        quotations.subtotal, quotations.vat_amount, quotations.total, quotations.valid_days, quotations.valid_until,
        quotations.notes, quotations.created_at, quotations.updated_at
       FROM quotations
       JOIN customers ON customers.id = quotations.customer_id
       LEFT JOIN projects ON projects.id = quotations.project_id
       WHERE quotations.id = ? LIMIT 1`,
    )
    .get(id) as Record<string, unknown> | undefined;

  return row ? mapQuotation(row) : undefined;
}

export function getPayments(projectId: string) {
  const rows = getPortalDatabase()
    .prepare(
      `SELECT payments.id, payments.project_id, payments.quotation_id, quotations.reference AS quotation_reference,
        payments.method, payments.amount, payments.paid_at, payments.reference AS payment_reference,
        payments.notes, users.name AS recorded_by_name, payments.created_at
       FROM payments
       LEFT JOIN quotations ON quotations.id = payments.quotation_id
       JOIN users ON users.id = payments.recorded_by
       WHERE payments.project_id = ?
       ORDER BY payments.paid_at DESC, payments.created_at DESC`,
    )
    .all(projectId) as Array<Record<string, unknown>>;

  return rows.map((row) => ({
    id: String(row.id),
    projectId: String(row.project_id),
    quotationId: (row.quotation_id as string | null) ?? null,
    quotationReference: (row.quotation_reference as string | null) ?? null,
    method: row.method as PaymentRecord["method"],
    amount: Number(row.amount),
    paidAt: String(row.paid_at),
    reference: (row.payment_reference as string | null) ?? null,
    notes: (row.notes as string | null) ?? null,
    recordedByName: String(row.recorded_by_name),
    createdAt: String(row.created_at),
  })) satisfies PaymentRecord[];
}

export function getPaymentAdjustments(projectId: string) {
  const rows = getPortalDatabase()
    .prepare(
      `SELECT payment_adjustments.id, payment_adjustments.project_id, payment_adjustments.payment_id,
        payments.reference AS payment_reference, payment_adjustments.type, payment_adjustments.amount,
        payment_adjustments.reason, users.name AS recorded_by_name, payment_adjustments.created_at
       FROM payment_adjustments
       JOIN payments ON payments.id = payment_adjustments.payment_id
       JOIN users ON users.id = payment_adjustments.recorded_by
       WHERE payment_adjustments.project_id = ?
       ORDER BY payment_adjustments.created_at DESC`,
    )
    .all(projectId) as Array<Record<string, unknown>>;

  return rows.map((row) => ({
    id: String(row.id),
    projectId: String(row.project_id),
    paymentId: String(row.payment_id),
    paymentReference: (row.payment_reference as string | null) ?? null,
    type: row.type as PaymentAdjustmentRecord["type"],
    amount: Number(row.amount),
    reason: String(row.reason),
    recordedByName: String(row.recorded_by_name),
    createdAt: String(row.created_at),
  })) satisfies PaymentAdjustmentRecord[];
}

export function getInstallationItems(projectId: string) {
  const rows = getPortalDatabase()
    .prepare(
      `SELECT installation_items.id, installation_items.project_id, installation_items.description,
        installation_items.quoted_quantity, installation_items.installed_quantity,
        installation_items.serial_number, installation_items.notes, users.name AS recorded_by_name,
        installation_items.created_at, installation_items.updated_at
       FROM installation_items
       JOIN users ON users.id = installation_items.recorded_by
       WHERE installation_items.project_id = ?
       ORDER BY installation_items.created_at DESC`,
    )
    .all(projectId) as Array<Record<string, unknown>>;

  return rows.map((row) => ({
    id: String(row.id),
    projectId: String(row.project_id),
    description: String(row.description),
    quotedQuantity: row.quoted_quantity === null ? null : Number(row.quoted_quantity),
    installedQuantity: Number(row.installed_quantity),
    serialNumber: (row.serial_number as string | null) ?? null,
    notes: (row.notes as string | null) ?? null,
    recordedByName: String(row.recorded_by_name),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  })) satisfies InstallationItemRecord[];
}

function mapServiceTicket(row: Record<string, unknown>) {
  return {
    id: String(row.id),
    reference: String(row.reference),
    customerId: (row.customer_id as string | null) ?? null,
    customerName: String(row.customer_name),
    phone: String(row.phone),
    email: (row.email as string | null) ?? null,
    projectId: (row.project_id as string | null) ?? null,
    projectReference: (row.project_reference as string | null) ?? null,
    category: row.category as ServiceTicketRecord["category"],
    priority: row.priority as ServiceTicketRecord["priority"],
    status: row.status as ServiceTicketRecord["status"],
    description: String(row.description),
    preferredContact: (row.preferred_contact as string | null) ?? null,
    assignedTo: (row.assigned_to as string | null) ?? null,
    assignedToName: (row.assigned_to_name as string | null) ?? null,
    internalNotes: (row.internal_notes as string | null) ?? null,
    customerUpdate: (row.customer_update as string | null) ?? null,
    resolutionSummary: (row.resolution_summary as string | null) ?? null,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  } satisfies ServiceTicketRecord;
}

export function getServiceTickets(assignedTo?: string, filters: { search?: string; status?: string } = {}) {
  const conditions = ["1 = 1"];
  const parameters: string[] = [];
  if (assignedTo) {
    conditions.push("service_tickets.assigned_to = ?");
    parameters.push(assignedTo);
  }
  const search = filters.search?.trim() ?? "";
  if (search) {
    const term = `%${search}%`;
    conditions.push("(service_tickets.reference LIKE ? OR service_tickets.customer_name LIKE ? OR service_tickets.phone LIKE ? OR service_tickets.description LIKE ?)");
    parameters.push(term, term, term, term);
  }
  if (filters.status) {
    conditions.push("service_tickets.status = ?");
    parameters.push(filters.status);
  }

  const rows = getPortalDatabase()
    .prepare(
      `SELECT service_tickets.id, service_tickets.reference, service_tickets.customer_id, service_tickets.customer_name,
        service_tickets.phone, service_tickets.email, service_tickets.project_id, projects.reference AS project_reference,
        service_tickets.category, service_tickets.priority, service_tickets.status, service_tickets.description,
        service_tickets.preferred_contact, service_tickets.assigned_to, users.name AS assigned_to_name,
        service_tickets.internal_notes, service_tickets.customer_update, service_tickets.resolution_summary, service_tickets.created_at, service_tickets.updated_at
       FROM service_tickets
       LEFT JOIN projects ON projects.id = service_tickets.project_id
       LEFT JOIN users ON users.id = service_tickets.assigned_to
       WHERE ${conditions.join(" AND ")}
       ORDER BY CASE WHEN service_tickets.status IN ('open', 'reviewed', 'assigned', 'reopened') THEN 0 ELSE 1 END,
        CASE WHEN service_tickets.priority = 'urgent' THEN 0 ELSE 1 END, service_tickets.created_at DESC`,
    )
    .all(...parameters) as Array<Record<string, unknown>>;

  return rows.map(mapServiceTicket);
}

export function getServiceTicket(id: string) {
  const row = getPortalDatabase()
    .prepare(
      `SELECT service_tickets.id, service_tickets.reference, service_tickets.customer_id, service_tickets.customer_name,
        service_tickets.phone, service_tickets.email, service_tickets.project_id, projects.reference AS project_reference,
        service_tickets.category, service_tickets.priority, service_tickets.status, service_tickets.description,
        service_tickets.preferred_contact, service_tickets.assigned_to, users.name AS assigned_to_name,
        service_tickets.internal_notes, service_tickets.customer_update, service_tickets.resolution_summary, service_tickets.created_at, service_tickets.updated_at
       FROM service_tickets
       LEFT JOIN projects ON projects.id = service_tickets.project_id
       LEFT JOIN users ON users.id = service_tickets.assigned_to
       WHERE service_tickets.id = ? LIMIT 1`,
    )
    .get(id) as Record<string, unknown> | undefined;

  return row ? mapServiceTicket(row) : undefined;
}

export function getPublicSupportTicket(tokenHash: string) {
  const row = getPortalDatabase()
    .prepare(
      `SELECT service_tickets.reference, service_tickets.customer_name, service_tickets.category,
        service_tickets.priority, service_tickets.status, service_tickets.description,
        service_tickets.customer_update, service_tickets.resolution_summary, service_tickets.created_at, service_tickets.updated_at
       FROM support_access_tokens
       JOIN service_tickets ON service_tickets.id = support_access_tokens.ticket_id
       WHERE support_access_tokens.token_hash = ? AND support_access_tokens.expires_at > ?
       LIMIT 1`,
    )
    .get(tokenHash, new Date().toISOString()) as Record<string, unknown> | undefined;

  if (!row) return undefined;
  return {
    reference: String(row.reference),
    customerName: String(row.customer_name),
    category: String(row.category),
    priority: String(row.priority),
    status: String(row.status),
    description: String(row.description),
    customerUpdate: (row.customer_update as string | null) ?? null,
    resolutionSummary: (row.resolution_summary as string | null) ?? null,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

export function getTicketAttachments(ticketId: string) {
  const rows = getPortalDatabase()
    .prepare(
      `SELECT ticket_attachments.id, ticket_attachments.ticket_id, ticket_attachments.original_name,
        ticket_attachments.mime_type, ticket_attachments.size_bytes, users.name AS uploaded_by_name,
        ticket_attachments.created_at
       FROM ticket_attachments JOIN users ON users.id = ticket_attachments.uploaded_by
       WHERE ticket_attachments.ticket_id = ?
       UNION ALL
       SELECT ticket_customer_attachments.id, ticket_customer_attachments.ticket_id, ticket_customer_attachments.original_name,
        ticket_customer_attachments.mime_type, ticket_customer_attachments.size_bytes, 'Customer' AS uploaded_by_name,
        ticket_customer_attachments.created_at
       FROM ticket_customer_attachments
       WHERE ticket_customer_attachments.ticket_id = ?
       ORDER BY created_at DESC`,
    )
    .all(ticketId, ticketId) as Array<Record<string, unknown>>;

  return rows.map((row) => ({
    id: String(row.id),
    ticketId: String(row.ticket_id),
    originalName: String(row.original_name),
    mimeType: String(row.mime_type),
    sizeBytes: Number(row.size_bytes),
    uploadedByName: String(row.uploaded_by_name),
    createdAt: String(row.created_at),
  })) satisfies TicketAttachmentRecord[];
}

export function getTicketAttachment(id: string) {
  return getPortalDatabase()
    .prepare(
      `SELECT id, ticket_id, original_name, stored_name, mime_type, size_bytes
       FROM ticket_attachments WHERE id = ?
       UNION ALL
       SELECT id, ticket_id, original_name, stored_name, mime_type, size_bytes
       FROM ticket_customer_attachments WHERE id = ? LIMIT 1`,
    )
    .get(id, id) as
    | { id: string; ticket_id: string; original_name: string; stored_name: string; mime_type: string; size_bytes: number }
    | undefined;
}

export function getScheduleEvents(filters: { from: string; to: string; assignedTo?: string } ) {
  const conditions = ["schedule_events.scheduled_start >= ?", "schedule_events.scheduled_start < ?"];
  const parameters: string[] = [filters.from, filters.to];
  if (filters.assignedTo) {
    conditions.push("schedule_events.assigned_to = ?");
    parameters.push(filters.assignedTo);
  }
  const rows = getPortalDatabase()
    .prepare(
      `SELECT schedule_events.id, schedule_events.event_type, schedule_events.title,
        schedule_events.scheduled_start, schedule_events.scheduled_end, schedule_events.status,
        schedule_events.project_id, projects.reference AS project_reference,
        schedule_events.ticket_id, service_tickets.reference AS ticket_reference,
        COALESCE(project_customers.name, ticket_customers.name, service_tickets.customer_name) AS customer_name,
        projects.site_address, schedule_events.assigned_to, assignees.name AS assigned_to_name,
        schedule_events.notes, creators.name AS created_by_name, schedule_events.created_at, schedule_events.updated_at
       FROM schedule_events
       LEFT JOIN projects ON projects.id = schedule_events.project_id
       LEFT JOIN customers AS project_customers ON project_customers.id = projects.customer_id
       LEFT JOIN service_tickets ON service_tickets.id = schedule_events.ticket_id
       LEFT JOIN customers AS ticket_customers ON ticket_customers.id = service_tickets.customer_id
       LEFT JOIN users AS assignees ON assignees.id = schedule_events.assigned_to
       JOIN users AS creators ON creators.id = schedule_events.created_by
       WHERE ${conditions.join(" AND ")}
       ORDER BY schedule_events.scheduled_start ASC, schedule_events.created_at ASC`,
    )
    .all(...parameters) as Array<Record<string, unknown>>;

  return rows.map((row) => ({
    id: String(row.id),
    eventType: row.event_type as ScheduleEventRecord["eventType"],
    title: String(row.title),
    scheduledStart: String(row.scheduled_start),
    scheduledEnd: String(row.scheduled_end),
    status: row.status as ScheduleEventRecord["status"],
    projectId: (row.project_id as string | null) ?? null,
    projectReference: (row.project_reference as string | null) ?? null,
    ticketId: (row.ticket_id as string | null) ?? null,
    ticketReference: (row.ticket_reference as string | null) ?? null,
    customerName: (row.customer_name as string | null) ?? null,
    siteAddress: (row.site_address as string | null) ?? null,
    assignedTo: (row.assigned_to as string | null) ?? null,
    assignedToName: (row.assigned_to_name as string | null) ?? null,
    notes: (row.notes as string | null) ?? null,
    createdByName: String(row.created_by_name),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  })) satisfies ScheduleEventRecord[];
}

export function getReportSummary(from: string, to: string) {
  const database = getPortalDatabase();
  const enquiriesBySource = database.prepare("SELECT source, COUNT(*) AS count FROM enquiries WHERE created_at >= ? AND created_at < ? GROUP BY source ORDER BY count DESC").all(from, to) as Array<{ source: string; count: number }>;
  const projectsByStatus = database.prepare("SELECT status, COUNT(*) AS count FROM projects WHERE created_at >= ? AND created_at < ? GROUP BY status ORDER BY count DESC").all(from, to) as Array<{ status: string; count: number }>;
  const ticketsByStatus = database.prepare("SELECT status, COUNT(*) AS count FROM service_tickets WHERE created_at >= ? AND created_at < ? GROUP BY status ORDER BY count DESC").all(from, to) as Array<{ status: string; count: number }>;
  const paymentsByMethod = database.prepare("SELECT method, COALESCE(SUM(amount), 0) AS total, COUNT(*) AS count FROM payments WHERE paid_at >= ? AND paid_at < ? GROUP BY method ORDER BY total DESC").all(from.slice(0, 10), to.slice(0, 10)) as Array<{ method: string; total: number; count: number }>;
  const paymentAdjustments = database.prepare("SELECT COALESCE(SUM(amount), 0) AS total, COUNT(*) AS count FROM payment_adjustments WHERE created_at >= ? AND created_at < ?").get(from, to) as { total: number; count: number };
  const totals = database.prepare(
    `SELECT
      (SELECT COUNT(*) FROM enquiries WHERE created_at >= ? AND created_at < ?) AS enquiries,
      (SELECT COUNT(*) FROM projects WHERE created_at >= ? AND created_at < ?) AS projects,
      (SELECT COUNT(*) FROM service_tickets WHERE created_at >= ? AND created_at < ?) AS tickets,
      (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE paid_at >= ? AND paid_at < ?) AS payments`,
  ).get(from, to, from, to, from, to, from.slice(0, 10), to.slice(0, 10)) as { enquiries: number; projects: number; tickets: number; payments: number };

  const enquiryOutcomes = database.prepare(
    `SELECT COUNT(*) AS total, SUM(CASE WHEN status = 'converted' THEN 1 ELSE 0 END) AS converted
     FROM enquiries WHERE created_at >= ? AND created_at < ?`,
  ).get(from, to) as { total: number; converted: number | null };
  const outstanding = database.prepare(
    `SELECT COALESCE(SUM(MAX(COALESCE(approved_amount, estimated_amount, 0) - amount_paid, 0)), 0) AS total
     FROM projects WHERE status <> 'cancelled'`,
  ).get() as { total: number };
  const overdueSchedules = database.prepare(
    `SELECT
      SUM(CASE WHEN event_type = 'survey' AND scheduled_start < ? AND status IN ('scheduled', 'rescheduled') THEN 1 ELSE 0 END) AS overdue_surveys,
      SUM(CASE WHEN event_type = 'installation' AND scheduled_start < ? AND status IN ('scheduled', 'rescheduled') THEN 1 ELSE 0 END) AS overdue_installations
     FROM schedule_events`,
  ).get(`${to}`, `${to}`) as { overdue_surveys: number | null; overdue_installations: number | null };
  const ticketResolution = database.prepare(
    `SELECT
      SUM(CASE WHEN status IN ('resolved', 'closed') THEN 1 ELSE 0 END) AS resolved_tickets,
      AVG(CASE WHEN status IN ('resolved', 'closed') THEN julianday(updated_at) - julianday(created_at) END) AS average_resolution_days
     FROM service_tickets WHERE updated_at >= ? AND updated_at < ?`,
  ).get(from, to) as { resolved_tickets: number | null; average_resolution_days: number | null };
  const staffWorkload = database.prepare(
    `SELECT users.name, COUNT(schedule_events.id) AS count
     FROM schedule_events JOIN users ON users.id = schedule_events.assigned_to
     WHERE schedule_events.scheduled_start >= ? AND schedule_events.scheduled_start < ?
     GROUP BY users.id, users.name ORDER BY count DESC, users.name ASC`,
  ).all(from, to) as Array<{ name: string; count: number }>;

  return {
    enquiriesBySource,
    projectsByStatus,
    ticketsByStatus,
    paymentsByMethod,
    staffWorkload,
    totals: {
      ...totals,
      paymentAdjustments: Number(paymentAdjustments.total ?? 0),
      netPayments: Number(totals.payments ?? 0) - Number(paymentAdjustments.total ?? 0),
      convertedEnquiries: enquiryOutcomes.converted ?? 0,
      conversionRate: totals.enquiries ? ((enquiryOutcomes.converted ?? 0) / totals.enquiries) * 100 : 0,
      outstandingBalance: Number(outstanding.total ?? 0),
      overdueSurveys: Number(overdueSchedules.overdue_surveys ?? 0),
      overdueInstallations: Number(overdueSchedules.overdue_installations ?? 0),
      resolvedTickets: Number(ticketResolution.resolved_tickets ?? 0),
      averageResolutionDays: Number(ticketResolution.average_resolution_days ?? 0),
    },
  };
}

export function getNotifications(userId: string, limit = 12) {
  const rows = getPortalDatabase()
    .prepare(
      `SELECT id, type, title, message, entity_type, entity_id, read_at, created_at
       FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT ?`,
    )
    .all(userId, limit) as Array<Record<string, unknown>>;

  return rows.map((row) => ({
    id: String(row.id),
    type: String(row.type),
    title: String(row.title),
    message: String(row.message),
    entityType: String(row.entity_type),
    entityId: String(row.entity_id),
    readAt: (row.read_at as string | null) ?? null,
    createdAt: String(row.created_at),
  })) satisfies NotificationRecord[];
}

export function getActiveUsers() {
  const rows = getPortalDatabase()
    .prepare("SELECT id, email, name, phone, role, is_active FROM users ORDER BY name ASC")
    .all() as Array<{ id: string; email: string; name: string; phone: string | null; role: PortalUser["role"]; is_active: number }>;

  return rows.map((row) => ({
    id: row.id,
    email: row.email,
    name: row.name,
    phone: row.phone,
    role: row.role,
    isActive: row.is_active === 1,
  })) satisfies PortalUser[];
}

export function getActivityFeed(limit = 8) {
  return getPortalDatabase()
    .prepare(
      `SELECT activity_logs.action, activity_logs.entity_type, activity_logs.entity_id, activity_logs.details, activity_logs.created_at, users.name AS actor_name
       FROM activity_logs JOIN users ON users.id = activity_logs.actor_id
       ORDER BY activity_logs.created_at DESC LIMIT ?`,
    )
    .all(limit) as Array<{ action: string; entity_type: string; entity_id: string; details: string | null; created_at: string; actor_name: string }>;
}

export function getEntityActivity(entityType: string, entityId: string) {
  const rows = getPortalDatabase()
    .prepare(
      `SELECT activity_logs.action, activity_logs.entity_type, activity_logs.entity_id, activity_logs.details,
        activity_logs.created_at, users.name AS actor_name
       FROM activity_logs JOIN users ON users.id = activity_logs.actor_id
       WHERE activity_logs.entity_type = ? AND activity_logs.entity_id = ?
       ORDER BY activity_logs.created_at DESC`,
    )
    .all(entityType, entityId) as Array<{ action: string; entity_type: string; entity_id: string; details: string | null; created_at: string; actor_name: string }>;

  return rows.map((row) => ({
    action: row.action,
    entityType: row.entity_type,
    entityId: row.entity_id,
    details: row.details,
    actorName: row.actor_name,
    createdAt: row.created_at,
  })) satisfies ActivityRecord[];
}

function mapServiceJob(row: Record<string, unknown>) {
  return {
    id: String(row.id),
    reference: String(row.reference),
    customerId: (row.customer_id as string | null) ?? null,
    customerName: String(row.customer_name),
    phone: String(row.phone),
    siteAddress: (row.site_address as string | null) ?? null,
    siteArea: (row.site_area as string | null) ?? null,
    siteLatitude: row.site_latitude === null ? null : Number(row.site_latitude),
    siteLongitude: row.site_longitude === null ? null : Number(row.site_longitude),
    category: row.category as ServiceJobRecord["category"],
    title: String(row.title),
    description: String(row.description),
    requiredSkills: (row.required_skills as string | null) ?? null,
    preferredStart: (row.preferred_start as string | null) ?? null,
    preferredEnd: (row.preferred_end as string | null) ?? null,
    urgency: row.urgency as ServiceJobRecord["urgency"],
    estimatedMinutes: row.estimated_minutes === null ? null : Number(row.estimated_minutes),
    internalNotes: (row.internal_notes as string | null) ?? null,
    technicianNotes: (row.technician_notes as string | null) ?? null,
    acceptanceDeadline: (row.acceptance_deadline as string | null) ?? null,
    status: row.status as ServiceJobRecord["status"],
    assignedTechnicianId: (row.assigned_technician_id as string | null) ?? null,
    assignedTechnicianName: (row.assigned_technician_name as string | null) ?? null,
    createdByName: String(row.created_by_name),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  } satisfies ServiceJobRecord;
}

const serviceJobSelect = `SELECT service_jobs.id, service_jobs.reference, service_jobs.customer_id, service_jobs.customer_name,
  service_jobs.phone, service_jobs.site_address, service_jobs.site_area, service_jobs.site_latitude, service_jobs.site_longitude,
  service_jobs.category, service_jobs.title, service_jobs.description, service_jobs.required_skills, service_jobs.preferred_start,
  service_jobs.preferred_end, service_jobs.urgency, service_jobs.estimated_minutes, service_jobs.internal_notes,
  service_jobs.technician_notes, service_jobs.acceptance_deadline, service_jobs.status, service_jobs.assigned_technician_id,
  assigned.name AS assigned_technician_name, creator.name AS created_by_name, service_jobs.created_at, service_jobs.updated_at
  FROM service_jobs LEFT JOIN users assigned ON assigned.id = service_jobs.assigned_technician_id
  JOIN users creator ON creator.id = service_jobs.created_by`;

export function getServiceJobs(input: { role: "owner" | "manager" | "staff" | "technician"; userId: string; status?: string }) {
  const conditions = ["1 = 1"];
  const values: string[] = [];
  if (input.role === "technician") {
    conditions.push("(service_jobs.assigned_technician_id = ? OR EXISTS (SELECT 1 FROM job_recipients WHERE job_recipients.job_id = service_jobs.id AND job_recipients.technician_id = ? AND service_jobs.status = 'open'))");
    values.push(input.userId, input.userId);
  }
  if (input.status) {
    conditions.push("service_jobs.status = ?");
    values.push(input.status);
  }
  const rows = getPortalDatabase().prepare(`${serviceJobSelect} WHERE ${conditions.join(" AND ")} ORDER BY CASE WHEN service_jobs.status = 'open' THEN 0 ELSE 1 END, service_jobs.created_at DESC`).all(...values) as Array<Record<string, unknown>>;
  return rows.map(mapServiceJob);
}

export function getServiceJob(id: string) {
  const row = getPortalDatabase().prepare(`${serviceJobSelect} WHERE service_jobs.id = ? LIMIT 1`).get(id) as Record<string, unknown> | undefined;
  return row ? mapServiceJob(row) : undefined;
}

export function getJobResponses(jobId: string) {
  const rows = getPortalDatabase().prepare(
    `SELECT job_responses.id, job_responses.job_id, job_responses.technician_id, users.name AS technician_name,
      job_responses.status, job_responses.reason, job_responses.responded_at
     FROM job_responses JOIN users ON users.id = job_responses.technician_id WHERE job_responses.job_id = ? ORDER BY job_responses.responded_at DESC`,
  ).all(jobId) as Array<Record<string, unknown>>;
  return rows.map((row) => ({ id: String(row.id), jobId: String(row.job_id), technicianId: String(row.technician_id), technicianName: String(row.technician_name), status: row.status as JobResponseRecord["status"], reason: (row.reason as string | null) ?? null, respondedAt: String(row.responded_at) })) satisfies JobResponseRecord[];
}

export function getJobAssignments(jobId: string) {
  const rows = getPortalDatabase().prepare(
    `SELECT job_assignments.id, job_assignments.job_id, job_assignments.technician_id, technicians.name AS technician_name,
      job_assignments.assignment_type, assigners.name AS assigned_by_name, job_assignments.reason, job_assignments.assigned_at, job_assignments.unassigned_at
     FROM job_assignments JOIN users technicians ON technicians.id = job_assignments.technician_id JOIN users assigners ON assigners.id = job_assignments.assigned_by
     WHERE job_assignments.job_id = ? ORDER BY job_assignments.assigned_at DESC`,
  ).all(jobId) as Array<Record<string, unknown>>;
  return rows.map((row) => ({ id: String(row.id), jobId: String(row.job_id), technicianId: String(row.technician_id), technicianName: String(row.technician_name), assignmentType: row.assignment_type as JobAssignmentRecord["assignmentType"], assignedByName: String(row.assigned_by_name), reason: (row.reason as string | null) ?? null, assignedAt: String(row.assigned_at), unassignedAt: (row.unassigned_at as string | null) ?? null })) satisfies JobAssignmentRecord[];
}

export function getJobCompletion(jobId: string) {
  const row = getPortalDatabase().prepare(
    `SELECT job_completion_submissions.id, job_completion_submissions.job_id, submitters.name AS submitted_by_name,
      job_completion_submissions.summary, job_completion_submissions.work_notes, job_completion_submissions.materials, job_completion_submissions.camera_count,
      job_completion_submissions.status, job_completion_submissions.return_reason, job_completion_submissions.submitted_at,
      verifiers.name AS verified_by_name, job_completion_submissions.verified_at
     FROM job_completion_submissions JOIN users submitters ON submitters.id = job_completion_submissions.submitted_by
     LEFT JOIN users verifiers ON verifiers.id = job_completion_submissions.verified_by
     WHERE job_completion_submissions.job_id = ? ORDER BY job_completion_submissions.submitted_at DESC LIMIT 1`,
  ).get(jobId) as Record<string, unknown> | undefined;
  if (!row) return undefined;
  return { id: String(row.id), jobId: String(row.job_id), submittedByName: String(row.submitted_by_name), summary: String(row.summary), workNotes: (row.work_notes as string | null) ?? null, materials: (row.materials as string | null) ?? null, cameraCount: row.camera_count === null ? null : Number(row.camera_count), status: row.status as JobCompletionRecord["status"], returnReason: (row.return_reason as string | null) ?? null, submittedAt: String(row.submitted_at), verifiedByName: (row.verified_by_name as string | null) ?? null, verifiedAt: (row.verified_at as string | null) ?? null } satisfies JobCompletionRecord;
}

export function getJobAttachments(jobId: string) {
  const rows = getPortalDatabase().prepare(
    `SELECT job_attachments.id, job_attachments.job_id, job_attachments.original_name,
      job_attachments.mime_type, job_attachments.size_bytes, users.name AS uploaded_by_name,
      job_attachments.created_at
     FROM job_attachments JOIN users ON users.id = job_attachments.uploaded_by
     WHERE job_attachments.job_id = ? ORDER BY job_attachments.created_at DESC`,
  ).all(jobId) as Array<Record<string, unknown>>;
  return rows.map((row) => ({ id: String(row.id), jobId: String(row.job_id), originalName: String(row.original_name), mimeType: String(row.mime_type), sizeBytes: Number(row.size_bytes), uploadedByName: String(row.uploaded_by_name), createdAt: String(row.created_at) })) satisfies JobAttachmentRecord[];
}

export function getJobAttachment(id: string) {
  return getPortalDatabase().prepare(
    "SELECT id, job_id, original_name, stored_name, mime_type, size_bytes FROM job_attachments WHERE id = ? LIMIT 1",
  ).get(id) as { id: string; job_id: string; original_name: string; stored_name: string; mime_type: string; size_bytes: number } | undefined;
}

export function getTechnicians() {
  const rows = getPortalDatabase().prepare("SELECT id, name, email, phone FROM users WHERE role = 'technician' AND is_active = 1 ORDER BY name ASC").all() as Array<Record<string, unknown>>;
  return rows.map((row) => ({ id: String(row.id), name: String(row.name), email: String(row.email), phone: (row.phone as string | null) ?? null }));
}

export function getPointRules() {
  const rows = getPortalDatabase().prepare("SELECT id, name, type, points, category, enabled, sample_label, created_at, updated_at FROM point_rules ORDER BY enabled DESC, name ASC").all() as Array<Record<string, unknown>>;
  return rows.map((row) => ({ id: String(row.id), name: String(row.name), type: row.type as PointRuleRecord["type"], points: Number(row.points), category: (row.category as PointRuleRecord["category"]), enabled: row.enabled === 1, sampleLabel: (row.sample_label as string | null) ?? null, createdAt: String(row.created_at), updatedAt: String(row.updated_at) })) satisfies PointRuleRecord[];
}

export function getPointTransactions(technicianId?: string) {
  const rows = getPortalDatabase().prepare(
    `SELECT point_transactions.id, point_transactions.technician_id, technicians.name AS technician_name, point_transactions.type,
      point_transactions.points, point_transactions.job_id, service_jobs.reference AS job_reference, point_transactions.redemption_id,
      point_transactions.rule_id, point_rules.name AS rule_name, point_transactions.reason, actors.name AS actor_name, point_transactions.created_at
     FROM point_transactions JOIN users technicians ON technicians.id = point_transactions.technician_id
     LEFT JOIN service_jobs ON service_jobs.id = point_transactions.job_id LEFT JOIN point_rules ON point_rules.id = point_transactions.rule_id
     LEFT JOIN users actors ON actors.id = point_transactions.actor_id
     WHERE (? IS NULL OR point_transactions.technician_id = ?) ORDER BY point_transactions.created_at DESC`,
  ).all(technicianId ?? null, technicianId ?? null) as Array<Record<string, unknown>>;
  return rows.map((row) => ({ id: String(row.id), technicianId: String(row.technician_id), technicianName: String(row.technician_name), type: row.type as PointTransactionRecord["type"], points: Number(row.points), jobId: (row.job_id as string | null) ?? null, jobReference: (row.job_reference as string | null) ?? null, redemptionId: (row.redemption_id as string | null) ?? null, ruleId: (row.rule_id as string | null) ?? null, ruleName: (row.rule_name as string | null) ?? null, reason: (row.reason as string | null) ?? null, actorName: (row.actor_name as string | null) ?? null, createdAt: String(row.created_at) })) satisfies PointTransactionRecord[];
}

export function getPointBalance(technicianId: string) {
  const row = getPortalDatabase().prepare("SELECT COALESCE(SUM(points), 0) AS balance, COALESCE(SUM(CASE WHEN points > 0 THEN points ELSE 0 END), 0) AS earned, COALESCE(SUM(CASE WHEN points < 0 THEN -points ELSE 0 END), 0) AS redeemed FROM point_transactions WHERE technician_id = ?").get(technicianId) as { balance: number; earned: number; redeemed: number };
  return { balance: Number(row.balance), earned: Number(row.earned), redeemed: Number(row.redeemed) };
}

export function getRewardItems(includeInactive = false) {
  const rows = getPortalDatabase().prepare(
    `SELECT id, product_id, name, description, category, image_path, points_cost, stock_quantity, active, created_at, updated_at
     FROM reward_items ${includeInactive ? "" : "WHERE active = 1"} ORDER BY active DESC, name ASC`,
  ).all() as Array<Record<string, unknown>>;
  return rows.map((row) => ({ id: String(row.id), productId: (row.product_id as string | null) ?? null, name: String(row.name), description: (row.description as string | null) ?? null, category: String(row.category), imagePath: (row.image_path as string | null) ?? null, pointsCost: Number(row.points_cost), stockQuantity: Number(row.stock_quantity), active: row.active === 1, createdAt: String(row.created_at), updatedAt: String(row.updated_at) })) satisfies RewardItemRecord[];
}

export function getRedemptionRequests(technicianId?: string) {
  const rows = getPortalDatabase().prepare(
    `SELECT redemption_requests.id, redemption_requests.reference, redemption_requests.technician_id, users.name AS technician_name,
      redemption_requests.reward_id, redemption_requests.reward_name_snapshot, redemption_requests.points_cost_snapshot,
      redemption_requests.quantity, redemption_requests.status, redemption_requests.notes, approvers.name AS approved_by_name,
      redemption_requests.created_at, redemption_requests.updated_at
     FROM redemption_requests JOIN users ON users.id = redemption_requests.technician_id LEFT JOIN users approvers ON approvers.id = redemption_requests.approved_by
     WHERE (? IS NULL OR redemption_requests.technician_id = ?) ORDER BY redemption_requests.created_at DESC`,
  ).all(technicianId ?? null, technicianId ?? null) as Array<Record<string, unknown>>;
  return rows.map((row) => ({ id: String(row.id), reference: String(row.reference), technicianId: String(row.technician_id), technicianName: String(row.technician_name), rewardId: String(row.reward_id), rewardName: String(row.reward_name_snapshot), pointsCost: Number(row.points_cost_snapshot), quantity: Number(row.quantity), status: row.status as RedemptionRequestRecord["status"], notes: (row.notes as string | null) ?? null, approvedByName: (row.approved_by_name as string | null) ?? null, createdAt: String(row.created_at), updatedAt: String(row.updated_at) })) satisfies RedemptionRequestRecord[];
}
