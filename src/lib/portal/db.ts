import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import type {
  CustomerType,
  EnquirySource,
  EnquiryStatus,
  EnquiryType,
  PortalRole,
  ProjectStatus,
  TicketCategory,
  TicketPriority,
  TicketStatus,
} from "@/lib/portal/types";
import { catalogProducts } from "@/data/catalog";
import type { CatalogProduct } from "@/types/site";
import { normalizePortalPhone } from "@/lib/portal/config";

declare global {
  var portalDatabase: DatabaseSync | undefined;
}

const databaseSchema = `
  PRAGMA foreign_keys = ON;

  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    phone TEXT,
    role TEXT NOT NULL CHECK (role IN ('owner', 'manager', 'staff', 'technician')),
    password_hash TEXT NOT NULL,
    is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS sessions (
    token_hash TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at TEXT NOT NULL,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS user_invites (
    token_hash TEXT PRIMARY KEY,
    email TEXT NOT NULL,
    name TEXT NOT NULL,
    phone TEXT,
    role TEXT NOT NULL CHECK (role IN ('owner', 'manager', 'staff', 'technician')),
    invited_by TEXT NOT NULL REFERENCES users(id),
    expires_at TEXT NOT NULL,
    used_at TEXT,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS sequences (
    name TEXT PRIMARY KEY,
    current_value INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS customers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    business_name TEXT,
    customer_type TEXT NOT NULL CHECK (customer_type IN ('individual', 'business')),
    phone_primary TEXT NOT NULL,
    phone_secondary TEXT,
    email TEXT,
    address TEXT,
    area TEXT,
    notes TEXT,
    created_by TEXT NOT NULL REFERENCES users(id),
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS enquiries (
    id TEXT PRIMARY KEY,
    reference TEXT NOT NULL UNIQUE,
    customer_id TEXT NOT NULL REFERENCES customers(id),
    type TEXT NOT NULL CHECK (type IN ('new-installation', 'product-purchase', 'repair-maintenance', 'other')),
    source TEXT NOT NULL CHECK (source IN ('phone', 'whatsapp', 'website', 'walk-in', 'referral', 'other')),
    status TEXT NOT NULL CHECK (status IN ('new', 'contacted', 'survey-required', 'quotation-in-progress', 'converted', 'lost')),
    area TEXT,
    notes TEXT,
    follow_up_at TEXT,
    assigned_to TEXT REFERENCES users(id),
    created_by TEXT NOT NULL REFERENCES users(id),
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY,
    reference TEXT NOT NULL UNIQUE,
    customer_id TEXT NOT NULL REFERENCES customers(id),
    title TEXT NOT NULL,
    project_type TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('new-enquiry', 'survey-scheduled', 'survey-completed', 'quotation-preparation', 'quotation-sent', 'awaiting-approval', 'approved', 'installation-scheduled', 'installation-in-progress', 'completed', 'cancelled')),
    site_address TEXT,
    area TEXT,
    site_latitude REAL,
    site_longitude REAL,
    site_instructions TEXT,
    planned_install_date TEXT,
    estimated_amount REAL,
    approved_amount REAL,
    amount_paid REAL NOT NULL DEFAULT 0,
    warranty_start_date TEXT,
    warranty_end_date TEXT,
    notes TEXT,
    created_by TEXT NOT NULL REFERENCES users(id),
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS site_surveys (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    survey_date TEXT NOT NULL,
    surveyor_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    property_type TEXT,
    installation_area TEXT,
    camera_count REAL,
    camera_type TEXT,
    indoor_outdoor TEXT,
    cable_length REAL,
    cable_routes TEXT,
    storage_requirements TEXT,
    networking_needs TEXT,
    mounting_constraints TEXT,
    customer_requirements TEXT,
    outcome TEXT,
    next_steps TEXT,
    recorded_by TEXT NOT NULL REFERENCES users(id),
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS quotations (
    id TEXT PRIMARY KEY,
    reference TEXT NOT NULL UNIQUE,
    customer_id TEXT NOT NULL REFERENCES customers(id),
    project_id TEXT REFERENCES projects(id),
    status TEXT NOT NULL CHECK (status IN ('draft', 'sent', 'accepted', 'rejected', 'expired', 'cancelled')),
    vat_rate REAL NOT NULL,
    subtotal REAL NOT NULL,
    vat_amount REAL NOT NULL,
    total REAL NOT NULL,
    valid_days INTEGER NOT NULL,
    valid_until TEXT NOT NULL,
    notes TEXT,
    created_by TEXT NOT NULL REFERENCES users(id),
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    legacy_id TEXT UNIQUE,
    name TEXT NOT NULL,
    brand TEXT NOT NULL,
    model TEXT,
    category_key TEXT NOT NULL,
    category_name TEXT NOT NULL,
    description TEXT,
    specifications TEXT,
    image_path TEXT,
    image_alt TEXT,
    source_url TEXT,
    source_category TEXT,
    current_price_paisa INTEGER CHECK (current_price_paisa IS NULL OR current_price_paisa >= 0),
    reference_price_paisa INTEGER CHECK (reference_price_paisa IS NULL OR reference_price_paisa >= 0),
    price_display_mode TEXT NOT NULL CHECK (price_display_mode IN ('show_price', 'contact_for_price')),
    price_type TEXT NOT NULL DEFAULT 'market' CHECK (price_type IN ('market', 'mrp')),
    availability TEXT NOT NULL CHECK (availability IN ('in_stock', 'out_of_stock', 'unavailable', 'not_tracked')),
    publication_status TEXT NOT NULL CHECK (publication_status IN ('draft', 'published', 'archived')),
    unit TEXT NOT NULL DEFAULT 'piece',
    warranty_months INTEGER CHECK (warranty_months IS NULL OR warranty_months >= 0),
    created_by TEXT REFERENCES users(id) ON DELETE SET NULL,
    updated_by TEXT REFERENCES users(id) ON DELETE SET NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS product_price_history (
    id TEXT PRIMARY KEY,
    product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    previous_price_paisa INTEGER,
    new_price_paisa INTEGER,
    previous_reference_price_paisa INTEGER,
    new_reference_price_paisa INTEGER,
    reason TEXT,
    changed_by TEXT REFERENCES users(id) ON DELETE SET NULL,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS quotation_items (
    id TEXT PRIMARY KEY,
    quotation_id TEXT NOT NULL REFERENCES quotations(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    quantity REAL NOT NULL,
    unit_price REAL NOT NULL,
    line_total REAL NOT NULL,
    sort_order INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS payments (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL REFERENCES projects(id),
    quotation_id TEXT REFERENCES quotations(id),
    method TEXT NOT NULL CHECK (method IN ('fonepay', 'esewa', 'cash')),
    amount REAL NOT NULL CHECK (amount > 0),
    paid_at TEXT NOT NULL,
    reference TEXT,
    notes TEXT,
    recorded_by TEXT NOT NULL REFERENCES users(id),
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS payment_adjustments (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL REFERENCES projects(id),
    payment_id TEXT NOT NULL REFERENCES payments(id),
    type TEXT NOT NULL CHECK (type IN ('refund', 'reversal')),
    amount REAL NOT NULL CHECK (amount > 0),
    reason TEXT NOT NULL,
    recorded_by TEXT NOT NULL REFERENCES users(id),
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS installation_items (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    quoted_quantity REAL,
    installed_quantity REAL NOT NULL CHECK (installed_quantity > 0),
    serial_number TEXT,
    notes TEXT,
    recorded_by TEXT NOT NULL REFERENCES users(id),
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS service_tickets (
    id TEXT PRIMARY KEY,
    reference TEXT NOT NULL UNIQUE,
    customer_id TEXT REFERENCES customers(id) ON DELETE SET NULL,
    customer_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    project_id TEXT REFERENCES projects(id) ON DELETE SET NULL,
    category TEXT NOT NULL CHECK (category IN ('camera-offline', 'app-remote-viewing', 'recording-storage', 'physical-damage', 'routine-maintenance', 'other')),
    priority TEXT NOT NULL CHECK (priority IN ('normal', 'urgent')),
    status TEXT NOT NULL CHECK (status IN ('open', 'reviewed', 'assigned', 'scheduled', 'in-progress', 'waiting-customer', 'resolved', 'closed', 'reopened')),
    description TEXT NOT NULL,
    preferred_contact TEXT,
    assigned_to TEXT REFERENCES users(id) ON DELETE SET NULL,
    internal_notes TEXT,
    customer_update TEXT,
    resolution_summary TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS support_access_tokens (
    token_hash TEXT PRIMARY KEY,
    ticket_id TEXT NOT NULL REFERENCES service_tickets(id) ON DELETE CASCADE,
    expires_at TEXT NOT NULL,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS ticket_attachments (
    id TEXT PRIMARY KEY,
    ticket_id TEXT NOT NULL REFERENCES service_tickets(id) ON DELETE CASCADE,
    original_name TEXT NOT NULL,
    stored_name TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    size_bytes INTEGER NOT NULL,
    uploaded_by TEXT NOT NULL REFERENCES users(id),
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS ticket_customer_attachments (
    id TEXT PRIMARY KEY,
    ticket_id TEXT NOT NULL REFERENCES service_tickets(id) ON DELETE CASCADE,
    original_name TEXT NOT NULL,
    stored_name TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    size_bytes INTEGER NOT NULL,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS schedule_events (
    id TEXT PRIMARY KEY,
    event_type TEXT NOT NULL CHECK (event_type IN ('survey', 'installation', 'service-visit')),
    title TEXT NOT NULL,
    scheduled_start TEXT NOT NULL,
    scheduled_end TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('scheduled', 'in-progress', 'completed', 'cancelled', 'rescheduled')),
    project_id TEXT REFERENCES projects(id) ON DELETE SET NULL,
    ticket_id TEXT REFERENCES service_tickets(id) ON DELETE SET NULL,
    assigned_to TEXT REFERENCES users(id) ON DELETE SET NULL,
    notes TEXT,
    created_by TEXT NOT NULL REFERENCES users(id),
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS service_jobs (
    id TEXT PRIMARY KEY,
    reference TEXT NOT NULL UNIQUE,
    customer_id TEXT REFERENCES customers(id) ON DELETE SET NULL,
    customer_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    site_address TEXT,
    site_area TEXT,
    site_latitude REAL,
    site_longitude REAL,
    category TEXT NOT NULL CHECK (category IN ('cctv-installation', 'cctv-repair', 'maintenance', 'networking', 'router-wifi', 'access-control', 'other')),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    required_skills TEXT,
    preferred_start TEXT,
    preferred_end TEXT,
    urgency TEXT NOT NULL CHECK (urgency IN ('normal', 'urgent')),
    estimated_minutes INTEGER CHECK (estimated_minutes IS NULL OR estimated_minutes > 0),
    internal_notes TEXT,
    technician_notes TEXT,
    acceptance_deadline TEXT,
    status TEXT NOT NULL CHECK (status IN ('draft', 'open', 'assigned', 'in-progress', 'awaiting-verification', 'completed', 'reassignment-required', 'cancelled', 'expired')),
    assigned_technician_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    created_by TEXT NOT NULL REFERENCES users(id),
    verified_by TEXT REFERENCES users(id) ON DELETE SET NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS job_broadcasts (
    id TEXT PRIMARY KEY,
    job_id TEXT NOT NULL REFERENCES service_jobs(id) ON DELETE CASCADE,
    broadcasted_by TEXT NOT NULL REFERENCES users(id),
    acceptance_deadline TEXT,
    created_at TEXT NOT NULL,
    closed_at TEXT
  );

  CREATE TABLE IF NOT EXISTS job_recipients (
    id TEXT PRIMARY KEY,
    job_id TEXT NOT NULL REFERENCES service_jobs(id) ON DELETE CASCADE,
    technician_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    response_status TEXT NOT NULL DEFAULT 'pending' CHECK (response_status IN ('pending', 'accepted', 'declined')),
    notified_at TEXT NOT NULL,
    UNIQUE(job_id, technician_id)
  );

  CREATE TABLE IF NOT EXISTS job_responses (
    id TEXT PRIMARY KEY,
    job_id TEXT NOT NULL REFERENCES service_jobs(id) ON DELETE CASCADE,
    technician_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('accepted', 'declined')),
    reason TEXT,
    responded_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS job_assignments (
    id TEXT PRIMARY KEY,
    job_id TEXT NOT NULL REFERENCES service_jobs(id) ON DELETE CASCADE,
    technician_id TEXT NOT NULL REFERENCES users(id),
    assignment_type TEXT NOT NULL CHECK (assignment_type IN ('claim', 'manual', 'reassignment')),
    assigned_by TEXT NOT NULL REFERENCES users(id),
    reason TEXT,
    assigned_at TEXT NOT NULL,
    unassigned_at TEXT
  );

  CREATE TABLE IF NOT EXISTS job_status_history (
    id TEXT PRIMARY KEY,
    job_id TEXT NOT NULL REFERENCES service_jobs(id) ON DELETE CASCADE,
    from_status TEXT,
    to_status TEXT NOT NULL,
    reason TEXT,
    changed_by TEXT NOT NULL REFERENCES users(id),
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS job_completion_submissions (
    id TEXT PRIMARY KEY,
    job_id TEXT NOT NULL REFERENCES service_jobs(id) ON DELETE CASCADE,
    submitted_by TEXT NOT NULL REFERENCES users(id),
    summary TEXT NOT NULL,
    work_notes TEXT,
    materials TEXT,
    camera_count INTEGER CHECK (camera_count IS NULL OR camera_count > 0),
    status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'returned')),
    return_reason TEXT,
    submitted_at TEXT NOT NULL,
    verified_by TEXT REFERENCES users(id) ON DELETE SET NULL,
    verified_at TEXT
  );

  CREATE TABLE IF NOT EXISTS job_attachments (
    id TEXT PRIMARY KEY,
    job_id TEXT NOT NULL REFERENCES service_jobs(id) ON DELETE CASCADE,
    original_name TEXT NOT NULL,
    stored_name TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    size_bytes INTEGER NOT NULL,
    uploaded_by TEXT NOT NULL REFERENCES users(id),
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS point_rules (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('verified-completion', 'category-bonus', 'urgent-bonus', 'quality-bonus', 'milestone-bonus')),
    points INTEGER NOT NULL CHECK (points > 0),
    category TEXT,
    enabled INTEGER NOT NULL DEFAULT 1 CHECK (enabled IN (0, 1)),
    sample_label TEXT,
    created_by TEXT REFERENCES users(id) ON DELETE SET NULL,
    updated_by TEXT REFERENCES users(id) ON DELETE SET NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS point_transactions (
    id TEXT PRIMARY KEY,
    technician_id TEXT NOT NULL REFERENCES users(id),
    type TEXT NOT NULL CHECK (type IN ('job-reward', 'bonus', 'redemption', 'reversal', 'admin-adjustment')),
    points INTEGER NOT NULL CHECK (points <> 0),
    job_id TEXT REFERENCES service_jobs(id) ON DELETE SET NULL,
    redemption_id TEXT,
    rule_id TEXT REFERENCES point_rules(id) ON DELETE SET NULL,
    idempotency_key TEXT NOT NULL UNIQUE,
    reason TEXT,
    actor_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS reward_items (
    id TEXT PRIMARY KEY,
    product_id TEXT REFERENCES products(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    image_path TEXT,
    points_cost INTEGER NOT NULL CHECK (points_cost > 0),
    stock_quantity INTEGER NOT NULL CHECK (stock_quantity >= 0),
    active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0, 1)),
    created_by TEXT REFERENCES users(id) ON DELETE SET NULL,
    updated_by TEXT REFERENCES users(id) ON DELETE SET NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS redemption_requests (
    id TEXT PRIMARY KEY,
    reference TEXT NOT NULL UNIQUE,
    technician_id TEXT NOT NULL REFERENCES users(id),
    reward_id TEXT NOT NULL REFERENCES reward_items(id),
    reward_name_snapshot TEXT NOT NULL,
    points_cost_snapshot INTEGER NOT NULL CHECK (points_cost_snapshot > 0),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    status TEXT NOT NULL CHECK (status IN ('requested', 'pending-approval', 'approved', 'ready', 'collected', 'rejected', 'cancelled')),
    notes TEXT,
    approved_by TEXT REFERENCES users(id) ON DELETE SET NULL,
    approved_at TEXT,
    collected_at TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS redemption_status_history (
    id TEXT PRIMARY KEY,
    redemption_id TEXT NOT NULL REFERENCES redemption_requests(id) ON DELETE CASCADE,
    from_status TEXT,
    to_status TEXT NOT NULL,
    reason TEXT,
    changed_by TEXT NOT NULL REFERENCES users(id),
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    read_at TEXT,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS activity_logs (
    id TEXT PRIMARY KEY,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    action TEXT NOT NULL,
    actor_id TEXT NOT NULL REFERENCES users(id),
    details TEXT,
    created_at TEXT NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
  CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);
  CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone_primary);
  CREATE INDEX IF NOT EXISTS idx_enquiries_status ON enquiries(status);
  CREATE INDEX IF NOT EXISTS idx_enquiries_follow_up ON enquiries(follow_up_at);
  CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
  CREATE INDEX IF NOT EXISTS idx_site_surveys_project ON site_surveys(project_id);
  CREATE INDEX IF NOT EXISTS idx_quotations_status ON quotations(status);
  CREATE INDEX IF NOT EXISTS idx_quotations_customer ON quotations(customer_id);
  CREATE INDEX IF NOT EXISTS idx_products_search ON products(name, brand, model);
  CREATE INDEX IF NOT EXISTS idx_products_status ON products(publication_status, availability);
  CREATE INDEX IF NOT EXISTS idx_product_price_history_product ON product_price_history(product_id, created_at);
  CREATE INDEX IF NOT EXISTS idx_payments_project ON payments(project_id);
  CREATE INDEX IF NOT EXISTS idx_payment_adjustments_project ON payment_adjustments(project_id);
  CREATE INDEX IF NOT EXISTS idx_installation_items_project ON installation_items(project_id);
  CREATE INDEX IF NOT EXISTS idx_service_tickets_status ON service_tickets(status);
  CREATE INDEX IF NOT EXISTS idx_service_tickets_assigned ON service_tickets(assigned_to);
  CREATE INDEX IF NOT EXISTS idx_support_access_ticket ON support_access_tokens(ticket_id);
  CREATE INDEX IF NOT EXISTS idx_ticket_attachments_ticket ON ticket_attachments(ticket_id);
  CREATE INDEX IF NOT EXISTS idx_ticket_customer_attachments_ticket ON ticket_customer_attachments(ticket_id);
  CREATE INDEX IF NOT EXISTS idx_schedule_events_start ON schedule_events(scheduled_start);
  CREATE INDEX IF NOT EXISTS idx_schedule_events_assigned ON schedule_events(assigned_to);
  CREATE INDEX IF NOT EXISTS idx_service_jobs_status ON service_jobs(status, created_at);
  CREATE INDEX IF NOT EXISTS idx_service_jobs_assigned ON service_jobs(assigned_technician_id, status);
  CREATE INDEX IF NOT EXISTS idx_job_recipients_technician ON job_recipients(technician_id, response_status);
  CREATE INDEX IF NOT EXISTS idx_job_responses_job ON job_responses(job_id, responded_at);
  CREATE INDEX IF NOT EXISTS idx_job_assignments_job ON job_assignments(job_id, assigned_at);
  CREATE INDEX IF NOT EXISTS idx_job_status_history_job ON job_status_history(job_id, created_at);
  CREATE INDEX IF NOT EXISTS idx_job_completion_job ON job_completion_submissions(job_id, submitted_at);
  CREATE INDEX IF NOT EXISTS idx_job_attachments_job ON job_attachments(job_id, created_at);
  CREATE INDEX IF NOT EXISTS idx_point_transactions_technician ON point_transactions(technician_id, created_at);
  CREATE INDEX IF NOT EXISTS idx_reward_items_active ON reward_items(active, stock_quantity);
  CREATE INDEX IF NOT EXISTS idx_redemptions_technician ON redemption_requests(technician_id, created_at);
  CREATE INDEX IF NOT EXISTS idx_redemptions_status ON redemption_requests(status, created_at);
  CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, read_at);
  CREATE INDEX IF NOT EXISTS idx_activity_entity ON activity_logs(entity_type, entity_id);
`;

function getDatabasePath() {
  const configuredPath = process.env.PORTAL_DATABASE_PATH?.trim();
  if (configuredPath) {
    return path.isAbsolute(configuredPath) ? configuredPath : path.join(process.cwd(), configuredPath);
  }

  return path.join(process.cwd(), "data", "portal.sqlite");
}

function ensureProjectColumns(database: DatabaseSync) {
  const columns = database.prepare("PRAGMA table_info(projects)").all() as Array<{ name: string }>;
  const names = new Set(columns.map((column) => column.name));
  if (!names.has("warranty_start_date")) database.exec("ALTER TABLE projects ADD COLUMN warranty_start_date TEXT");
  if (!names.has("warranty_end_date")) database.exec("ALTER TABLE projects ADD COLUMN warranty_end_date TEXT");
  if (!names.has("site_latitude")) database.exec("ALTER TABLE projects ADD COLUMN site_latitude REAL");
  if (!names.has("site_longitude")) database.exec("ALTER TABLE projects ADD COLUMN site_longitude REAL");
  if (!names.has("site_instructions")) database.exec("ALTER TABLE projects ADD COLUMN site_instructions TEXT");
}

function ensureUserContactColumns(database: DatabaseSync) {
  const userColumns = database.prepare("PRAGMA table_info(users)").all() as Array<{ name: string }>;
  if (!new Set(userColumns.map((column) => column.name)).has("phone")) database.exec("ALTER TABLE users ADD COLUMN phone TEXT");

  const inviteColumns = database.prepare("PRAGMA table_info(user_invites)").all() as Array<{ name: string }>;
  if (!new Set(inviteColumns.map((column) => column.name)).has("phone")) database.exec("ALTER TABLE user_invites ADD COLUMN phone TEXT");
}

function ensureManagerRole(database: DatabaseSync) {
  const tableSql = (tableName: string) => {
    const row = database.prepare("SELECT sql FROM sqlite_master WHERE type = 'table' AND name = ? LIMIT 1").get(tableName) as { sql?: string } | undefined;
    return row?.sql ?? "";
  };

  if (tableSql("users").includes("'manager'") && tableSql("user_invites").includes("'manager'")) return;

  // SQLite cannot alter a CHECK constraint in place. Rebuild only the two small
  // account tables inside one transaction, preserving every existing row.
  database.exec("PRAGMA foreign_keys = OFF");
  try {
    database.exec("BEGIN IMMEDIATE");
    database.exec(`
      CREATE TABLE users_manager_migration (
        id TEXT PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        phone TEXT,
        role TEXT NOT NULL CHECK (role IN ('owner', 'manager', 'staff', 'technician')),
        password_hash TEXT NOT NULL,
        is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
      INSERT INTO users_manager_migration (id, email, name, phone, role, password_hash, is_active, created_at, updated_at)
      SELECT id, email, name, phone, role, password_hash, is_active, created_at, updated_at FROM users;
      DROP TABLE users;
      ALTER TABLE users_manager_migration RENAME TO users;

      CREATE TABLE user_invites_manager_migration (
        token_hash TEXT PRIMARY KEY,
        email TEXT NOT NULL,
        name TEXT NOT NULL,
        phone TEXT,
        role TEXT NOT NULL CHECK (role IN ('owner', 'manager', 'staff', 'technician')),
        invited_by TEXT NOT NULL REFERENCES users(id),
        expires_at TEXT NOT NULL,
        used_at TEXT,
        created_at TEXT NOT NULL
      );
      INSERT INTO user_invites_manager_migration (token_hash, email, name, phone, role, invited_by, expires_at, used_at, created_at)
      SELECT token_hash, email, name, phone, role, invited_by, expires_at, used_at, created_at FROM user_invites;
      DROP TABLE user_invites;
      ALTER TABLE user_invites_manager_migration RENAME TO user_invites;
    `);
    database.exec("COMMIT");
  } catch (error) {
    try {
      database.exec("ROLLBACK");
    } catch {
      // Keep the original migration error as the useful diagnostic.
    }
    throw error;
  } finally {
    database.exec("PRAGMA foreign_keys = ON");
  }
}

function ensureServiceTicketColumns(database: DatabaseSync) {
  const columns = database.prepare("PRAGMA table_info(service_tickets)").all() as Array<{ name: string }>;
  if (!new Set(columns.map((column) => column.name)).has("customer_update")) database.exec("ALTER TABLE service_tickets ADD COLUMN customer_update TEXT");
}

function ensureProductColumns(database: DatabaseSync) {
  const columns = database.prepare("PRAGMA table_info(products)").all() as Array<{ name: string }>;
  if (columns.length && !new Set(columns.map((column) => column.name)).has("price_type")) {
    database.exec("ALTER TABLE products ADD COLUMN price_type TEXT NOT NULL DEFAULT 'market' CHECK (price_type IN ('market', 'mrp'))");
  }
}

function ensureIdea3Columns(database: DatabaseSync) {
  const columns = database.prepare("PRAGMA table_info(job_completion_submissions)").all() as Array<{ name: string }>;
  if (!new Set(columns.map((column) => column.name)).has("camera_count")) database.exec("ALTER TABLE job_completion_submissions ADD COLUMN camera_count INTEGER CHECK (camera_count IS NULL OR camera_count > 0)");
}

function seedStaticCatalog(database: DatabaseSync) {
  const count = database.prepare("SELECT COUNT(*) AS count FROM products").get() as { count: number };
  if (Number(count.count) > 0) return;

  const statement = database.prepare(
    `INSERT INTO products
     (id, legacy_id, name, brand, model, category_key, category_name, image_path, image_alt, source_url, source_category,
      current_price_paisa, reference_price_paisa, price_display_mode, price_type, availability, publication_status, unit, created_at, updated_at)
     VALUES (@id, @legacyId, @name, @brand, @model, @categoryKey, @categoryName, @imagePath, @imageAlt, @sourceUrl, @sourceCategory,
      @currentPricePaisa, @referencePricePaisa, 'show_price', @priceType, 'not_tracked', 'published', 'piece', @createdAt, @updatedAt)`,
  );
  const timestamp = nowIso();
  database.exec("BEGIN IMMEDIATE");

  try {
    for (const product of catalogProducts as CatalogProduct[]) {
      const price = product.price === null ? null : Math.round(product.price * 100);
      const referencePrice = product.originalPrice === null ? null : Math.round(product.originalPrice * 100);
      statement.run({
        id: product.id,
        legacyId: product.id,
        name: product.name,
        brand: product.brand,
        model: product.model,
        categoryKey: product.categoryKey,
        categoryName: product.categoryName,
        imagePath: product.image,
        imageAlt: product.name,
        sourceUrl: product.sourceUrl,
        sourceCategory: product.sourceCategory,
        currentPricePaisa: price,
        referencePricePaisa: referencePrice,
        priceType: product.priceType ?? "market",
        createdAt: timestamp,
        updatedAt: timestamp,
      });
    }
    database.exec("COMMIT");
  } catch (error) {
    database.exec("ROLLBACK");
    throw error;
  }
}

function seedIdea3Defaults(database: DatabaseSync) {
  const timestamp = nowIso();
  const rulesCount = database.prepare("SELECT COUNT(*) AS count FROM point_rules").get() as { count: number };
  if (Number(rulesCount.count) === 0) {
    const rules = [
      ["sample-verified-completion", "Verified camera for one customer", "verified-completion", 100, "cctv-installation", "Business rule: 100 points per verified camera for one customer"],
      ["sample-complex-bonus", "Complex job bonus", "category-bonus", 20, "cctv-installation", "Sample value – confirm with management"],
      ["sample-quality-bonus", "Approved quality bonus", "quality-bonus", 10, null, "Sample value – confirm with management"],
    ];
    const statement = database.prepare(
      `INSERT INTO point_rules (id, name, type, points, category, enabled, sample_label, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, 1, ?, ?, ?)`,
    );
    for (const rule of rules) statement.run(...rule, timestamp, timestamp);
  }

  const rewardsCount = database.prepare("SELECT COUNT(*) AS count FROM reward_items").get() as { count: number };
  if (Number(rewardsCount.count) === 0) {
    const samples = [
      ["sample-reward-memory", "Memory card or storage accessory", "CCTV accessories", 100, 5],
      ["sample-reward-cable", "Cable and connector kit", "Cables and connectors", 150, 5],
      ["sample-reward-adapter", "Power adapter or networking accessory", "Networking accessories", 200, 3],
    ];
    const rewardStatement = database.prepare(
      `INSERT INTO reward_items (id, product_id, name, description, category, image_path, points_cost, stock_quantity, active, created_at, updated_at)
       VALUES (?, NULL, ?, ?, ?, NULL, ?, ?, 1, ?, ?)`,
    );
    for (const sample of samples) rewardStatement.run(sample[0], sample[1], "Sample reward – replaced by the EZVIZ camera reward catalogue.", sample[2], sample[3], sample[4], timestamp, timestamp);
  }

  database.prepare("UPDATE point_rules SET name = ?, points = 100, category = ?, sample_label = ?, updated_at = ? WHERE id = ? AND (sample_label LIKE 'Sample value%' OR sample_label IS NULL)").run("Verified camera for one customer", "cctv-installation", "Business rule: 100 points per verified camera for one customer", timestamp, "sample-verified-completion");
  database.prepare("UPDATE reward_items SET active = 0, updated_at = ? WHERE id LIKE 'sample-reward-%'").run(timestamp);

  const products = database.prepare(
    "SELECT id, name, image_path, current_price_paisa FROM products WHERE upper(brand) = 'EZVIZ' AND current_price_paisa IS NOT NULL ORDER BY name ASC",
  ).all() as Array<{ id: string; name: string; image_path: string | null; current_price_paisa: number }>;
  const insertReward = database.prepare(
    `INSERT OR IGNORE INTO reward_items (id, product_id, name, description, category, image_path, points_cost, stock_quantity, active, created_at, updated_at)
     VALUES (?, ?, ?, ?, 'EZVIZ cameras', ?, ?, 1, 1, ?, ?)`,
  );
  const updateReward = database.prepare(
    `UPDATE reward_items SET name = ?, description = ?, category = 'EZVIZ cameras', image_path = ?, points_cost = ?, active = 1, updated_at = ?
     WHERE product_id = ? AND id LIKE 'ezviz-reward-%'`,
  );
  for (const product of products) {
    const rewardId = `ezviz-reward-${product.id}`;
    const pointsCost = Math.round(product.current_price_paisa / 100);
    const description = `EZVIZ camera reward. Cost is linked to the current managed catalogue amount: NPR ${pointsCost}.`;
    insertReward.run(rewardId, product.id, product.name, description, product.image_path, pointsCost, timestamp, timestamp);
    updateReward.run(product.name, description, product.image_path, pointsCost, timestamp, product.id);
  }
}

export function getPortalDatabase() {
  if (globalThis.portalDatabase) {
    return globalThis.portalDatabase;
  }

  const databasePath = getDatabasePath();
  fs.mkdirSync(path.dirname(databasePath), { recursive: true });
  const database = new DatabaseSync(databasePath);
  database.exec(databaseSchema);
  ensureProjectColumns(database);
  ensureUserContactColumns(database);
  ensureManagerRole(database);
  ensureServiceTicketColumns(database);
  ensureProductColumns(database);
  ensureIdea3Columns(database);
  seedStaticCatalog(database);
  seedIdea3Defaults(database);

  if (process.env.NODE_ENV !== "production") {
    globalThis.portalDatabase = database;
  }

  return database;
}

export function nowIso() {
  return new Date().toISOString();
}

export function newId() {
  return crypto.randomUUID();
}

export function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function createToken() {
  return crypto.randomBytes(32).toString("hex");
}

export function nextReference(name: string, prefix: string) {
  const database = getPortalDatabase();
  database.exec("BEGIN IMMEDIATE");

  try {
    database
      .prepare("INSERT OR IGNORE INTO sequences (name, current_value) VALUES (?, 0)")
      .run(name);
    database.prepare("UPDATE sequences SET current_value = current_value + 1 WHERE name = ?").run(name);
    const row = database.prepare("SELECT current_value FROM sequences WHERE name = ?").get(name) as
      | { current_value: number }
      | undefined;
    database.exec("COMMIT");
    const nextValue = row?.current_value ?? 1;
    return `SSE-${prefix}-${String(nextValue).padStart(5, "0")}`;
  } catch (error) {
    database.exec("ROLLBACK");
    throw error;
  }
}

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function getUserByEmail(email: string) {
  return getPortalDatabase()
    .prepare("SELECT * FROM users WHERE email = ? LIMIT 1")
    .get(normalizeEmail(email)) as
    | {
        id: string;
        email: string;
        name: string;
        phone: string | null;
        role: PortalRole;
        password_hash: string;
        is_active: number;
      }
    | undefined;
}

export function getUserById(id: string) {
  return getPortalDatabase()
    .prepare("SELECT id, email, name, phone, role, is_active FROM users WHERE id = ? LIMIT 1")
    .get(id) as
    | { id: string; email: string; name: string; phone: string | null; role: PortalRole; is_active: number }
    | undefined;
}

export function countUsers() {
  const row = getPortalDatabase().prepare("SELECT COUNT(*) AS count FROM users").get() as { count: number };
  return row.count;
}

export function createUser(input: {
  email: string;
  name: string;
  phone?: string | null;
  role: PortalRole;
  passwordHash: string;
}) {
  const timestamp = nowIso();
  const id = newId();
  getPortalDatabase()
    .prepare(
      `INSERT INTO users (id, email, name, phone, role, password_hash, is_active, created_at, updated_at)
       VALUES (@id, @email, @name, @phone, @role, @passwordHash, 1, @createdAt, @updatedAt)`,
    )
    .run({
      id,
      email: normalizeEmail(input.email),
      name: input.name.trim(),
      phone: input.phone?.trim() || null,
      role: input.role,
      passwordHash: input.passwordHash,
      createdAt: timestamp,
      updatedAt: timestamp,
    });
  return id;
}

export function createSession(userId: string, tokenHash: string, expiresAt: string) {
  getPortalDatabase()
    .prepare(
      `INSERT INTO sessions (token_hash, user_id, expires_at, created_at)
       VALUES (?, ?, ?, ?)`,
    )
    .run(tokenHash, userId, expiresAt, nowIso());
}

export function getUserBySessionHash(tokenHash: string) {
  const row = getPortalDatabase()
    .prepare(
      `SELECT users.id, users.email, users.name, users.phone, users.role, users.is_active, sessions.expires_at
       FROM sessions JOIN users ON users.id = sessions.user_id
       WHERE sessions.token_hash = ? LIMIT 1`,
    )
    .get(tokenHash) as
    | { id: string; email: string; name: string; phone: string | null; role: PortalRole; is_active: number; expires_at: string }
    | undefined;

  if (!row || row.is_active !== 1 || row.expires_at <= nowIso()) {
    if (row) {
      deleteSession(tokenHash);
    }
    return undefined;
  }

  return row;
}

export function deleteSession(tokenHash: string) {
  getPortalDatabase().prepare("DELETE FROM sessions WHERE token_hash = ?").run(tokenHash);
}

export function createInvite(input: {
  tokenHash: string;
  email: string;
  name: string;
  phone?: string | null;
  role: PortalRole;
  invitedBy: string;
  expiresAt: string;
}) {
  getPortalDatabase()
    .prepare(
      `INSERT INTO user_invites (token_hash, email, name, phone, role, invited_by, expires_at, created_at)
       VALUES (@tokenHash, @email, @name, @phone, @role, @invitedBy, @expiresAt, @createdAt)`,
    )
    .run({
      ...input,
      email: normalizeEmail(input.email),
      createdAt: nowIso(),
    });
}

export function getInvite(tokenHash: string) {
  return getPortalDatabase()
    .prepare(
      `SELECT token_hash, email, name, phone, role, expires_at, used_at
       FROM user_invites WHERE token_hash = ? LIMIT 1`,
    )
    .get(tokenHash) as
    | { token_hash: string; email: string; name: string; phone: string | null; role: PortalRole; expires_at: string; used_at: string | null }
    | undefined;
}

export function markInviteUsed(tokenHash: string) {
  getPortalDatabase().prepare("UPDATE user_invites SET used_at = ? WHERE token_hash = ?").run(nowIso(), tokenHash);
}

export function updateUserPhone(userId: string, phone: string | null) {
  getPortalDatabase().prepare("UPDATE users SET phone = ?, updated_at = ? WHERE id = ?").run(phone, nowIso(), userId);
}

export function updateUserRole(userId: string, role: PortalRole) {
  getPortalDatabase().prepare("UPDATE users SET role = ?, updated_at = ? WHERE id = ?").run(role, nowIso(), userId);
}

export function recordActivity(input: {
  entityType: string;
  entityId: string;
  action: string;
  actorId: string;
  details?: Record<string, unknown>;
}) {
  getPortalDatabase()
    .prepare(
      `INSERT INTO activity_logs (id, entity_type, entity_id, action, actor_id, details, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      newId(),
      input.entityType,
      input.entityId,
      input.action,
      input.actorId,
      input.details ? JSON.stringify(input.details) : null,
      nowIso(),
    );
}

export type CustomerInsert = {
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
  createdBy: string;
};

export function insertCustomer(input: CustomerInsert) {
  const timestamp = nowIso();
  getPortalDatabase()
    .prepare(
      `INSERT INTO customers
       (id, name, business_name, customer_type, phone_primary, phone_secondary, email, address, area, notes, created_by, created_at, updated_at)
       VALUES (@id, @name, @businessName, @customerType, @phonePrimary, @phoneSecondary, @email, @address, @area, @notes, @createdBy, @createdAt, @updatedAt)`,
    )
    .run({ ...input, createdAt: timestamp, updatedAt: timestamp });
}

export function findCustomerByPhone(phone: string) {
  const candidates = getPortalDatabase().prepare("SELECT id, name, phone_primary FROM customers").all() as Array<{ id: string; name: string; phone_primary: string }>;
  return candidates.find((customer) => normalizePortalPhone(customer.phone_primary) === normalizePortalPhone(phone));
}

export function updateCustomer(input: Omit<CustomerInsert, "createdBy"> & { id: string }) {
  getPortalDatabase()
    .prepare(
      `UPDATE customers
       SET name = @name, business_name = @businessName, customer_type = @customerType,
           phone_primary = @phonePrimary, phone_secondary = @phoneSecondary, email = @email,
           address = @address, area = @area, notes = @notes, updated_at = @updatedAt
       WHERE id = @id`,
    )
    .run({ ...input, updatedAt: nowIso() });
}

export function insertEnquiry(input: {
  id: string;
  reference: string;
  customerId: string;
  type: EnquiryType;
  source: EnquirySource;
  status: EnquiryStatus;
  area: string | null;
  notes: string | null;
  followUpAt: string | null;
  assignedTo: string | null;
  createdBy: string;
}) {
  const timestamp = nowIso();
  getPortalDatabase()
    .prepare(
      `INSERT INTO enquiries
       (id, reference, customer_id, type, source, status, area, notes, follow_up_at, assigned_to, created_by, created_at, updated_at)
       VALUES (@id, @reference, @customerId, @type, @source, @status, @area, @notes, @followUpAt, @assignedTo, @createdBy, @createdAt, @updatedAt)`,
    )
    .run({ ...input, createdAt: timestamp, updatedAt: timestamp });
}

export function updateEnquiry(input: {
  id: string;
  type: EnquiryType;
  source: EnquirySource;
  status: EnquiryStatus;
  area: string | null;
  notes: string | null;
  followUpAt: string | null;
  assignedTo: string | null;
}) {
  getPortalDatabase()
    .prepare(
      `UPDATE enquiries
       SET type = @type, source = @source, status = @status, area = @area,
           notes = @notes, follow_up_at = @followUpAt, assigned_to = @assignedTo,
           updated_at = @updatedAt
       WHERE id = @id`,
    )
    .run({ ...input, updatedAt: nowIso() });
}

export function insertProject(input: {
  id: string;
  reference: string;
  customerId: string;
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
  warrantyStartDate: string | null;
  warrantyEndDate: string | null;
  notes: string | null;
  createdBy: string;
}) {
  const timestamp = nowIso();
  getPortalDatabase()
    .prepare(
      `INSERT INTO projects
       (id, reference, customer_id, title, project_type, status, site_address, area, site_latitude, site_longitude, site_instructions, planned_install_date, estimated_amount, warranty_start_date, warranty_end_date, notes, created_by, created_at, updated_at)
       VALUES (@id, @reference, @customerId, @title, @projectType, @status, @siteAddress, @area, @siteLatitude, @siteLongitude, @siteInstructions, @plannedInstallDate, @estimatedAmount, @warrantyStartDate, @warrantyEndDate, @notes, @createdBy, @createdAt, @updatedAt)`,
    )
    .run({ ...input, createdAt: timestamp, updatedAt: timestamp });
}

export function updateProject(input: {
  id: string;
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
  warrantyStartDate: string | null;
  warrantyEndDate: string | null;
  notes: string | null;
}) {
  getPortalDatabase()
    .prepare(
      `UPDATE projects
       SET title = @title, project_type = @projectType, status = @status,
           site_address = @siteAddress, area = @area, site_latitude = @siteLatitude,
           site_longitude = @siteLongitude, site_instructions = @siteInstructions,
           planned_install_date = @plannedInstallDate,
           estimated_amount = @estimatedAmount, warranty_start_date = @warrantyStartDate,
           warranty_end_date = @warrantyEndDate, notes = @notes, updated_at = @updatedAt
       WHERE id = @id`,
    )
    .run({ ...input, updatedAt: nowIso() });
}

export function insertSiteSurvey(input: {
  id: string;
  projectId: string;
  surveyDate: string;
  surveyorId: string | null;
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
  recordedBy: string;
}) {
  const timestamp = nowIso();
  getPortalDatabase()
    .prepare(
      `INSERT INTO site_surveys
       (id, project_id, survey_date, surveyor_id, property_type, installation_area, camera_count, camera_type,
        indoor_outdoor, cable_length, cable_routes, storage_requirements, networking_needs, mounting_constraints,
        customer_requirements, outcome, next_steps, recorded_by, created_at, updated_at)
       VALUES (@id, @projectId, @surveyDate, @surveyorId, @propertyType, @installationArea, @cameraCount, @cameraType,
        @indoorOutdoor, @cableLength, @cableRoutes, @storageRequirements, @networkingNeeds, @mountingConstraints,
        @customerRequirements, @outcome, @nextSteps, @recordedBy, @createdAt, @updatedAt)`,
    )
    .run({ ...input, createdAt: timestamp, updatedAt: timestamp });
}

export function insertQuotation(input: {
  id: string;
  reference: string;
  customerId: string;
  projectId: string | null;
  status: "draft";
  vatRate: number;
  subtotal: number;
  vatAmount: number;
  total: number;
  validDays: number;
  validUntil: string;
  notes: string | null;
  createdBy: string;
  items: Array<{ id: string; description: string; quantity: number; unitPrice: number; lineTotal: number; sortOrder: number }>;
}) {
  const database = getPortalDatabase();
  const timestamp = nowIso();
  database.exec("BEGIN IMMEDIATE");

  try {
    database
      .prepare(
        `INSERT INTO quotations
         (id, reference, customer_id, project_id, status, vat_rate, subtotal, vat_amount, total, valid_days, valid_until, notes, created_by, created_at, updated_at)
         VALUES (@id, @reference, @customerId, @projectId, @status, @vatRate, @subtotal, @vatAmount, @total, @validDays, @validUntil, @notes, @createdBy, @createdAt, @updatedAt)`,
      )
      .run({
        id: input.id,
        reference: input.reference,
        customerId: input.customerId,
        projectId: input.projectId,
        status: input.status,
        vatRate: input.vatRate,
        subtotal: input.subtotal,
        vatAmount: input.vatAmount,
        total: input.total,
        validDays: input.validDays,
        validUntil: input.validUntil,
        notes: input.notes,
        createdBy: input.createdBy,
        createdAt: timestamp,
        updatedAt: timestamp,
      });

    const itemStatement = database.prepare(
      `INSERT INTO quotation_items (id, quotation_id, description, quantity, unit_price, line_total, sort_order)
       VALUES (@id, @quotationId, @description, @quantity, @unitPrice, @lineTotal, @sortOrder)`,
    );
    for (const item of input.items) {
      itemStatement.run({ ...item, quotationId: input.id });
    }

    database.exec("COMMIT");
  } catch (error) {
    database.exec("ROLLBACK");
    throw error;
  }
}

export function insertPayment(input: {
  id: string;
  projectId: string;
  quotationId: string | null;
  method: "fonepay" | "esewa" | "cash";
  amount: number;
  paidAt: string;
  reference: string | null;
  notes: string | null;
  recordedBy: string;
}) {
  const database = getPortalDatabase();
  const timestamp = nowIso();
  database.exec("BEGIN IMMEDIATE");

  try {
    database
      .prepare(
        `INSERT INTO payments
         (id, project_id, quotation_id, method, amount, paid_at, reference, notes, recorded_by, created_at, updated_at)
         VALUES (@id, @projectId, @quotationId, @method, @amount, @paidAt, @reference, @notes, @recordedBy, @createdAt, @updatedAt)`,
      )
      .run({ ...input, createdAt: timestamp, updatedAt: timestamp });
    database.prepare("UPDATE projects SET amount_paid = amount_paid + ?, updated_at = ? WHERE id = ?").run(input.amount, timestamp, input.projectId);
    database.exec("COMMIT");
  } catch (error) {
    database.exec("ROLLBACK");
    throw error;
  }
}

export function insertPaymentAdjustment(input: {
  id: string;
  projectId: string;
  paymentId: string;
  type: "refund" | "reversal";
  amount: number;
  reason: string;
  recordedBy: string;
}) {
  const database = getPortalDatabase();
  const timestamp = nowIso();
  database.exec("BEGIN IMMEDIATE");

  try {
    database
      .prepare(
        `INSERT INTO payment_adjustments
         (id, project_id, payment_id, type, amount, reason, recorded_by, created_at)
         VALUES (@id, @projectId, @paymentId, @type, @amount, @reason, @recordedBy, @createdAt)`,
      )
      .run({ ...input, createdAt: timestamp });
    database
      .prepare("UPDATE projects SET amount_paid = MAX(amount_paid - ?, 0), updated_at = ? WHERE id = ?")
      .run(input.amount, timestamp, input.projectId);
    database.exec("COMMIT");
  } catch (error) {
    database.exec("ROLLBACK");
    throw error;
  }
}

export function insertInstallationItem(input: {
  id: string;
  projectId: string;
  description: string;
  quotedQuantity: number | null;
  installedQuantity: number;
  serialNumber: string | null;
  notes: string | null;
  recordedBy: string;
}) {
  const timestamp = nowIso();
  getPortalDatabase()
    .prepare(
      `INSERT INTO installation_items
       (id, project_id, description, quoted_quantity, installed_quantity, serial_number, notes, recorded_by, created_at, updated_at)
       VALUES (@id, @projectId, @description, @quotedQuantity, @installedQuantity, @serialNumber, @notes, @recordedBy, @createdAt, @updatedAt)`,
    )
    .run({ ...input, createdAt: timestamp, updatedAt: timestamp });
}

export function insertServiceTicket(input: {
  id: string;
  reference: string;
  customerId: string | null;
  customerName: string;
  phone: string;
  email: string | null;
  projectId: string | null;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  description: string;
  preferredContact: string | null;
  customerUpdate?: string | null;
}) {
  const database = getPortalDatabase();
  const timestamp = nowIso();
  database.exec("BEGIN IMMEDIATE");

  try {
    database
      .prepare(
        `INSERT INTO service_tickets
         (id, reference, customer_id, customer_name, phone, email, project_id, category, priority, status, description, preferred_contact, customer_update, created_at, updated_at)
         VALUES (@id, @reference, @customerId, @customerName, @phone, @email, @projectId, @category, @priority, @status, @description, @preferredContact, @customerUpdate, @createdAt, @updatedAt)`,
      )
      .run({ ...input, customerUpdate: input.customerUpdate ?? null, createdAt: timestamp, updatedAt: timestamp });

    const owners = database.prepare("SELECT id FROM users WHERE role = 'owner' AND is_active = 1").all() as Array<{ id: string }>;
    const notification = database.prepare(
      `INSERT INTO notifications (id, user_id, type, title, message, entity_type, entity_id, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    );
    for (const owner of owners) {
      notification.run(
        newId(),
        owner.id,
        "new-service-ticket",
        "New support ticket",
        `${input.reference} from ${input.customerName} needs review.`,
        "service-ticket",
        input.id,
        timestamp,
      );
    }

    database.exec("COMMIT");
  } catch (error) {
    database.exec("ROLLBACK");
    throw error;
  }
}

export function createSupportAccessToken(input: { tokenHash: string; ticketId: string; expiresAt: string }) {
  getPortalDatabase()
    .prepare(
      `INSERT INTO support_access_tokens (token_hash, ticket_id, expires_at, created_at)
       VALUES (@tokenHash, @ticketId, @expiresAt, @createdAt)`,
    )
    .run({ ...input, createdAt: nowIso() });
}

export function insertTicketAttachment(input: {
  id: string;
  ticketId: string;
  originalName: string;
  storedName: string;
  mimeType: string;
  sizeBytes: number;
  uploadedBy: string;
}) {
  getPortalDatabase()
    .prepare(
      `INSERT INTO ticket_attachments
       (id, ticket_id, original_name, stored_name, mime_type, size_bytes, uploaded_by, created_at)
       VALUES (@id, @ticketId, @originalName, @storedName, @mimeType, @sizeBytes, @uploadedBy, @createdAt)`,
    )
    .run({ ...input, createdAt: nowIso() });
}

export function insertJobAttachment(input: {
  id: string;
  jobId: string;
  originalName: string;
  storedName: string;
  mimeType: string;
  sizeBytes: number;
  uploadedBy: string;
}) {
  getPortalDatabase().prepare(
    `INSERT INTO job_attachments
     (id, job_id, original_name, stored_name, mime_type, size_bytes, uploaded_by, created_at)
     VALUES (@id, @jobId, @originalName, @storedName, @mimeType, @sizeBytes, @uploadedBy, @createdAt)`,
  ).run({ ...input, createdAt: nowIso() });
}

export function insertCustomerTicketAttachment(input: {
  id: string;
  ticketId: string;
  originalName: string;
  storedName: string;
  mimeType: string;
  sizeBytes: number;
}) {
  getPortalDatabase()
    .prepare(
      `INSERT INTO ticket_customer_attachments
       (id, ticket_id, original_name, stored_name, mime_type, size_bytes, created_at)
       VALUES (@id, @ticketId, @originalName, @storedName, @mimeType, @sizeBytes, @createdAt)`,
    )
    .run({ ...input, createdAt: nowIso() });
}

export function insertScheduleEvent(input: {
  id: string;
  eventType: "survey" | "installation" | "service-visit";
  title: string;
  scheduledStart: string;
  scheduledEnd: string;
  status: "scheduled";
  projectId: string | null;
  ticketId: string | null;
  assignedTo: string | null;
  notes: string | null;
  createdBy: string;
}) {
  const timestamp = nowIso();
  getPortalDatabase()
    .prepare(
      `INSERT INTO schedule_events
       (id, event_type, title, scheduled_start, scheduled_end, status, project_id, ticket_id, assigned_to, notes, created_by, created_at, updated_at)
       VALUES (@id, @eventType, @title, @scheduledStart, @scheduledEnd, @status, @projectId, @ticketId, @assignedTo, @notes, @createdBy, @createdAt, @updatedAt)`,
    )
    .run({ ...input, createdAt: timestamp, updatedAt: timestamp });
}

export function updateScheduleEventStatus(input: { id: string; status: "scheduled" | "in-progress" | "completed" | "cancelled" | "rescheduled" }) {
  getPortalDatabase().prepare("UPDATE schedule_events SET status = ?, updated_at = ? WHERE id = ?").run(input.status, nowIso(), input.id);
}

export function updateScheduleEvent(input: { id: string; scheduledStart: string; scheduledEnd: string; notes: string | null }) {
  getPortalDatabase()
    .prepare(
      `UPDATE schedule_events
       SET scheduled_start = @scheduledStart, scheduled_end = @scheduledEnd,
           status = 'rescheduled', notes = @notes, updated_at = @updatedAt
       WHERE id = @id`,
    )
    .run({ ...input, updatedAt: nowIso() });
}

export function updateServiceTicket(input: {
  id: string;
  status: TicketStatus;
  assignedTo: string | null;
  internalNotes: string | null;
  customerUpdate: string | null;
  resolutionSummary: string | null;
}) {
  getPortalDatabase()
    .prepare(
      `UPDATE service_tickets
       SET status = @status, assigned_to = @assignedTo, internal_notes = @internalNotes,
           customer_update = @customerUpdate,
           resolution_summary = @resolutionSummary, updated_at = @updatedAt
       WHERE id = @id`,
    )
    .run({ ...input, updatedAt: nowIso() });
}

export function createNotification(input: {
  userId: string;
  type: string;
  title: string;
  message: string;
  entityType: string;
  entityId: string;
}) {
  getPortalDatabase()
    .prepare(
      `INSERT INTO notifications (id, user_id, type, title, message, entity_type, entity_id, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(newId(), input.userId, input.type, input.title, input.message, input.entityType, input.entityId, nowIso());
}

export function markNotificationRead(id: string, userId: string) {
  getPortalDatabase().prepare("UPDATE notifications SET read_at = ? WHERE id = ? AND user_id = ?").run(nowIso(), id, userId);
}

export function ensureDueFollowUpNotifications() {
  const database = getPortalDatabase();
  const dueEnquiries = database
    .prepare(
      `SELECT id, reference, follow_up_at
       FROM enquiries
       WHERE follow_up_at IS NOT NULL AND follow_up_at <= ? AND status NOT IN ('converted', 'lost')`,
    )
    .all(nowIso()) as Array<{ id: string; reference: string; follow_up_at: string }>;
  if (!dueEnquiries.length) return;

  const recipients = database.prepare("SELECT id FROM users WHERE role IN ('owner', 'manager', 'staff') AND is_active = 1").all() as Array<{ id: string }>;
  const exists = database.prepare("SELECT id FROM notifications WHERE user_id = ? AND type = 'overdue-follow-up' AND entity_id = ? LIMIT 1");
  const insert = database.prepare(
    `INSERT INTO notifications (id, user_id, type, title, message, entity_type, entity_id, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
  );

  for (const enquiry of dueEnquiries) {
    for (const recipient of recipients) {
      if (exists.get(recipient.id, enquiry.id)) continue;
      insert.run(
        newId(),
        recipient.id,
        "overdue-follow-up",
        "Follow-up is due",
        `${enquiry.reference} needs a follow-up for the linked customer.`,
        "enquiry",
        enquiry.id,
        nowIso(),
      );
    }
  }
}

export function insertProduct(input: {
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
  currentPricePaisa: number | null;
  referencePricePaisa: number | null;
  priceDisplayMode: "show_price" | "contact_for_price";
  priceType: "market" | "mrp";
  availability: "in_stock" | "out_of_stock" | "unavailable" | "not_tracked";
  publicationStatus: "draft" | "published" | "archived";
  unit: string;
  warrantyMonths: number | null;
  createdBy: string;
}) {
  const database = getPortalDatabase();
  const timestamp = nowIso();
  database.exec("BEGIN IMMEDIATE");

  try {
    database.prepare(
      `INSERT INTO products
       (id, legacy_id, name, brand, model, category_key, category_name, description, specifications, image_path, image_alt,
        source_url, source_category, current_price_paisa, reference_price_paisa, price_display_mode, price_type, availability,
        publication_status, unit, warranty_months, created_by, updated_by, created_at, updated_at)
       VALUES (@id, @legacyId, @name, @brand, @model, @categoryKey, @categoryName, @description, @specifications, @imagePath, @imageAlt,
        @sourceUrl, @sourceCategory, @currentPricePaisa, @referencePricePaisa, @priceDisplayMode, @priceType, @availability,
        @publicationStatus, @unit, @warrantyMonths, @createdBy, @createdBy, @createdAt, @updatedAt)`,
    ).run({ ...input, createdAt: timestamp, updatedAt: timestamp });
    database.prepare(
      `INSERT INTO product_price_history
       (id, product_id, previous_price_paisa, new_price_paisa, previous_reference_price_paisa, new_reference_price_paisa, reason, changed_by, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ).run(newId(), input.id, null, input.currentPricePaisa, null, input.referencePricePaisa, "Initial product record", input.createdBy, timestamp);
    database.exec("COMMIT");
  } catch (error) {
    database.exec("ROLLBACK");
    throw error;
  }
}

export function updateProduct(input: {
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
  currentPricePaisa: number | null;
  referencePricePaisa: number | null;
  priceDisplayMode: "show_price" | "contact_for_price";
  priceType: "market" | "mrp";
  availability: "in_stock" | "out_of_stock" | "unavailable" | "not_tracked";
  publicationStatus: "draft" | "published" | "archived";
  unit: string;
  warrantyMonths: number | null;
  updatedBy: string;
  previousPricePaisa: number | null;
  previousReferencePricePaisa: number | null;
  priceChangeReason: string | null;
}) {
  const database = getPortalDatabase();
  const timestamp = nowIso();
  database.exec("BEGIN IMMEDIATE");

  try {
    database.prepare(
      `UPDATE products SET
        legacy_id = @legacyId, name = @name, brand = @brand, model = @model, category_key = @categoryKey,
        category_name = @categoryName, description = @description, specifications = @specifications,
        image_path = @imagePath, image_alt = @imageAlt, source_url = @sourceUrl, source_category = @sourceCategory,
        current_price_paisa = @currentPricePaisa, reference_price_paisa = @referencePricePaisa,
        price_display_mode = @priceDisplayMode, price_type = @priceType, availability = @availability, publication_status = @publicationStatus,
        unit = @unit, warranty_months = @warrantyMonths, updated_by = @updatedBy, updated_at = @updatedAt
       WHERE id = @id`,
    ).run({ ...input, updatedAt: timestamp });

    if (input.previousPricePaisa !== input.currentPricePaisa || input.previousReferencePricePaisa !== input.referencePricePaisa) {
      database.prepare(
        `INSERT INTO product_price_history
         (id, product_id, previous_price_paisa, new_price_paisa, previous_reference_price_paisa, new_reference_price_paisa, reason, changed_by, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      ).run(newId(), input.id, input.previousPricePaisa, input.currentPricePaisa, input.previousReferencePricePaisa, input.referencePricePaisa, input.priceChangeReason, input.updatedBy, timestamp);
    }

    database.exec("COMMIT");
  } catch (error) {
    database.exec("ROLLBACK");
    throw error;
  }
}

export function applyProductImport(rows: Array<{
  id: string | null;
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
  currentPricePaisa: number | null;
  referencePricePaisa: number | null;
  priceDisplayMode: "show_price" | "contact_for_price";
  priceType: "market" | "mrp";
  availability: "in_stock" | "out_of_stock" | "unavailable" | "not_tracked";
  publicationStatus: "draft" | "published" | "archived";
  unit: string;
  warrantyMonths: number | null;
}>, actorId: string) {
  const database = getPortalDatabase();
  const timestamp = nowIso();
  database.exec("BEGIN IMMEDIATE");

  try {
    for (const row of rows) {
      const existing = database.prepare(
        "SELECT id, current_price_paisa, reference_price_paisa FROM products WHERE (? <> '' AND id = ?) OR (? <> '' AND legacy_id = ?) LIMIT 1",
      ).get(row.id ?? "", row.id ?? "", row.legacyId ?? "", row.legacyId ?? "") as { id: string; current_price_paisa: number | null; reference_price_paisa: number | null } | undefined;
      const id = existing?.id ?? row.id ?? newId();

      if (existing) {
        database.prepare(
          `UPDATE products SET legacy_id = @legacyId, name = @name, brand = @brand, model = @model,
            category_key = @categoryKey, category_name = @categoryName, description = @description,
            specifications = @specifications, image_path = @imagePath, image_alt = @imageAlt,
            source_url = @sourceUrl, source_category = @sourceCategory, current_price_paisa = @currentPricePaisa,
            reference_price_paisa = @referencePricePaisa, price_display_mode = @priceDisplayMode, price_type = @priceType,
            availability = @availability, publication_status = @publicationStatus, unit = @unit,
            warranty_months = @warrantyMonths, updated_by = @updatedBy, updated_at = @updatedAt WHERE id = @id`,
        ).run({ ...row, id, updatedBy: actorId, updatedAt: timestamp });
        if (existing.current_price_paisa !== row.currentPricePaisa || existing.reference_price_paisa !== row.referencePricePaisa) {
          database.prepare(
            `INSERT INTO product_price_history
             (id, product_id, previous_price_paisa, new_price_paisa, previous_reference_price_paisa, new_reference_price_paisa, reason, changed_by, created_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          ).run(newId(), id, existing.current_price_paisa, row.currentPricePaisa, existing.reference_price_paisa, row.referencePricePaisa, "CSV import", actorId, timestamp);
        }
      } else {
        database.prepare(
          `INSERT INTO products
           (id, legacy_id, name, brand, model, category_key, category_name, description, specifications, image_path, image_alt,
            source_url, source_category, current_price_paisa, reference_price_paisa, price_display_mode, price_type,
            availability, publication_status, unit, warranty_months, created_by, updated_by, created_at, updated_at)
           VALUES (@id, @legacyId, @name, @brand, @model, @categoryKey, @categoryName, @description, @specifications, @imagePath, @imageAlt,
            @sourceUrl, @sourceCategory, @currentPricePaisa, @referencePricePaisa, @priceDisplayMode, @priceType,
            @availability, @publicationStatus, @unit, @warrantyMonths, @updatedBy, @updatedBy, @updatedAt, @updatedAt)`,
        ).run({ ...row, id, updatedBy: actorId, updatedAt: timestamp });
        database.prepare(
          `INSERT INTO product_price_history
           (id, product_id, previous_price_paisa, new_price_paisa, previous_reference_price_paisa, new_reference_price_paisa, reason, changed_by, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        ).run(newId(), id, null, row.currentPricePaisa, null, row.referencePricePaisa, "CSV import", actorId, timestamp);
      }
    }
    database.exec("COMMIT");
  } catch (error) {
    database.exec("ROLLBACK");
    throw error;
  }
}

function addJobStatusHistory(database: DatabaseSync, jobId: string, fromStatus: string | null, toStatus: string, changedBy: string, reason: string | null, timestamp: string) {
  database.prepare(
    `INSERT INTO job_status_history (id, job_id, from_status, to_status, reason, changed_by, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
  ).run(newId(), jobId, fromStatus, toStatus, reason, changedBy, timestamp);
}

export function insertServiceJob(input: {
  id: string;
  reference: string;
  customerId: string | null;
  customerName: string;
  phone: string;
  siteAddress: string | null;
  siteArea: string | null;
  siteLatitude: number | null;
  siteLongitude: number | null;
  category: string;
  title: string;
  description: string;
  requiredSkills: string | null;
  preferredStart: string | null;
  preferredEnd: string | null;
  urgency: string;
  estimatedMinutes: number | null;
  internalNotes: string | null;
  technicianNotes: string | null;
  acceptanceDeadline: string | null;
  createdBy: string;
}) {
  const timestamp = nowIso();
  getPortalDatabase().prepare(
    `INSERT INTO service_jobs
     (id, reference, customer_id, customer_name, phone, site_address, site_area, site_latitude, site_longitude,
      category, title, description, required_skills, preferred_start, preferred_end, urgency, estimated_minutes,
      internal_notes, technician_notes, acceptance_deadline, status, created_by, created_at, updated_at)
     VALUES (@id, @reference, @customerId, @customerName, @phone, @siteAddress, @siteArea, @siteLatitude, @siteLongitude,
      @category, @title, @description, @requiredSkills, @preferredStart, @preferredEnd, @urgency, @estimatedMinutes,
      @internalNotes, @technicianNotes, @acceptanceDeadline, 'draft', @createdBy, @createdAt, @updatedAt)`,
  ).run({ ...input, createdAt: timestamp, updatedAt: timestamp });
  addJobStatusHistory(getPortalDatabase(), input.id, null, "draft", input.createdBy, "Job created", timestamp);
}

export function broadcastServiceJob(jobId: string, actorId: string, acceptanceDeadline: string | null) {
  const database = getPortalDatabase();
  const timestamp = nowIso();
  database.exec("BEGIN IMMEDIATE");
  try {
    const job = database.prepare("SELECT id, reference, title, status FROM service_jobs WHERE id = ? LIMIT 1").get(jobId) as { id: string; reference: string; title: string; status: string } | undefined;
    if (!job) throw new Error("That job no longer exists.");
    if (job.status !== "draft" && job.status !== "reassignment-required") throw new Error("Only draft or reassignment jobs can be broadcast.");
    database.prepare("UPDATE service_jobs SET status = 'open', acceptance_deadline = ?, updated_at = ? WHERE id = ?").run(acceptanceDeadline, timestamp, jobId);
    database.prepare("INSERT INTO job_broadcasts (id, job_id, broadcasted_by, acceptance_deadline, created_at) VALUES (?, ?, ?, ?, ?)").run(newId(), jobId, actorId, acceptanceDeadline, timestamp);
    const technicians = database.prepare("SELECT id FROM users WHERE role = 'technician' AND is_active = 1").all() as Array<{ id: string }>;
    if (technicians.length === 0) throw new Error("NO_ACTIVE_TECHNICIANS");
    const recipient = database.prepare(
      `INSERT INTO job_recipients (id, job_id, technician_id, response_status, notified_at)
       VALUES (?, ?, ?, 'pending', ?)
       ON CONFLICT(job_id, technician_id) DO UPDATE SET response_status = 'pending', notified_at = excluded.notified_at`,
    );
    const notification = database.prepare("INSERT INTO notifications (id, user_id, type, title, message, entity_type, entity_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
    for (const technician of technicians) {
      recipient.run(newId(), jobId, technician.id, timestamp);
      notification.run(newId(), technician.id, "job-broadcast", "New technician job", `${job.reference}: ${job.title} is open for acceptance.`, "service-job", jobId, timestamp);
    }
    addJobStatusHistory(database, jobId, job.status, "open", actorId, "Broadcast to active technicians", timestamp);
    database.exec("COMMIT");
  } catch (error) {
    database.exec("ROLLBACK");
    throw error;
  }
}

export function respondToServiceJob(input: { jobId: string; technicianId: string; status: "accepted" | "declined"; reason: string | null }) {
  const database = getPortalDatabase();
  const timestamp = nowIso();
  database.exec("BEGIN IMMEDIATE");
  try {
    const job = database.prepare("SELECT id, reference, title, status, acceptance_deadline, assigned_technician_id FROM service_jobs WHERE id = ? LIMIT 1").get(input.jobId) as { id: string; reference: string; title: string; status: string; acceptance_deadline: string | null; assigned_technician_id: string | null } | undefined;
    const recipient = database.prepare("SELECT id, response_status FROM job_recipients WHERE job_id = ? AND technician_id = ? LIMIT 1").get(input.jobId, input.technicianId) as { id: string; response_status: string } | undefined;
    if (!job || !recipient) throw new Error("JOB_NOT_AVAILABLE");
    if (input.status === "declined") {
      if (recipient.response_status !== "pending") throw new Error("JOB_ALREADY_RESPONDED");
      database.prepare("UPDATE job_recipients SET response_status = 'declined' WHERE job_id = ? AND technician_id = ?").run(input.jobId, input.technicianId);
      database.prepare("INSERT INTO job_responses (id, job_id, technician_id, status, reason, responded_at) VALUES (?, ?, ?, 'declined', ?, ?)").run(newId(), input.jobId, input.technicianId, input.reason, timestamp);
      database.exec("COMMIT");
      return { accepted: false };
    }
    if (recipient.response_status !== "pending") throw new Error("JOB_ALREADY_RESPONDED");
    if (job.status !== "open" || (job.acceptance_deadline && job.acceptance_deadline <= timestamp)) throw new Error("JOB_ALREADY_TAKEN");
    const update = database.prepare("UPDATE service_jobs SET status = 'assigned', assigned_technician_id = ?, updated_at = ? WHERE id = ? AND status = 'open' AND (acceptance_deadline IS NULL OR acceptance_deadline > ?)").run(input.technicianId, timestamp, input.jobId, timestamp) as { changes: number };
    if (Number(update.changes) !== 1) throw new Error("JOB_ALREADY_TAKEN");
    database.prepare("UPDATE job_recipients SET response_status = 'accepted' WHERE job_id = ? AND technician_id = ?").run(input.jobId, input.technicianId);
    database.prepare("UPDATE job_recipients SET response_status = 'declined' WHERE job_id = ? AND technician_id <> ? AND response_status = 'pending'").run(input.jobId, input.technicianId);
    database.prepare("INSERT INTO job_responses (id, job_id, technician_id, status, reason, responded_at) VALUES (?, ?, ?, 'accepted', ?, ?)").run(newId(), input.jobId, input.technicianId, input.reason, timestamp);
    database.prepare("UPDATE job_broadcasts SET closed_at = ? WHERE job_id = ? AND closed_at IS NULL").run(timestamp, input.jobId);
    database.prepare("UPDATE job_assignments SET unassigned_at = ? WHERE job_id = ? AND unassigned_at IS NULL").run(timestamp, input.jobId);
    database.prepare("INSERT INTO job_assignments (id, job_id, technician_id, assignment_type, assigned_by, reason, assigned_at) VALUES (?, ?, ?, 'claim', ?, ?, ?)").run(newId(), input.jobId, input.technicianId, input.technicianId, "First valid acceptance", timestamp);
    addJobStatusHistory(database, input.jobId, "open", "assigned", input.technicianId, "Accepted by technician", timestamp);
    const others = database.prepare("SELECT technician_id FROM job_recipients WHERE job_id = ? AND technician_id <> ?").all(input.jobId, input.technicianId) as Array<{ technician_id: string }>;
    const notification = database.prepare("INSERT INTO notifications (id, user_id, type, title, message, entity_type, entity_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
    for (const other of others) notification.run(newId(), other.technician_id, "job-taken", "Job already taken", `${job.reference} was accepted by another technician.`, "service-job", input.jobId, timestamp);
    database.exec("COMMIT");
    return { accepted: true };
  } catch (error) {
    database.exec("ROLLBACK");
    throw error;
  }
}

export function assignServiceJob(input: { jobId: string; technicianId: string; actorId: string; reason: string | null }) {
  const database = getPortalDatabase();
  const timestamp = nowIso();
  database.exec("BEGIN IMMEDIATE");
  try {
    const job = database.prepare("SELECT status, assigned_technician_id, reference, title FROM service_jobs WHERE id = ? LIMIT 1").get(input.jobId) as { status: string; assigned_technician_id: string | null; reference: string; title: string } | undefined;
    if (!job) throw new Error("That job no longer exists.");
    if (["completed", "cancelled", "expired"].includes(job.status)) throw new Error("JOB_NOT_ASSIGNABLE");
    database.prepare("UPDATE job_assignments SET unassigned_at = ? WHERE job_id = ? AND unassigned_at IS NULL").run(timestamp, input.jobId);
    database.prepare("UPDATE service_jobs SET status = 'assigned', assigned_technician_id = ?, updated_at = ? WHERE id = ?").run(input.technicianId, timestamp, input.jobId);
    database.prepare("UPDATE job_broadcasts SET closed_at = ? WHERE job_id = ? AND closed_at IS NULL").run(timestamp, input.jobId);
    database.prepare("UPDATE job_recipients SET response_status = 'declined' WHERE job_id = ? AND response_status = 'pending'").run(input.jobId);
    database.prepare("INSERT INTO job_assignments (id, job_id, technician_id, assignment_type, assigned_by, reason, assigned_at) VALUES (?, ?, ?, ?, ?, ?, ?)").run(newId(), input.jobId, input.technicianId, job.assigned_technician_id ? "reassignment" : "manual", input.actorId, input.reason, timestamp);
    addJobStatusHistory(database, input.jobId, job.status, "assigned", input.actorId, input.reason ?? "Manual assignment", timestamp);
    createNotification({ userId: input.technicianId, type: "job-assigned", title: "Job assigned", message: "A service job has been assigned to you.", entityType: "service-job", entityId: input.jobId });
    database.exec("COMMIT");
  } catch (error) {
    database.exec("ROLLBACK");
    throw error;
  }
}

export function updateServiceJobStatus(input: { jobId: string; status: string; actorId: string; reason: string | null }) {
  const database = getPortalDatabase();
  const timestamp = nowIso();
  database.exec("BEGIN IMMEDIATE");
  try {
    const job = database.prepare("SELECT status, assigned_technician_id FROM service_jobs WHERE id = ? LIMIT 1").get(input.jobId) as { status: string; assigned_technician_id: string | null } | undefined;
    if (!job) throw new Error("That job no longer exists.");
    const allowedTransitions: Record<string, string[]> = {
      draft: ["cancelled"],
      open: ["expired", "cancelled", "reassignment-required"],
      assigned: ["in-progress", "reassignment-required", "cancelled"],
      "in-progress": ["reassignment-required", "cancelled"],
      "awaiting-verification": ["in-progress", "reassignment-required", "cancelled"],
      "reassignment-required": ["cancelled"],
      completed: [],
      cancelled: [],
      expired: [],
    };
    if (!allowedTransitions[job.status]?.includes(input.status)) throw new Error("INVALID_JOB_TRANSITION");
    if (["assigned", "in-progress", "awaiting-verification"].includes(input.status) && !job.assigned_technician_id) throw new Error("JOB_REQUIRES_TECHNICIAN");
    database.prepare("UPDATE service_jobs SET status = ?, updated_at = ? WHERE id = ?").run(input.status, timestamp, input.jobId);
    addJobStatusHistory(database, input.jobId, job.status, input.status, input.actorId, input.reason, timestamp);
    database.exec("COMMIT");
  } catch (error) {
    database.exec("ROLLBACK");
    throw error;
  }
}

export function submitJobCompletion(input: { jobId: string; technicianId: string; summary: string; workNotes: string | null; materials: string | null; cameraCount: number | null }) {
  const database = getPortalDatabase();
  const timestamp = nowIso();
  database.exec("BEGIN IMMEDIATE");
  try {
    const job = database.prepare("SELECT status, assigned_technician_id, reference, title, category FROM service_jobs WHERE id = ? LIMIT 1").get(input.jobId) as { status: string; assigned_technician_id: string | null; reference: string; title: string; category: string } | undefined;
    if (!job || job.assigned_technician_id !== input.technicianId) throw new Error("Only the assigned technician can submit completion.");
    if (job.category === "cctv-installation" && (!input.cameraCount || input.cameraCount < 1)) throw new Error("Enter the number of cameras completed for this customer.");
    database.prepare("INSERT INTO job_completion_submissions (id, job_id, submitted_by, summary, work_notes, materials, camera_count, status, submitted_at) VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', ?)").run(newId(), input.jobId, input.technicianId, input.summary, input.workNotes, input.materials, input.cameraCount, timestamp);
    database.prepare("UPDATE service_jobs SET status = 'awaiting-verification', updated_at = ? WHERE id = ?").run(timestamp, input.jobId);
    addJobStatusHistory(database, input.jobId, job.status, "awaiting-verification", input.technicianId, "Completion submitted", timestamp);
    const owners = database.prepare("SELECT id FROM users WHERE role = 'owner' AND is_active = 1").all() as Array<{ id: string }>;
    const notification = database.prepare("INSERT INTO notifications (id, user_id, type, title, message, entity_type, entity_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
    for (const owner of owners) notification.run(newId(), owner.id, "job-completion-submitted", "Job completion needs review", `${job.reference}: ${job.title} has been submitted for verification.`, "service-job", input.jobId, timestamp);
    database.exec("COMMIT");
  } catch (error) {
    database.exec("ROLLBACK");
    throw error;
  }
}

export function verifyJobCompletion(input: { jobId: string; reviewerId: string; approve: boolean; reason: string | null }) {
  const database = getPortalDatabase();
  const timestamp = nowIso();
  database.exec("BEGIN IMMEDIATE");
  try {
    const job = database.prepare("SELECT status, assigned_technician_id, reference, title, category FROM service_jobs WHERE id = ? LIMIT 1").get(input.jobId) as { status: string; assigned_technician_id: string | null; reference: string; title: string; category: string } | undefined;
    const submission = database.prepare("SELECT id, camera_count FROM job_completion_submissions WHERE job_id = ? AND status = 'pending' ORDER BY submitted_at DESC LIMIT 1").get(input.jobId) as { id: string; camera_count: number | null } | undefined;
    if (!job || !submission || !job.assigned_technician_id) throw new Error("No pending completion was found for this job.");
    if (input.approve) {
      database.prepare("UPDATE job_completion_submissions SET status = 'approved', verified_by = ?, verified_at = ? WHERE id = ?").run(input.reviewerId, timestamp, submission.id);
      database.prepare("UPDATE service_jobs SET status = 'completed', verified_by = ?, updated_at = ? WHERE id = ?").run(input.reviewerId, timestamp, input.jobId);
      addJobStatusHistory(database, input.jobId, job.status, "completed", input.reviewerId, "Completion verified", timestamp);
      const rule = database.prepare("SELECT id, name, points FROM point_rules WHERE type = 'verified-completion' AND enabled = 1 ORDER BY created_at ASC LIMIT 1").get() as { id: string; name: string; points: number } | undefined;
      if (rule) {
        const cameraCount = job.category === "cctv-installation" ? Number(submission.camera_count ?? 0) : 0;
        const awardedPoints = cameraCount * rule.points;
        if (awardedPoints > 0) {
          database.prepare(
            `INSERT OR IGNORE INTO point_transactions (id, technician_id, type, points, job_id, rule_id, idempotency_key, reason, actor_id, created_at)
             VALUES (?, ?, 'job-reward', ?, ?, ?, ?, ?, ?, ?)`,
          ).run(newId(), job.assigned_technician_id, awardedPoints, input.jobId, rule.id, `job:${input.jobId}:rule:${rule.id}`, `${rule.name}: ${cameraCount} camera(s) × ${rule.points} points`, input.reviewerId, timestamp);
        }
      }
      database.prepare("INSERT INTO notifications (id, user_id, type, title, message, entity_type, entity_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)").run(newId(), job.assigned_technician_id, "job-completed", "Job verified", `${job.reference} was verified and your SS Points ledger was updated.`, "service-job", input.jobId, timestamp);
    } else {
      database.prepare("UPDATE job_completion_submissions SET status = 'returned', return_reason = ?, verified_by = ?, verified_at = ? WHERE id = ?").run(input.reason, input.reviewerId, timestamp, submission.id);
      database.prepare("UPDATE service_jobs SET status = 'in-progress', updated_at = ? WHERE id = ?").run(timestamp, input.jobId);
      addJobStatusHistory(database, input.jobId, job.status, "in-progress", input.reviewerId, input.reason ?? "Completion returned for more work", timestamp);
      database.prepare("INSERT INTO notifications (id, user_id, type, title, message, entity_type, entity_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)").run(newId(), job.assigned_technician_id, "job-completion-returned", "Completion needs correction", `${job.reference} was returned for more work.`, "service-job", input.jobId, timestamp);
    }
    database.exec("COMMIT");
  } catch (error) {
    database.exec("ROLLBACK");
    throw error;
  }
}

export function insertPointRule(input: { id: string; name: string; type: string; points: number; category: string | null; sampleLabel: string | null; actorId: string }) {
  const timestamp = nowIso();
  getPortalDatabase().prepare(
    `INSERT INTO point_rules (id, name, type, points, category, enabled, sample_label, created_by, updated_by, created_at, updated_at)
     VALUES (@id, @name, @type, @points, @category, 1, @sampleLabel, @actorId, @actorId, @createdAt, @updatedAt)`,
  ).run({ ...input, createdAt: timestamp, updatedAt: timestamp });
}

export function updatePointRule(input: { id: string; name: string; type: string; points: number; category: string | null; enabled: boolean; sampleLabel: string | null; actorId: string }) {
  getPortalDatabase().prepare(
    `UPDATE point_rules SET name = @name, type = @type, points = @points, category = @category, enabled = @enabled, sample_label = @sampleLabel, updated_by = @actorId, updated_at = @updatedAt WHERE id = @id`,
  ).run({ ...input, enabled: input.enabled ? 1 : 0, updatedAt: nowIso() });
}

export function applyPointAdjustment(input: { id: string; technicianId: string; points: number; reason: string; actorId: string }) {
  getPortalDatabase().prepare(
    `INSERT INTO point_transactions (id, technician_id, type, points, idempotency_key, reason, actor_id, created_at)
     VALUES (?, ?, 'admin-adjustment', ?, ?, ?, ?, ?)`,
  ).run(input.id, input.technicianId, input.points, `adjustment:${input.id}`, input.reason, input.actorId, nowIso());
}

export function insertRewardItem(input: { id: string; productId: string | null; name: string; description: string | null; category: string; imagePath: string | null; pointsCost: number; stockQuantity: number; actorId: string }) {
  const timestamp = nowIso();
  getPortalDatabase().prepare(
    `INSERT INTO reward_items (id, product_id, name, description, category, image_path, points_cost, stock_quantity, active, created_by, updated_by, created_at, updated_at)
     VALUES (@id, @productId, @name, @description, @category, @imagePath, @pointsCost, @stockQuantity, 1, @actorId, @actorId, @createdAt, @updatedAt)`,
  ).run({ ...input, createdAt: timestamp, updatedAt: timestamp });
}

export function updateRewardItem(input: { id: string; productId: string | null; name: string; description: string | null; category: string; imagePath: string | null; pointsCost: number; stockQuantity: number; active: boolean; actorId: string }) {
  getPortalDatabase().prepare(
    `UPDATE reward_items SET product_id = @productId, name = @name, description = @description, category = @category, image_path = @imagePath, points_cost = @pointsCost, stock_quantity = @stockQuantity, active = @active, updated_by = @actorId, updated_at = @updatedAt WHERE id = @id`,
  ).run({ ...input, active: input.active ? 1 : 0, updatedAt: nowIso() });
}

export function requestRedemption(input: { id: string; reference: string; technicianId: string; rewardId: string; rewardName: string; pointsCost: number; quantity: number; notes: string | null }) {
  const database = getPortalDatabase();
  const timestamp = nowIso();
  database.exec("BEGIN IMMEDIATE");
  try {
    const reward = database.prepare("SELECT id, active, stock_quantity, points_cost, name FROM reward_items WHERE id = ? LIMIT 1").get(input.rewardId) as { id: string; active: number; stock_quantity: number; points_cost: number; name: string } | undefined;
    const balance = database.prepare("SELECT COALESCE(SUM(points), 0) AS balance FROM point_transactions WHERE technician_id = ?").get(input.technicianId) as { balance: number };
    if (!reward || reward.active !== 1) throw new Error("That reward is no longer available.");
    if (reward.stock_quantity < input.quantity) throw new Error("There is not enough reward stock available.");
    const requiredPoints = reward.points_cost * input.quantity;
    if (Number(balance.balance) < requiredPoints) throw new Error("You do not have enough SS Points for this request.");
    database.prepare(
      `INSERT INTO redemption_requests (id, reference, technician_id, reward_id, reward_name_snapshot, points_cost_snapshot, quantity, status, notes, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'pending-approval', ?, ?, ?)`,
    ).run(input.id, input.reference, input.technicianId, input.rewardId, reward.name, reward.points_cost, input.quantity, input.notes, timestamp, timestamp);
    database.prepare("INSERT INTO redemption_status_history (id, redemption_id, from_status, to_status, reason, changed_by, created_at) VALUES (?, ?, ?, 'pending-approval', ?, ?, ?)").run(newId(), input.id, null, "Requested by technician", input.technicianId, timestamp);
    const owners = database.prepare("SELECT id FROM users WHERE role = 'owner' AND is_active = 1").all() as Array<{ id: string }>;
    const notification = database.prepare("INSERT INTO notifications (id, user_id, type, title, message, entity_type, entity_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
    for (const owner of owners) notification.run(newId(), owner.id, "redemption-requested", "Reward redemption requested", `${input.reference} needs approval.`, "redemption", input.id, timestamp);
    database.exec("COMMIT");
  } catch (error) {
    database.exec("ROLLBACK");
    throw error;
  }
}

export function approveRedemption(input: { redemptionId: string; actorId: string; approve: boolean; reason: string | null }) {
  const database = getPortalDatabase();
  const timestamp = nowIso();
  database.exec("BEGIN IMMEDIATE");
  try {
    const redemption = database.prepare("SELECT id, reference, technician_id, reward_id, points_cost_snapshot, quantity, status FROM redemption_requests WHERE id = ? LIMIT 1").get(input.redemptionId) as { id: string; reference: string; technician_id: string; reward_id: string; points_cost_snapshot: number; quantity: number; status: string } | undefined;
    if (!redemption || redemption.status !== "pending-approval") throw new Error("That redemption is no longer pending approval.");
    if (!input.approve) {
      database.prepare("UPDATE redemption_requests SET status = 'rejected', approved_by = ?, approved_at = ?, updated_at = ? WHERE id = ?").run(input.actorId, timestamp, timestamp, input.redemptionId);
      database.prepare("INSERT INTO redemption_status_history (id, redemption_id, from_status, to_status, reason, changed_by, created_at) VALUES (?, ?, ?, 'rejected', ?, ?, ?)").run(newId(), input.redemptionId, redemption.status, input.reason, input.actorId, timestamp);
      database.exec("COMMIT");
      return;
    }
    const reward = database.prepare("SELECT stock_quantity, active FROM reward_items WHERE id = ? LIMIT 1").get(redemption.reward_id) as { stock_quantity: number; active: number } | undefined;
    const balance = database.prepare("SELECT COALESCE(SUM(points), 0) AS balance FROM point_transactions WHERE technician_id = ?").get(redemption.technician_id) as { balance: number };
    const required = redemption.points_cost_snapshot * redemption.quantity;
    if (!reward || reward.active !== 1 || reward.stock_quantity < redemption.quantity) throw new Error("Reward stock is no longer sufficient.");
    if (Number(balance.balance) < required) throw new Error("The technician no longer has enough SS Points.");
    const stockUpdate = database.prepare("UPDATE reward_items SET stock_quantity = stock_quantity - ?, updated_at = ? WHERE id = ? AND stock_quantity >= ?").run(redemption.quantity, timestamp, redemption.reward_id, redemption.quantity) as { changes: number };
    if (Number(stockUpdate.changes) !== 1) throw new Error("Reward stock is no longer sufficient.");
    database.prepare("UPDATE redemption_requests SET status = 'approved', approved_by = ?, approved_at = ?, updated_at = ? WHERE id = ?").run(input.actorId, timestamp, timestamp, input.redemptionId);
    database.prepare("INSERT OR IGNORE INTO point_transactions (id, technician_id, type, points, redemption_id, idempotency_key, reason, actor_id, created_at) VALUES (?, ?, 'redemption', ?, ?, ?, ?, ?, ?)").run(newId(), redemption.technician_id, -required, redemption.id, `redemption:${redemption.id}`, `Reward redemption ${redemption.reference}`, input.actorId, timestamp);
    database.prepare("INSERT INTO redemption_status_history (id, redemption_id, from_status, to_status, reason, changed_by, created_at) VALUES (?, ?, ?, 'approved', ?, ?, ?)").run(newId(), input.redemptionId, redemption.status, input.reason, input.actorId, timestamp);
    database.prepare("INSERT INTO notifications (id, user_id, type, title, message, entity_type, entity_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)").run(newId(), redemption.technician_id, "redemption-approved", "Reward redemption approved", `${redemption.reference} was approved.`, "redemption", input.redemptionId, timestamp);
    database.exec("COMMIT");
  } catch (error) {
    database.exec("ROLLBACK");
    throw error;
  }
}

export function updateRedemptionStatus(input: { redemptionId: string; status: "ready" | "collected" | "cancelled"; actorId: string; reason: string | null }) {
  const database = getPortalDatabase();
  const timestamp = nowIso();
  database.exec("BEGIN IMMEDIATE");
  try {
    const current = database.prepare("SELECT status, technician_id FROM redemption_requests WHERE id = ? LIMIT 1").get(input.redemptionId) as { status: string; technician_id: string } | undefined;
    if (!current) throw new Error("That redemption no longer exists.");
    const collectedAt = input.status === "collected" ? timestamp : null;
    database.prepare("UPDATE redemption_requests SET status = ?, collected_at = COALESCE(?, collected_at), updated_at = ? WHERE id = ?").run(input.status, collectedAt, timestamp, input.redemptionId);
    database.prepare("INSERT INTO redemption_status_history (id, redemption_id, from_status, to_status, reason, changed_by, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)").run(newId(), input.redemptionId, current.status, input.status, input.reason, input.actorId, timestamp);
    if (input.status === "ready" || input.status === "collected") database.prepare("INSERT INTO notifications (id, user_id, type, title, message, entity_type, entity_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)").run(newId(), current.technician_id, "redemption-status", "Reward redemption updated", `Your redemption is ${input.status}.`, "redemption", input.redemptionId, timestamp);
    database.exec("COMMIT");
  } catch (error) {
    database.exec("ROLLBACK");
    throw error;
  }
}
