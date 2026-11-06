"use server";

import bcrypt from "bcryptjs";
import fs from "node:fs/promises";
import path from "node:path";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  countUsers,
  createInvite,
  createNotification,
  createSupportAccessToken,
  createToken,
  createUser,
  findCustomerByPhone,
  getInvite,
  getPortalDatabase,
  getUserByEmail,
  hashToken,
  insertCustomer,
  insertEnquiry,
  insertInstallationItem,
  insertJobAttachment,
  insertPayment,
  insertPaymentAdjustment,
  applyProductImport,
  applyPointAdjustment,
  approveRedemption,
  assignServiceJob,
  broadcastServiceJob,
  insertProduct,
  insertPointRule,
  insertRewardItem,
  insertServiceJob,
  insertProject,
  insertQuotation,
  insertSiteSurvey,
  insertScheduleEvent,
  insertServiceTicket,
  insertCustomerTicketAttachment,
  insertTicketAttachment,
  markNotificationRead,
  markInviteUsed,
  newId,
  nextReference,
  normalizeEmail,
  nowIso,
  recordActivity,
  updateCustomer,
  updateEnquiry,
  updateProject,
  updateProduct,
  updatePointRule,
  updateRedemptionStatus,
  updateRewardItem,
  updateServiceJobStatus,
  updateScheduleEventStatus,
  updateScheduleEvent,
  updateServiceTicket,
  updateUserPhone,
  updateUserRole,
  requestRedemption,
  respondToServiceJob,
  submitJobCompletion,
  verifyJobCompletion,
} from "@/lib/portal/db";
import { getDefaultQuotationValidityDays, getDefaultWarrantyMonths, getPortalToday, getPortalVatRate, normalizePortalPhone } from "@/lib/portal/config";
import { endPortalSession, requirePortalUser, startPortalSession } from "@/lib/portal/auth";
import { sendPortalEmail } from "@/lib/portal/notifications";
import type { ProductImportRow } from "@/lib/portal/product-csv";
import {
  customerTypes,
  enquirySources,
  enquiryTypes,
  paymentMethods,
  paymentAdjustmentTypes,
  productAvailabilities,
  productPriceDisplayModes,
  productPriceTypes,
  productPublicationStatuses,
  jobCategories,
  jobStatuses,
  jobUrgencies,
  pointRuleTypes,
  portalRoles,
  projectStatuses,
  quotationStatuses,
  scheduleEventStatuses,
  scheduleEventTypes,
  ticketCategories,
  ticketPriorities,
  ticketStatuses,
  portalRoleLabels,
} from "@/lib/portal/types";

export interface ActionState {
  error?: string;
  success?: string;
  inviteUrl?: string;
}

function text(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function optionalText(formData: FormData, key: string) {
  const value = text(formData, key);
  return value || null;
}

function safeError(error: unknown, fallback: string) {
  if (error instanceof z.ZodError) {
    return error.issues[0]?.message ?? fallback;
  }

  if (error instanceof Error && error.message.includes("UNIQUE constraint failed")) {
    return "A record with that value already exists.";
  }

  const publicMessages = [
    "JOB_ALREADY_TAKEN",
    "JOB_NOT_AVAILABLE",
    "JOB_ALREADY_RESPONDED",
    "NO_ACTIVE_TECHNICIANS",
    "JOB_NOT_ASSIGNABLE",
    "INVALID_JOB_TRANSITION",
    "JOB_REQUIRES_TECHNICIAN",
    "That job no longer exists.",
    "Only draft or reassignment jobs can be broadcast.",
    "That job is not assigned to you.",
    "Only an assigned technician can submit completion.",
    "Enter the number of cameras completed for this customer.",
    "That completion is no longer pending verification.",
    "That reward is no longer available.",
    "There is not enough reward stock available.",
    "You do not have enough SS Points for this request.",
    "That redemption is no longer pending approval.",
    "Reward stock is no longer sufficient.",
    "The technician no longer has enough SS Points.",
  ];
  if (error instanceof Error && publicMessages.some((message) => error.message === message)) {
    return error.message === "JOB_ALREADY_TAKEN" ? "This job has already been accepted by another technician." : error.message === "JOB_NOT_AVAILABLE" ? "This job is not available to you." : error.message;
  }

  return fallback;
}

const productSchema = z.object({
  legacyId: z.string().nullable(),
  name: z.string().min(2, "Enter a product name.").max(180),
  brand: z.string().min(1, "Enter a brand.").max(100),
  model: z.string().max(120).nullable(),
  categoryKey: z.string().min(1, "Select a category.").max(100),
  categoryName: z.string().min(1, "Enter a category name.").max(120),
  description: z.string().max(4000).nullable(),
  specifications: z.string().max(8000).nullable(),
  imagePath: z.string().max(1000).nullable(),
  imageAlt: z.string().max(240).nullable(),
  sourceUrl: z.string().url("Enter a valid source URL.").nullable(),
  sourceCategory: z.string().max(180).nullable(),
  currentPrice: z.number().nonnegative("Price cannot be negative.").nullable(),
  referencePrice: z.number().nonnegative("Reference price cannot be negative.").nullable(),
  priceDisplayMode: z.enum(productPriceDisplayModes),
  priceType: z.enum(productPriceTypes),
  availability: z.enum(productAvailabilities),
  publicationStatus: z.enum(productPublicationStatuses),
  unit: z.string().min(1, "Enter a unit.").max(40),
  warrantyMonths: z.number().int().nonnegative("Warranty cannot be negative.").nullable(),
  priceChangeReason: z.string().max(500).nullable(),
});

function parseProductForm(formData: FormData) {
  const currentPriceText = optionalText(formData, "currentPrice");
  const referencePriceText = optionalText(formData, "referencePrice");
  const warrantyMonthsText = optionalText(formData, "warrantyMonths");
  const currentPrice = currentPriceText === null ? null : Number(currentPriceText);
  const referencePrice = referencePriceText === null ? null : Number(referencePriceText);
  const warrantyMonths = warrantyMonthsText === null ? null : Number(warrantyMonthsText);

  if (currentPrice !== null && !Number.isFinite(currentPrice)) return { error: "Enter a valid current price." } as const;
  if (referencePrice !== null && !Number.isFinite(referencePrice)) return { error: "Enter a valid reference price." } as const;
  if (warrantyMonths !== null && !Number.isFinite(warrantyMonths)) return { error: "Enter a valid warranty duration." } as const;

  const input = productSchema.parse({
    legacyId: optionalText(formData, "legacyId"),
    name: text(formData, "name"),
    brand: text(formData, "brand"),
    model: optionalText(formData, "model"),
    categoryKey: text(formData, "categoryKey"),
    categoryName: text(formData, "categoryName"),
    description: optionalText(formData, "description"),
    specifications: optionalText(formData, "specifications"),
    imagePath: optionalText(formData, "imagePath"),
    imageAlt: optionalText(formData, "imageAlt"),
    sourceUrl: optionalText(formData, "sourceUrl"),
    sourceCategory: optionalText(formData, "sourceCategory"),
    currentPrice,
    referencePrice,
    priceDisplayMode: text(formData, "priceDisplayMode"),
    priceType: text(formData, "priceType"),
    availability: text(formData, "availability"),
    publicationStatus: text(formData, "publicationStatus"),
    unit: text(formData, "unit") || "piece",
    warrantyMonths,
    priceChangeReason: optionalText(formData, "priceChangeReason"),
  });

  if (input.priceDisplayMode === "show_price" && input.currentPrice === null) {
    return { error: "Enter a current price or choose contact for price." } as const;
  }

  return { input } as const;
}

function toPaisa(value: number | null) {
  return value === null ? null : Math.round(value * 100);
}

async function saveProductImage(formData: FormData) {
  const file = formData.get("imageFile");
  if (!(file instanceof File) || file.size === 0) return null;
  if (file.size > 5 * 1024 * 1024) throw new Error("Product images must be 5 MB or smaller.");
  const extensions: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/gif": "gif" };
  const extension = extensions[file.type];
  if (!extension) throw new Error("Use a JPG, PNG, WebP, or GIF product image.");
  const bytes = new Uint8Array(await file.arrayBuffer());
  const signatureMatches = extension === "jpg"
    ? bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff
    : extension === "png"
      ? bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47
      : extension === "webp"
        ? String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" && String.fromCharCode(...bytes.slice(8, 12)) === "WEBP"
        : bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46;
  if (!signatureMatches) throw new Error("The uploaded file content does not match its image type.");

  const directory = path.join(process.cwd(), "public", "product-assets-managed");
  await fs.mkdir(directory, { recursive: true });
  const storedName = `${newId()}.${extension}`;
  await fs.writeFile(path.join(directory, storedName), bytes);
  return `/product-assets-managed/${storedName}`;
}

export async function createProductAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requirePortalUser(["owner", "manager"]);

  try {
    const parsed = parseProductForm(formData);
    if ("error" in parsed) return parsed;
    const input = parsed.input;
    const database = getPortalDatabase();
    if (input.legacyId && database.prepare("SELECT id FROM products WHERE legacy_id = ? LIMIT 1").get(input.legacyId)) {
      return { error: "That product identifier already exists." };
    }
    if (input.model && database.prepare("SELECT id FROM products WHERE lower(brand) = lower(?) AND lower(model) = lower(?) LIMIT 1").get(input.brand, input.model)) {
      return { error: "A product with this brand and model already exists. Use a distinct model or edit the existing product." };
    }

    const productId = newId();
    const uploadedImagePath = await saveProductImage(formData);
    insertProduct({
      id: productId,
      legacyId: input.legacyId,
      name: input.name,
      brand: input.brand,
      model: input.model,
      categoryKey: input.categoryKey,
      categoryName: input.categoryName,
      description: input.description,
      specifications: input.specifications,
      imagePath: uploadedImagePath ?? input.imagePath,
      imageAlt: input.imageAlt ?? input.name,
      sourceUrl: input.sourceUrl,
      sourceCategory: input.sourceCategory,
      currentPricePaisa: toPaisa(input.currentPrice),
      referencePricePaisa: toPaisa(input.referencePrice),
      priceDisplayMode: input.priceDisplayMode,
      priceType: input.priceType,
      availability: input.availability,
      publicationStatus: input.publicationStatus,
      unit: input.unit,
      warrantyMonths: input.warrantyMonths,
      createdBy: user.id,
    });
    recordActivity({ entityType: "product", entityId: productId, action: "created", actorId: user.id, details: { name: input.name, publicationStatus: input.publicationStatus } });
  } catch (error) {
    return { error: safeError(error, "Unable to create the product.") };
  }

  revalidatePath("/portal/products");
  revalidatePath("/products");
  redirect("/portal/products?saved=created");
}

export async function updateProductAction(productId: string, _: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requirePortalUser(["owner", "manager"]);

  try {
    const current = getPortalDatabase().prepare(
      "SELECT id, legacy_id, name, brand, model, category_key, category_name, description, specifications, image_path, image_alt, source_url, source_category, current_price_paisa, reference_price_paisa, price_display_mode, availability, publication_status, unit, warranty_months FROM products WHERE id = ? LIMIT 1",
    ).get(productId) as Record<string, unknown> | undefined;
    if (!current) return { error: "That product no longer exists." };

    const parsed = parseProductForm(formData);
    if ("error" in parsed) return parsed;
    const input = parsed.input;
    const database = getPortalDatabase();
    if (input.legacyId && database.prepare("SELECT id FROM products WHERE legacy_id = ? AND id <> ? LIMIT 1").get(input.legacyId, productId)) {
      return { error: "That product identifier already exists." };
    }
    if (input.model && database.prepare("SELECT id FROM products WHERE lower(brand) = lower(?) AND lower(model) = lower(?) AND id <> ? LIMIT 1").get(input.brand, input.model, productId)) {
      return { error: "A product with this brand and model already exists. Use a distinct model or edit the existing product." };
    }

    const currentImagePath = (current.image_path as string | null) ?? null;
    const uploadedImagePath = await saveProductImage(formData);
    const currentPricePaisa = current.current_price_paisa === null ? null : Number(current.current_price_paisa);
    const currentReferencePricePaisa = current.reference_price_paisa === null ? null : Number(current.reference_price_paisa);
    updateProduct({
      id: productId,
      legacyId: input.legacyId,
      name: input.name,
      brand: input.brand,
      model: input.model,
      categoryKey: input.categoryKey,
      categoryName: input.categoryName,
      description: input.description,
      specifications: input.specifications,
      imagePath: uploadedImagePath ?? input.imagePath ?? currentImagePath,
      imageAlt: input.imageAlt ?? input.name,
      sourceUrl: input.sourceUrl,
      sourceCategory: input.sourceCategory,
      currentPricePaisa: toPaisa(input.currentPrice),
      referencePricePaisa: toPaisa(input.referencePrice),
      priceDisplayMode: input.priceDisplayMode,
      priceType: input.priceType,
      availability: input.availability,
      publicationStatus: input.publicationStatus,
      unit: input.unit,
      warrantyMonths: input.warrantyMonths,
      updatedBy: user.id,
      previousPricePaisa: currentPricePaisa,
      previousReferencePricePaisa: currentReferencePricePaisa,
      priceChangeReason: input.priceChangeReason,
    });
    recordActivity({ entityType: "product", entityId: productId, action: "updated", actorId: user.id, details: { name: input.name, priceChanged: currentPricePaisa !== toPaisa(input.currentPrice) || currentReferencePricePaisa !== toPaisa(input.referencePrice) } });
  } catch (error) {
    return { error: safeError(error, "Unable to update the product.") };
  }

  revalidatePath("/portal/products");
  revalidatePath(`/portal/products/${productId}`);
  revalidatePath("/products");
  redirect(`/portal/products/${productId}?saved=updated`);
}

function parseImportNumber(value: string, label: string, rowNumber: number) {
  if (!value.trim()) return null;
  const number = Number(value);
  if (!Number.isFinite(number) || number < 0) throw new Error(`Row ${rowNumber}: ${label} must be a non-negative number.`);
  return number;
}

function normalizeImportRow(raw: ProductImportRow, rowNumber: number) {
  const currentPrice = parseImportNumber(raw.current_price_npr, "current price", rowNumber);
  const referencePrice = parseImportNumber(raw.reference_price_npr, "reference price", rowNumber);
  const warrantyMonths = parseImportNumber(raw.warranty_months, "warranty months", rowNumber);
  if (!raw.name.trim() || !raw.brand.trim() || !raw.category_key.trim() || !raw.category_name.trim()) throw new Error(`Row ${rowNumber}: name, brand, category key, and category name are required.`);
  if (raw.price_display_mode === "show_price" && currentPrice === null) throw new Error(`Row ${rowNumber}: show_price requires a current price.`);
  if (!["show_price", "contact_for_price"].includes(raw.price_display_mode)) throw new Error(`Row ${rowNumber}: invalid price display mode.`);
  if (!["market", "mrp"].includes(raw.price_type)) throw new Error(`Row ${rowNumber}: invalid price type.`);
  if (!["in_stock", "out_of_stock", "unavailable", "not_tracked"].includes(raw.availability)) throw new Error(`Row ${rowNumber}: invalid availability.`);
  if (!["draft", "published", "archived"].includes(raw.publication_status)) throw new Error(`Row ${rowNumber}: invalid publication status.`);

  return {
    id: raw.id.trim() || null,
    legacyId: raw.legacy_id.trim() || null,
    name: raw.name.trim(),
    brand: raw.brand.trim(),
    model: raw.model.trim() || null,
    categoryKey: raw.category_key.trim(),
    categoryName: raw.category_name.trim(),
    description: raw.description.trim() || null,
    specifications: raw.specifications.trim() || null,
    imagePath: raw.image_path.trim() || null,
    imageAlt: raw.image_alt.trim() || raw.name.trim(),
    sourceUrl: raw.source_url.trim() || null,
    sourceCategory: raw.source_category.trim() || null,
    currentPricePaisa: toPaisa(currentPrice),
    referencePricePaisa: toPaisa(referencePrice),
    priceDisplayMode: raw.price_display_mode as "show_price" | "contact_for_price",
    priceType: raw.price_type as "market" | "mrp",
    availability: raw.availability as "in_stock" | "out_of_stock" | "unavailable" | "not_tracked",
    publicationStatus: raw.publication_status as "draft" | "published" | "archived",
    unit: raw.unit.trim() || "piece",
    warrantyMonths: warrantyMonths === null ? null : Math.round(warrantyMonths),
  };
}

export async function importProductsCsvAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requirePortalUser(["owner", "manager"]);
  if (text(formData, "confirmImport") !== "on") return { error: "Confirm the validated preview before applying the import." };

  try {
    const parsed = JSON.parse(text(formData, "rows")) as ProductImportRow[];
    if (!Array.isArray(parsed) || parsed.length === 0) return { error: "Choose a CSV file with at least one product row." };
    if (parsed.length > 5000) return { error: "A single import cannot contain more than 5,000 rows." };
    const ids = new Set<string>();
    const legacyIds = new Set<string>();
    const rows = parsed.map((row, index) => {
      const normalized = normalizeImportRow(row, index + 2);
      if (normalized.id && ids.has(normalized.id)) throw new Error(`Row ${index + 2}: duplicate product ID in this file.`);
      if (normalized.legacyId && legacyIds.has(normalized.legacyId)) throw new Error(`Row ${index + 2}: duplicate legacy ID in this file.`);
      if (normalized.id) ids.add(normalized.id);
      if (normalized.legacyId) legacyIds.add(normalized.legacyId);
      return normalized;
    });
    applyProductImport(rows, user.id);
    recordActivity({ entityType: "product-catalog", entityId: user.id, action: "csv_import", actorId: user.id, details: { rows: rows.length } });
  } catch (error) {
    return { error: safeError(error, "The product import was not applied.") };
  }

  revalidatePath("/portal/products");
  revalidatePath("/products");
  redirect("/portal/products?imported=success");
}

const loginSchema = z.object({
  email: z.string().email("Enter a valid email address."),
  password: z.string().min(1, "Enter your password."),
});

export async function loginAction(_: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const values = loginSchema.parse({ email: text(formData, "email"), password: text(formData, "password") });
    const user = getUserByEmail(values.email);

    if (!user || user.is_active !== 1 || !(await bcrypt.compare(values.password, user.password_hash))) {
      return { error: "The email or password is incorrect." };
    }

    await startPortalSession(user.id);
  } catch (error) {
    return { error: safeError(error, "Unable to sign in right now.") };
  }

  redirect("/portal/dashboard");
}

export async function logoutAction() {
  await endPortalSession();
  redirect("/portal/login");
}

export async function setupOwnerAction(_: ActionState, formData: FormData): Promise<ActionState> {
  try {
    if (countUsers() > 0) {
      return { error: "The initial owner setup has already been completed." };
    }

    const bootstrapKey = process.env.PORTAL_BOOTSTRAP_KEY?.trim();
    if (!bootstrapKey || text(formData, "bootstrapKey") !== bootstrapKey) {
      return { error: "The bootstrap key is missing or incorrect." };
    }

    const email = normalizeEmail(text(formData, "email"));
    const configuredEmail = normalizeEmail(process.env.PORTAL_BOOTSTRAP_EMAIL ?? "suvashshah251@gmail.com");
    const name = text(formData, "name");
    const phone = text(formData, "phone");
    const password = text(formData, "password");

    z.object({
      email: z.string().email("Enter a valid email address."),
      name: z.string().min(2, "Enter the owner name."),
      phone: z.string().min(7, "Enter a valid owner phone number."),
      password: z.string().min(12, "Use at least 12 characters for the password."),
    }).parse({ email, name, phone, password });

    if (email !== configuredEmail) {
      return { error: `Use the configured owner email: ${configuredEmail}` };
    }

    const userId = createUser({
      email,
      name,
      phone,
      role: "owner",
      passwordHash: await bcrypt.hash(password, 12),
    });
    recordActivity({ entityType: "user", entityId: userId, action: "created_initial_owner", actorId: userId });
  } catch (error) {
    return { error: safeError(error, "Unable to create the initial owner account.") };
  }

  redirect("/portal/login?setup=complete");
}

const inviteSchema = z.object({
  email: z.string().email("Enter a valid email address."),
  name: z.string().min(2, "Enter the person’s name."),
  phone: z.union([z.string().min(7, "Enter a valid phone number."), z.literal("")]).transform((value) => value || null),
  role: z.enum(portalRoles),
});

export async function createInviteAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const owner = await requirePortalUser(["owner"]);

  try {
    const input = inviteSchema.parse({
      email: text(formData, "email"),
      name: text(formData, "name"),
      phone: text(formData, "phone"),
      role: text(formData, "role"),
    });
    const email = normalizeEmail(input.email);

    if (getUserByEmail(email)) {
      return { error: "An account with that email already exists." };
    }

    const rawToken = createToken();
    const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();
    createInvite({
      tokenHash: hashToken(rawToken),
      email,
      name: input.name,
      phone: input.phone,
      role: input.role,
      invitedBy: owner.id,
      expiresAt,
    });

    return {
      success: "Invite created. Share this one-time link securely.",
      inviteUrl: `/portal/invite/${rawToken}`,
    };
  } catch (error) {
    return { error: safeError(error, "Unable to create the invite.") };
  }
}

export async function updatePortalUserRoleAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const owner = await requirePortalUser(["owner"]);

  try {
    const userId = text(formData, "userId");
    const role = z.enum(portalRoles).parse(text(formData, "role"));
    const target = getPortalDatabase().prepare("SELECT id, name, email, role, is_active FROM users WHERE id = ? LIMIT 1").get(userId) as { id: string; name: string; email: string; role: typeof role; is_active: number } | undefined;
    if (!target) return { error: "That team member no longer exists." };
    if (target.id === owner.id) return { error: "You cannot change your own role from this screen." };
    if (target.role === "owner" && role !== "owner") {
      const activeOwners = getPortalDatabase().prepare("SELECT COUNT(*) AS count FROM users WHERE role = 'owner' AND is_active = 1").get() as { count: number };
      if (Number(activeOwners.count) <= 1) return { error: "Keep at least one active owner before changing this role." };
    }

    updateUserRole(target.id, role);
    recordActivity({ entityType: "user", entityId: target.id, action: "role_updated", actorId: owner.id, details: { from: target.role, to: role } });
    revalidatePath("/portal/team");
    return { success: `${target.name} is now a ${portalRoleLabels[role]}.` };
  } catch (error) {
    return { error: safeError(error, "Unable to update that account role.") };
  }
}

const passwordSchema = z.string().min(12, "Use at least 12 characters for the password.");

export async function acceptInviteAction(token: string, _: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const invite = getInvite(hashToken(token));
    if (!invite || invite.used_at || invite.expires_at <= nowIso()) {
      return { error: "This invite is invalid or has expired." };
    }

    const password = passwordSchema.parse(text(formData, "password"));
    const userId = createUser({
      email: invite.email,
      name: invite.name,
      phone: invite.phone,
      role: invite.role,
      passwordHash: await bcrypt.hash(password, 12),
    });
    markInviteUsed(invite.token_hash);
    recordActivity({ entityType: "user", entityId: userId, action: "accepted_invite", actorId: userId });
  } catch (error) {
    return { error: safeError(error, "Unable to activate this account.") };
  }

  redirect("/portal/login?invite=accepted");
}

const profileSchema = z.object({
  phone: z.union([z.string().min(7, "Enter a valid phone number."), z.literal("")]).transform((value) => value || null),
});

export async function updatePortalProfileAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requirePortalUser();

  try {
    const input = profileSchema.parse({ phone: text(formData, "phone") });
    updateUserPhone(user.id, input.phone);
    recordActivity({ entityType: "user", entityId: user.id, action: "contact_phone_updated", actorId: user.id });
  } catch (error) {
    return { error: safeError(error, "Unable to update your contact number.") };
  }

  revalidatePath("/portal/dashboard");
  revalidatePath("/portal/team");
  redirect("/portal/dashboard?saved=profile");
}

const customerSchema = z.object({
  name: z.string().min(2, "Enter the customer name."),
  businessName: z.string().nullable(),
  customerType: z.enum(customerTypes),
  phonePrimary: z.string().min(7, "Enter a valid primary phone number."),
  phoneSecondary: z.string().nullable(),
  email: z.union([z.string().email("Enter a valid email address."), z.literal("")]).transform((value) => value || null),
  address: z.string().nullable(),
  area: z.string().nullable(),
  notes: z.string().nullable(),
});

export async function createCustomerAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requirePortalUser(["owner", "manager", "staff"]);

  try {
    const input = customerSchema.parse({
      name: text(formData, "name"),
      businessName: optionalText(formData, "businessName"),
      customerType: text(formData, "customerType"),
      phonePrimary: text(formData, "phonePrimary"),
      phoneSecondary: optionalText(formData, "phoneSecondary"),
      email: text(formData, "email"),
      address: optionalText(formData, "address"),
      area: optionalText(formData, "area"),
      notes: optionalText(formData, "notes"),
    });

    const duplicate = findCustomerByPhone(input.phonePrimary);
    if (duplicate) {
      return { error: `A customer with this phone number already exists: ${duplicate.name}.` };
    }

    const customerId = newId();
    insertCustomer({ id: customerId, ...input, createdBy: user.id });
    recordActivity({ entityType: "customer", entityId: customerId, action: "created", actorId: user.id });
  } catch (error) {
    return { error: safeError(error, "Unable to save the customer.") };
  }

  revalidatePath("/portal/customers");
  redirect("/portal/customers?saved=customer");
}

export async function updateCustomerAction(customerId: string, _: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requirePortalUser(["owner", "manager", "staff"]);

  try {
    const input = customerSchema.parse({
      name: text(formData, "name"),
      businessName: optionalText(formData, "businessName"),
      customerType: text(formData, "customerType"),
      phonePrimary: text(formData, "phonePrimary"),
      phoneSecondary: optionalText(formData, "phoneSecondary"),
      email: text(formData, "email"),
      address: optionalText(formData, "address"),
      area: optionalText(formData, "area"),
      notes: optionalText(formData, "notes"),
    });

    const existing = getPortalDatabase().prepare("SELECT id FROM customers WHERE id = ? LIMIT 1").get(customerId) as { id: string } | undefined;
    if (!existing) return { error: "That customer record no longer exists." };

    const duplicate = findCustomerByPhone(input.phonePrimary);
    if (duplicate && duplicate.id !== customerId) {
      return { error: `A customer with this phone number already exists: ${duplicate.name}.` };
    }

    updateCustomer({ id: customerId, ...input });
    recordActivity({ entityType: "customer", entityId: customerId, action: "updated", actorId: user.id });
  } catch (error) {
    return { error: safeError(error, "Unable to update the customer.") };
  }

  revalidatePath("/portal/customers");
  revalidatePath(`/portal/customers/${customerId}`);
  redirect(`/portal/customers/${customerId}?saved=customer`);
}

const enquirySchema = z.object({
  customerId: z.string().nullable(),
  customerName: z.string().min(2, "Enter the customer name."),
  phonePrimary: z.string().min(7, "Enter a valid phone number."),
  type: z.enum(enquiryTypes),
  source: z.enum(enquirySources),
  area: z.string().nullable(),
  notes: z.string().nullable(),
  followUpAt: z.string().nullable(),
  assignedTo: z.string().nullable(),
});

export async function createEnquiryAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requirePortalUser(["owner", "manager", "staff"]);

  try {
    const input = enquirySchema.parse({
      customerId: optionalText(formData, "customerId"),
      customerName: text(formData, "customerName"),
      phonePrimary: text(formData, "phonePrimary"),
      type: text(formData, "type"),
      source: text(formData, "source"),
      area: optionalText(formData, "area"),
      notes: optionalText(formData, "notes"),
      followUpAt: optionalText(formData, "followUpAt"),
      assignedTo: optionalText(formData, "assignedTo"),
    });

    let customerId = input.customerId;
    if (!customerId) {
      const duplicate = findCustomerByPhone(input.phonePrimary);
      if (duplicate) {
        customerId = duplicate.id;
      } else {
        customerId = newId();
        insertCustomer({
          id: customerId,
          name: input.customerName,
          businessName: null,
          customerType: "individual",
          phonePrimary: input.phonePrimary,
          phoneSecondary: null,
          email: null,
          address: null,
          area: input.area,
          notes: null,
          createdBy: user.id,
        });
        recordActivity({ entityType: "customer", entityId: customerId, action: "created_from_enquiry", actorId: user.id });
      }
    }

    const enquiryId = newId();
    insertEnquiry({
      id: enquiryId,
      reference: nextReference("enquiry", "ENQ"),
      customerId,
      type: input.type,
      source: input.source,
      status: "new",
      area: input.area,
      notes: input.notes,
      followUpAt: input.followUpAt,
      assignedTo: input.assignedTo,
      createdBy: user.id,
    });
    recordActivity({ entityType: "enquiry", entityId: enquiryId, action: "created", actorId: user.id });
    const owners = getPortalDatabase().prepare("SELECT id FROM users WHERE role = 'owner' AND is_active = 1").all() as Array<{ id: string }>;
    for (const owner of owners) {
      if (owner.id !== user.id) createNotification({ userId: owner.id, type: "new-enquiry", title: "New enquiry", message: `${input.customerName} was added as a new enquiry.`, entityType: "enquiry", entityId: enquiryId });
    }
    if (input.assignedTo && input.assignedTo !== user.id) {
      createNotification({ userId: input.assignedTo, type: "assigned-enquiry", title: "Enquiry assigned", message: `${input.customerName}'s enquiry has been assigned to you.`, entityType: "enquiry", entityId: enquiryId });
    }
  } catch (error) {
    return { error: safeError(error, "Unable to save the enquiry.") };
  }

  revalidatePath("/portal/enquiries");
  revalidatePath("/portal/dashboard");
  redirect("/portal/enquiries?saved=enquiry");
}

const enquiryUpdateSchema = z.object({
  type: z.enum(enquiryTypes),
  source: z.enum(enquirySources),
  status: z.enum(["new", "contacted", "survey-required", "quotation-in-progress", "converted", "lost"] as const),
  area: z.string().nullable(),
  notes: z.string().nullable(),
  followUpAt: z.string().nullable(),
  assignedTo: z.string().nullable(),
});

export async function updateEnquiryAction(enquiryId: string, _: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requirePortalUser(["owner", "manager", "staff"]);

  try {
    const input = enquiryUpdateSchema.parse({
      type: text(formData, "type"),
      source: text(formData, "source"),
      status: text(formData, "status"),
      area: optionalText(formData, "area"),
      notes: optionalText(formData, "notes"),
      followUpAt: optionalText(formData, "followUpAt"),
      assignedTo: optionalText(formData, "assignedTo"),
    });

    const existing = getPortalDatabase().prepare("SELECT id FROM enquiries WHERE id = ? LIMIT 1").get(enquiryId) as { id: string } | undefined;
    if (!existing) return { error: "That enquiry record no longer exists." };

    updateEnquiry({ id: enquiryId, ...input });
    recordActivity({ entityType: "enquiry", entityId: enquiryId, action: "updated", actorId: user.id, details: { status: input.status } });
  } catch (error) {
    return { error: safeError(error, "Unable to update the enquiry.") };
  }

  revalidatePath("/portal/enquiries");
  revalidatePath("/portal/dashboard");
  revalidatePath(`/portal/enquiries/${enquiryId}`);
  redirect(`/portal/enquiries/${enquiryId}?saved=enquiry`);
}

const projectSchema = z.object({
  customerId: z.string().min(1, "Select a customer."),
  title: z.string().min(2, "Enter a project title."),
  projectType: z.string().min(2, "Enter the project type."),
  status: z.enum(projectStatuses),
  siteAddress: z.string().nullable(),
  area: z.string().nullable(),
  siteLatitude: z.number().min(-90, "Latitude must be between -90 and 90.").max(90, "Latitude must be between -90 and 90.").nullable(),
  siteLongitude: z.number().min(-180, "Longitude must be between -180 and 180.").max(180, "Longitude must be between -180 and 180.").nullable(),
  siteInstructions: z.string().nullable(),
  plannedInstallDate: z.string().nullable(),
  estimatedAmount: z.number().nonnegative("Amount cannot be negative.").nullable(),
  notes: z.string().nullable(),
});

export async function createProjectAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requirePortalUser(["owner", "manager", "staff"]);

  try {
    const amountText = text(formData, "estimatedAmount");
    const amount = amountText ? Number(amountText) : null;
    const latitudeText = text(formData, "siteLatitude");
    const longitudeText = text(formData, "siteLongitude");
    const latitude = latitudeText ? Number(latitudeText) : null;
    const longitude = longitudeText ? Number(longitudeText) : null;
    if (amountText && !Number.isFinite(amount)) {
      return { error: "Enter a valid estimated amount." };
    }
    if ((latitudeText && !Number.isFinite(latitude)) || (longitudeText && !Number.isFinite(longitude))) {
      return { error: "Enter valid map coordinates." };
    }

    const input = projectSchema.parse({
      customerId: text(formData, "customerId"),
      title: text(formData, "title"),
      projectType: text(formData, "projectType"),
      status: text(formData, "status"),
      siteAddress: optionalText(formData, "siteAddress"),
      area: optionalText(formData, "area"),
      siteLatitude: latitude,
      siteLongitude: longitude,
      siteInstructions: optionalText(formData, "siteInstructions"),
      plannedInstallDate: optionalText(formData, "plannedInstallDate"),
      estimatedAmount: amount,
      notes: optionalText(formData, "notes"),
    });
    const projectId = newId();
    const warrantyStartDate = input.status === "completed" ? getPortalToday() : null;
    insertProject({
      id: projectId,
      reference: nextReference("project", "PROJ"),
      ...input,
      warrantyStartDate,
      warrantyEndDate: warrantyStartDate ? dateAfterMonths(warrantyStartDate, getDefaultWarrantyMonths()) : null,
      createdBy: user.id,
    });
    recordActivity({ entityType: "project", entityId: projectId, action: "created", actorId: user.id });
  } catch (error) {
    return { error: safeError(error, "Unable to save the project.") };
  }

  revalidatePath("/portal/projects");
  revalidatePath("/portal/dashboard");
  redirect("/portal/projects?saved=project");
}

const projectUpdateSchema = z.object({
  title: z.string().min(2, "Enter a project title."),
  projectType: z.string().min(2, "Enter the project type."),
  status: z.enum(projectStatuses),
  siteAddress: z.string().nullable(),
  area: z.string().nullable(),
  siteLatitude: z.number().min(-90, "Latitude must be between -90 and 90.").max(90, "Latitude must be between -90 and 90.").nullable(),
  siteLongitude: z.number().min(-180, "Longitude must be between -180 and 180.").max(180, "Longitude must be between -180 and 180.").nullable(),
  siteInstructions: z.string().nullable(),
  plannedInstallDate: z.string().nullable(),
  estimatedAmount: z.number().nonnegative("Amount cannot be negative.").nullable(),
  warrantyStartDate: z.string().nullable(),
  notes: z.string().nullable(),
});

export async function updateProjectAction(projectId: string, _: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requirePortalUser(["owner", "manager", "staff"]);

  try {
    const amountText = text(formData, "estimatedAmount");
    const amount = amountText ? Number(amountText) : null;
    const latitudeText = text(formData, "siteLatitude");
    const longitudeText = text(formData, "siteLongitude");
    const latitude = latitudeText ? Number(latitudeText) : null;
    const longitude = longitudeText ? Number(longitudeText) : null;
    if (amountText && !Number.isFinite(amount)) {
      return { error: "Enter a valid estimated amount." };
    }
    if ((latitudeText && !Number.isFinite(latitude)) || (longitudeText && !Number.isFinite(longitude))) {
      return { error: "Enter valid map coordinates." };
    }

    const input = projectUpdateSchema.parse({
      title: text(formData, "title"),
      projectType: text(formData, "projectType"),
      status: text(formData, "status"),
      siteAddress: optionalText(formData, "siteAddress"),
      area: optionalText(formData, "area"),
      siteLatitude: latitude,
      siteLongitude: longitude,
      siteInstructions: optionalText(formData, "siteInstructions"),
      plannedInstallDate: optionalText(formData, "plannedInstallDate"),
      estimatedAmount: amount,
      warrantyStartDate: optionalText(formData, "warrantyStartDate"),
      notes: optionalText(formData, "notes"),
    });

    const existing = getPortalDatabase().prepare("SELECT id, warranty_start_date FROM projects WHERE id = ? LIMIT 1").get(projectId) as { id: string; warranty_start_date: string | null } | undefined;
    if (!existing) return { error: "That project record no longer exists." };

    const warrantyStartDate = input.status === "completed" && !input.warrantyStartDate && !existing.warranty_start_date ? getPortalToday() : input.warrantyStartDate;
    updateProject({
      id: projectId,
      ...input,
      warrantyStartDate,
      warrantyEndDate: warrantyStartDate ? dateAfterMonths(warrantyStartDate, getDefaultWarrantyMonths()) : null,
    });
    recordActivity({ entityType: "project", entityId: projectId, action: "updated", actorId: user.id, details: { status: input.status } });
  } catch (error) {
    return { error: safeError(error, "Unable to update the project.") };
  }

  revalidatePath("/portal/projects");
  revalidatePath("/portal/dashboard");
  revalidatePath(`/portal/projects/${projectId}`);
  redirect(`/portal/projects/${projectId}?saved=project`);
}

const siteSurveySchema = z.object({
  surveyDate: z.string().min(1, "Select the survey date and time."),
  surveyorId: z.string().nullable(),
  propertyType: z.string().nullable(),
  installationArea: z.string().nullable(),
  cameraCount: z.number().nonnegative("Camera count cannot be negative.").nullable(),
  cameraType: z.string().nullable(),
  indoorOutdoor: z.string().nullable(),
  cableLength: z.number().nonnegative("Cable length cannot be negative.").nullable(),
  cableRoutes: z.string().nullable(),
  storageRequirements: z.string().nullable(),
  networkingNeeds: z.string().nullable(),
  mountingConstraints: z.string().nullable(),
  customerRequirements: z.string().nullable(),
  outcome: z.string().nullable(),
  nextSteps: z.string().nullable(),
});

export async function createSiteSurveyAction(projectId: string, _: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requirePortalUser(["owner", "manager", "staff"]);

  try {
    const cameraCountText = text(formData, "cameraCount");
    const cableLengthText = text(formData, "cableLength");
    const cameraCount = cameraCountText ? Number(cameraCountText) : null;
    const cableLength = cableLengthText ? Number(cableLengthText) : null;
    if ((cameraCountText && !Number.isFinite(cameraCount)) || (cableLengthText && !Number.isFinite(cableLength))) {
      return { error: "Enter valid survey quantities." };
    }

    const input = siteSurveySchema.parse({
      surveyDate: text(formData, "surveyDate"),
      surveyorId: optionalText(formData, "surveyorId"),
      propertyType: optionalText(formData, "propertyType"),
      installationArea: optionalText(formData, "installationArea"),
      cameraCount,
      cameraType: optionalText(formData, "cameraType"),
      indoorOutdoor: optionalText(formData, "indoorOutdoor"),
      cableLength,
      cableRoutes: optionalText(formData, "cableRoutes"),
      storageRequirements: optionalText(formData, "storageRequirements"),
      networkingNeeds: optionalText(formData, "networkingNeeds"),
      mountingConstraints: optionalText(formData, "mountingConstraints"),
      customerRequirements: optionalText(formData, "customerRequirements"),
      outcome: optionalText(formData, "outcome"),
      nextSteps: optionalText(formData, "nextSteps"),
    });
    const project = getPortalDatabase().prepare("SELECT id FROM projects WHERE id = ? LIMIT 1").get(projectId) as { id: string } | undefined;
    if (!project) return { error: "That project no longer exists." };

    if (input.surveyorId) {
      const surveyor = getPortalDatabase().prepare("SELECT id FROM users WHERE id = ? AND is_active = 1 LIMIT 1").get(input.surveyorId) as { id: string } | undefined;
      if (!surveyor) return { error: "Select an active surveyor." };
    }

    const surveyId = newId();
    insertSiteSurvey({ id: surveyId, projectId, ...input, recordedBy: user.id });
    recordActivity({ entityType: "project", entityId: projectId, action: "site_survey_recorded", actorId: user.id, details: { surveyId } });
  } catch (error) {
    return { error: safeError(error, "Unable to record the site survey.") };
  }

  revalidatePath(`/portal/projects/${projectId}`);
  revalidatePath("/portal/projects");
  redirect(`/portal/projects/${projectId}?saved=survey`);
}

const scheduleEventSchema = z.object({
  eventType: z.enum(scheduleEventTypes),
  title: z.string().min(2, "Enter a schedule title."),
  scheduledStart: z.string().min(1, "Select a start time."),
  scheduledEnd: z.string().min(1, "Select an end time."),
  projectId: z.string().nullable(),
  ticketId: z.string().nullable(),
  assignedTo: z.string().nullable(),
  notes: z.string().nullable(),
});

export async function createScheduleEventAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requirePortalUser(["owner", "manager", "staff"]);

  try {
    const input = scheduleEventSchema.parse({
      eventType: text(formData, "eventType"),
      title: text(formData, "title"),
      scheduledStart: text(formData, "scheduledStart"),
      scheduledEnd: text(formData, "scheduledEnd"),
      projectId: optionalText(formData, "projectId"),
      ticketId: optionalText(formData, "ticketId"),
      assignedTo: optionalText(formData, "assignedTo"),
      notes: optionalText(formData, "notes"),
    });
    if (input.scheduledEnd <= input.scheduledStart) return { error: "The end time must be after the start time." };

    if (input.projectId) {
      const project = getPortalDatabase().prepare("SELECT id FROM projects WHERE id = ? LIMIT 1").get(input.projectId) as { id: string } | undefined;
      if (!project) return { error: "Select an existing project." };
    }
    if (input.ticketId) {
      const ticket = getPortalDatabase().prepare("SELECT id FROM service_tickets WHERE id = ? LIMIT 1").get(input.ticketId) as { id: string } | undefined;
      if (!ticket) return { error: "Select an existing support ticket." };
    }
    if (input.assignedTo) {
      const assignee = getPortalDatabase().prepare("SELECT id FROM users WHERE id = ? AND is_active = 1 LIMIT 1").get(input.assignedTo) as { id: string } | undefined;
      if (!assignee) return { error: "Select an active team member." };
      const conflict = getPortalDatabase().prepare(
        `SELECT title FROM schedule_events
         WHERE assigned_to = ? AND status <> 'cancelled'
           AND scheduled_start < ? AND scheduled_end > ? LIMIT 1`,
      ).get(input.assignedTo, input.scheduledEnd, input.scheduledStart) as { title: string } | undefined;
      if (conflict && text(formData, "allowConflict") !== "on") return { error: `This team member already has an overlapping event: ${conflict.title}. Check the override box to continue.` };
    }

    const eventId = newId();
    insertScheduleEvent({ id: eventId, ...input, status: "scheduled", createdBy: user.id });
    if (input.assignedTo && input.assignedTo !== user.id) {
      createNotification({ userId: input.assignedTo, type: "assigned-schedule-event", title: "Work scheduled", message: `${input.title} has been scheduled for you.`, entityType: "schedule-event", entityId: eventId });
    }
    recordActivity({ entityType: "schedule-event", entityId: eventId, action: "created", actorId: user.id, details: { eventType: input.eventType, scheduledStart: input.scheduledStart, assignedTo: input.assignedTo } });
  } catch (error) {
    return { error: safeError(error, "Unable to create the schedule event.") };
  }

  revalidatePath("/portal/schedule");
  revalidatePath("/portal/dashboard");
  redirect("/portal/schedule?saved=event");
}

export async function updateScheduleEventStatusAction(eventId: string, _: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requirePortalUser();

  try {
    const input = z.object({ status: z.enum(scheduleEventStatuses) }).parse({ status: text(formData, "status") });
    const event = getPortalDatabase().prepare("SELECT id, assigned_to FROM schedule_events WHERE id = ? LIMIT 1").get(eventId) as { id: string; assigned_to: string | null } | undefined;
    if (!event) return { error: "That schedule event no longer exists." };
    if (user.role === "technician" && event.assigned_to !== user.id) return { error: "You can only update events assigned to you." };

    updateScheduleEventStatus({ id: eventId, status: input.status });
    recordActivity({ entityType: "schedule-event", entityId: eventId, action: "status_updated", actorId: user.id, details: { status: input.status } });
  } catch (error) {
    return { error: safeError(error, "Unable to update the schedule event.") };
  }

  revalidatePath("/portal/schedule");
  revalidatePath("/portal/dashboard");
  redirect("/portal/schedule?saved=status");
}

const rescheduleEventSchema = z.object({
  scheduledStart: z.string().min(1, "Select a new start time."),
  scheduledEnd: z.string().min(1, "Select a new end time."),
  notes: z.string().nullable(),
});

export async function rescheduleEventAction(eventId: string, _: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requirePortalUser(["owner", "manager", "staff"]);

  try {
    const current = getPortalDatabase()
      .prepare("SELECT id, title, scheduled_start, scheduled_end, assigned_to, notes FROM schedule_events WHERE id = ? LIMIT 1")
      .get(eventId) as { id: string; title: string; scheduled_start: string; scheduled_end: string; assigned_to: string | null; notes: string | null } | undefined;
    if (!current) return { error: "That schedule event no longer exists." };

    const input = rescheduleEventSchema.parse({
      scheduledStart: text(formData, "scheduledStart"),
      scheduledEnd: text(formData, "scheduledEnd"),
      notes: optionalText(formData, "notes"),
    });
    if (input.scheduledEnd <= input.scheduledStart) return { error: "The end time must be after the start time." };
    if (current.assigned_to) {
      const conflict = getPortalDatabase().prepare(
        `SELECT title FROM schedule_events
         WHERE id <> ? AND assigned_to = ? AND status <> 'cancelled'
           AND scheduled_start < ? AND scheduled_end > ? LIMIT 1`,
      ).get(eventId, current.assigned_to, input.scheduledEnd, input.scheduledStart) as { title: string } | undefined;
      if (conflict && text(formData, "allowConflict") !== "on") return { error: `This team member already has an overlapping event: ${conflict.title}. Check the override box to continue.` };
    }

    updateScheduleEvent({ id: eventId, scheduledStart: input.scheduledStart, scheduledEnd: input.scheduledEnd, notes: input.notes ?? current.notes });
    if (current.assigned_to && current.assigned_to !== user.id) {
      createNotification({ userId: current.assigned_to, type: "rescheduled-event", title: "Work rescheduled", message: `${current.title} has been moved to a new time.`, entityType: "schedule-event", entityId: eventId });
    }
    recordActivity({ entityType: "schedule-event", entityId: eventId, action: "rescheduled", actorId: user.id, details: { from: { scheduledStart: current.scheduled_start, scheduledEnd: current.scheduled_end }, to: { scheduledStart: input.scheduledStart, scheduledEnd: input.scheduledEnd } } });
  } catch (error) {
    return { error: safeError(error, "Unable to reschedule the event.") };
  }

  revalidatePath("/portal/schedule");
  revalidatePath("/portal/dashboard");
  redirect("/portal/schedule?saved=rescheduled");
}

const quotationItemSchema = z.object({
  description: z.string().min(1, "Each quote item needs a description."),
  quantity: z.number().positive("Quantity must be greater than zero."),
  unitPrice: z.number().nonnegative("Unit price cannot be negative."),
});

const quotationSchema = z.object({
  customerId: z.string().min(1, "Select a customer."),
  projectId: z.string().nullable(),
  vatRate: z.number().min(0, "VAT rate cannot be negative.").max(100, "VAT rate cannot exceed 100."),
  validDays: z.number().int().min(1, "Validity must be at least one day.").max(365, "Validity cannot exceed one year."),
  notes: z.string().nullable(),
  items: z.array(quotationItemSchema).min(1, "Add at least one quote item.").max(100, "A quotation cannot contain more than 100 items."),
});

function roundMoney(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function dateAfterDays(days: number) {
  const [year, month, day] = getPortalToday().split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function dateAfterMonths(dateValue: string, months: number) {
  const [year, month, day] = dateValue.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCMonth(date.getUTCMonth() + months);
  return date.toISOString().slice(0, 10);
}

export async function createQuotationAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requirePortalUser(["owner", "manager", "staff"]);

  try {
    let items: unknown;
    try {
      items = JSON.parse(text(formData, "items"));
    } catch {
      return { error: "Add at least one valid quote item." };
    }

    const vatRateText = text(formData, "vatRate");
    const validDaysText = text(formData, "validDays");
    const vatRate = vatRateText ? Number(vatRateText) : getPortalVatRate();
    const validDays = validDaysText ? Number(validDaysText) : getDefaultQuotationValidityDays();
    if (!Number.isFinite(vatRate) || !Number.isFinite(validDays)) {
      return { error: "Enter valid VAT and quotation validity values." };
    }

    const input = quotationSchema.parse({
      customerId: text(formData, "customerId"),
      projectId: optionalText(formData, "projectId"),
      vatRate,
      validDays,
      notes: optionalText(formData, "notes"),
      items,
    });

    const customer = getPortalDatabase().prepare("SELECT id FROM customers WHERE id = ? LIMIT 1").get(input.customerId) as { id: string } | undefined;
    if (!customer) return { error: "Select an existing customer." };

    if (input.projectId) {
      const project = getPortalDatabase().prepare("SELECT id FROM projects WHERE id = ? AND customer_id = ? LIMIT 1").get(input.projectId, input.customerId) as { id: string } | undefined;
      if (!project) return { error: "Select a project belonging to the chosen customer." };
    }

    const itemsWithTotals = input.items.map((item, index) => ({
      id: newId(),
      description: item.description,
      quantity: item.quantity,
      unitPrice: roundMoney(item.unitPrice),
      lineTotal: roundMoney(item.quantity * item.unitPrice),
      sortOrder: index,
    }));
    const subtotal = roundMoney(itemsWithTotals.reduce((sum, item) => sum + item.lineTotal, 0));
    const vatAmount = roundMoney((subtotal * input.vatRate) / 100);
    const total = roundMoney(subtotal + vatAmount);
    const quotationId = newId();
    insertQuotation({
      id: quotationId,
      reference: nextReference("quotation", "QTN"),
      customerId: input.customerId,
      projectId: input.projectId,
      status: "draft",
      vatRate: input.vatRate,
      subtotal,
      vatAmount,
      total,
      validDays: input.validDays,
      validUntil: dateAfterDays(input.validDays),
      notes: input.notes,
      createdBy: user.id,
      items: itemsWithTotals,
    });
    recordActivity({ entityType: "quotation", entityId: quotationId, action: "created", actorId: user.id, details: { total, vatRate: input.vatRate } });
  } catch (error) {
    return { error: safeError(error, "Unable to create the quotation.") };
  }

  revalidatePath("/portal/quotations");
  revalidatePath("/portal/projects");
  redirect("/portal/quotations?saved=quotation");
}

export async function updateQuotationStatusAction(quotationId: string, _: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requirePortalUser(["owner", "manager", "staff"]);

  try {
    const status = z.enum(quotationStatuses).parse(text(formData, "status"));
    const quotation = getPortalDatabase().prepare("SELECT id FROM quotations WHERE id = ? LIMIT 1").get(quotationId) as { id: string } | undefined;
    if (!quotation) return { error: "That quotation no longer exists." };

    getPortalDatabase().prepare("UPDATE quotations SET status = ?, updated_at = ? WHERE id = ?").run(status, nowIso(), quotationId);
    recordActivity({ entityType: "quotation", entityId: quotationId, action: "status_updated", actorId: user.id, details: { status } });
  } catch (error) {
    return { error: safeError(error, "Unable to update the quotation status.") };
  }

  revalidatePath("/portal/quotations");
  revalidatePath(`/portal/quotations/${quotationId}`);
  redirect(`/portal/quotations/${quotationId}?saved=status`);
}

const paymentSchema = z.object({
  quotationId: z.string().nullable(),
  method: z.enum(paymentMethods),
  amount: z.number().positive("Payment amount must be greater than zero."),
  paidAt: z.string().min(1, "Select the payment date."),
  reference: z.string().nullable(),
  notes: z.string().nullable(),
});

const installationItemSchema = z.object({
  description: z.string().min(1, "Enter the installed item or equipment name."),
  quotedQuantity: z.number().nonnegative("Quoted quantity cannot be negative.").nullable(),
  installedQuantity: z.number().positive("Installed quantity must be greater than zero."),
  serialNumber: z.string().nullable(),
  notes: z.string().nullable(),
});

export async function createPaymentAction(projectId: string, _: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requirePortalUser(["owner", "manager", "staff"]);

  try {
    const amountText = text(formData, "amount");
    const amount = amountText ? Number(amountText) : NaN;
    if (!Number.isFinite(amount)) return { error: "Enter a valid payment amount." };

    const input = paymentSchema.parse({
      quotationId: optionalText(formData, "quotationId"),
      method: text(formData, "method"),
      amount,
      paidAt: text(formData, "paidAt"),
      reference: optionalText(formData, "reference"),
      notes: optionalText(formData, "notes"),
    });
    const project = getPortalDatabase().prepare("SELECT id FROM projects WHERE id = ? LIMIT 1").get(projectId) as { id: string } | undefined;
    if (!project) return { error: "That project no longer exists." };

    if (input.quotationId) {
      const quotation = getPortalDatabase().prepare("SELECT id FROM quotations WHERE id = ? AND project_id = ? LIMIT 1").get(input.quotationId, projectId) as { id: string } | undefined;
      if (!quotation) return { error: "Select a quotation linked to this project." };
    }

    const paymentId = newId();
    insertPayment({ id: paymentId, projectId, ...input, recordedBy: user.id });
    recordActivity({ entityType: "project", entityId: projectId, action: "payment_recorded", actorId: user.id, details: { amount: input.amount, method: input.method } });
  } catch (error) {
    return { error: safeError(error, "Unable to record the payment.") };
  }

  revalidatePath(`/portal/projects/${projectId}`);
  revalidatePath("/portal/projects");
  revalidatePath("/portal/dashboard");
  redirect(`/portal/projects/${projectId}?saved=payment`);
}

const paymentAdjustmentSchema = z.object({
  paymentId: z.string().min(1, "Select the original payment."),
  type: z.enum(paymentAdjustmentTypes),
  amount: z.number().positive("Enter an adjustment amount greater than zero."),
  reason: z.string().min(3, "Explain the reason for this correction."),
});

export async function createPaymentAdjustmentAction(projectId: string, _: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requirePortalUser(["owner", "manager", "staff"]);

  try {
    const amountText = text(formData, "amount");
    const amount = amountText ? Number(amountText) : NaN;
    if (!Number.isFinite(amount)) return { error: "Enter a valid adjustment amount." };

    const input = paymentAdjustmentSchema.parse({
      paymentId: text(formData, "paymentId"),
      type: text(formData, "type"),
      amount,
      reason: text(formData, "reason"),
    });
    const payment = getPortalDatabase()
      .prepare("SELECT id FROM payments WHERE id = ? AND project_id = ? LIMIT 1")
      .get(input.paymentId, projectId) as { id: string } | undefined;
    if (!payment) return { error: "Select a payment belonging to this project." };

    const project = getPortalDatabase().prepare("SELECT amount_paid FROM projects WHERE id = ? LIMIT 1").get(projectId) as { amount_paid: number } | undefined;
    if (!project) return { error: "That project no longer exists." };
    if (input.amount > Number(project.amount_paid)) return { error: "The adjustment cannot be greater than the project's current paid balance." };

    const adjustmentId = newId();
    insertPaymentAdjustment({ id: adjustmentId, projectId, ...input, recordedBy: user.id });
    recordActivity({ entityType: "project", entityId: projectId, action: "payment_adjustment_recorded", actorId: user.id, details: { adjustmentId, paymentId: input.paymentId, type: input.type, amount: input.amount } });
  } catch (error) {
    return { error: safeError(error, "Unable to record the payment correction.") };
  }

  revalidatePath(`/portal/projects/${projectId}`);
  revalidatePath("/portal/projects");
  revalidatePath("/portal/reports");
  redirect(`/portal/projects/${projectId}?saved=payment-adjustment`);
}

export async function createInstallationItemAction(projectId: string, _: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requirePortalUser(["owner", "manager", "staff"]);

  try {
    const quotedQuantityText = text(formData, "quotedQuantity");
    const installedQuantityText = text(formData, "installedQuantity");
    const quotedQuantity = quotedQuantityText ? Number(quotedQuantityText) : null;
    const installedQuantity = installedQuantityText ? Number(installedQuantityText) : NaN;
    if (quotedQuantity !== null && !Number.isFinite(quotedQuantity)) return { error: "Enter a valid quoted quantity." };
    if (!Number.isFinite(installedQuantity)) return { error: "Enter a valid installed quantity." };

    const input = installationItemSchema.parse({
      description: text(formData, "description"),
      quotedQuantity,
      installedQuantity,
      serialNumber: optionalText(formData, "serialNumber"),
      notes: optionalText(formData, "notes"),
    });
    const project = getPortalDatabase().prepare("SELECT id FROM projects WHERE id = ? LIMIT 1").get(projectId) as { id: string } | undefined;
    if (!project) return { error: "That project no longer exists." };

    const itemId = newId();
    insertInstallationItem({ id: itemId, projectId, ...input, recordedBy: user.id });
    recordActivity({
      entityType: "project",
      entityId: projectId,
      action: "installation_item_recorded",
      actorId: user.id,
      details: { description: input.description, installedQuantity: input.installedQuantity },
    });
  } catch (error) {
    return { error: safeError(error, "Unable to record the installed item.") };
  }

  revalidatePath(`/portal/projects/${projectId}`);
  revalidatePath("/portal/projects");
  redirect(`/portal/projects/${projectId}?saved=installation-item`);
}

const supportTicketSchema = z.object({
  customerName: z.string().min(2, "Enter your name."),
  phone: z.string().min(7, "Enter a valid phone number."),
  email: z.union([z.string().email("Enter a valid email address."), z.literal("")]).transform((value) => value || null),
  projectReference: z.string().nullable(),
  category: z.enum(ticketCategories),
  priority: z.enum(ticketPriorities),
  description: z.string().min(10, "Please describe the issue in a little more detail."),
  preferredContact: z.string().nullable(),
});

export async function createSupportTicketAction(_: ActionState, formData: FormData): Promise<ActionState> {
  let reference = "";
  let ticketId = "";
  try {
    const input = supportTicketSchema.parse({
      customerName: text(formData, "customerName"),
      phone: text(formData, "phone"),
      email: text(formData, "email"),
      projectReference: optionalText(formData, "projectReference"),
      category: text(formData, "category"),
      priority: text(formData, "priority"),
      description: text(formData, "description"),
      preferredContact: optionalText(formData, "preferredContact"),
    });
    const attachment = formData.get("attachment");
    const attachmentError = validateAttachment(attachment);
    if (attachmentError) return { error: attachmentError };

    const customer = findCustomerByPhone(input.phone);
    let projectId: string | null = null;
    if (input.projectReference && customer) {
      const project = getPortalDatabase()
        .prepare("SELECT id FROM projects WHERE reference = ? AND customer_id = ? LIMIT 1")
        .get(input.projectReference, customer.id) as { id: string } | undefined;
      projectId = project?.id ?? null;
    }

    ticketId = newId();
    reference = nextReference("service-ticket", "TKT");
    insertServiceTicket({
      id: ticketId,
      reference,
      customerId: customer?.id ?? null,
      customerName: input.customerName,
      phone: input.phone,
      email: input.email,
      projectId,
      category: input.category,
      priority: input.priority,
      status: "open",
      description: input.description,
      preferredContact: input.preferredContact,
    });

    if (attachment instanceof File && attachment.size > 0) {
      await saveCustomerTicketAttachment(ticketId, attachment);
    }
    const owners = getPortalDatabase().prepare("SELECT email FROM users WHERE role = 'owner' AND is_active = 1").all() as Array<{ email: string }>;
    await Promise.all(owners.map((owner) => sendPortalEmail({
      to: owner.email,
      subject: `New support ticket ${reference}`,
      text: `${reference} from ${input.customerName} needs review. Sign in to the portal to review and assign it.`,
    })));
  } catch (error) {
    return { error: safeError(error, "Unable to submit the support request.") };
  }

  redirect(`/support?submitted=1&reference=${encodeURIComponent(reference)}`);
}

const supportAccessSchema = z.object({
  reference: z.string().min(5, "Enter your ticket reference."),
  phone: z.string().min(7, "Enter the phone number used for the request."),
});

export async function customerTicketAccessAction(_: ActionState, formData: FormData): Promise<ActionState> {
  let rawToken = "";
  try {
    const input = supportAccessSchema.parse({ reference: text(formData, "reference"), phone: text(formData, "phone") });
    const ticket = getPortalDatabase()
      .prepare("SELECT id, phone FROM service_tickets WHERE reference = ? LIMIT 1")
      .get(input.reference) as { id: string; phone: string } | undefined;

    if (!ticket || normalizePortalPhone(ticket.phone) !== normalizePortalPhone(input.phone)) {
      return { error: "We could not verify that ticket and phone combination." };
    }

    rawToken = createToken();
    createSupportAccessToken({
      tokenHash: hashToken(rawToken),
      ticketId: ticket.id,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    });
  } catch (error) {
    return { error: safeError(error, "Unable to open the support status page.") };
  }

  redirect(`/support/status?token=${encodeURIComponent(rawToken)}`);
}

const serviceTicketUpdateSchema = z.object({
  status: z.enum(ticketStatuses),
  assignedTo: z.string().nullable(),
  internalNotes: z.string().nullable(),
  customerUpdate: z.string().nullable(),
  resolutionSummary: z.string().nullable(),
});

const attachmentMimeTypes = new Set(["image/jpeg", "image/png", "image/webp", "application/pdf", "video/mp4"]);
const attachmentMaxBytes = 25 * 1024 * 1024;

function validateAttachment(value: FormDataEntryValue | null) {
  if (!(value instanceof File) || value.size === 0) return null;
  if (!attachmentMimeTypes.has(value.type)) return "Attach a JPG, PNG, WebP, PDF, or MP4 file.";
  if (value.size > attachmentMaxBytes) return "Attachments must be 25 MB or smaller.";
  return null;
}

async function saveTicketAttachment(ticketId: string, file: File, uploadedBy: string) {
  const attachmentId = newId();
  const extension = path.extname(file.name).toLowerCase().slice(0, 10);
  const storedName = `${attachmentId}${extension}`;
  const directory = path.join(process.cwd(), "data", "portal-uploads", ticketId);
  await fs.mkdir(directory, { recursive: true });
  await fs.writeFile(path.join(directory, storedName), Buffer.from(await file.arrayBuffer()));
  try {
    insertTicketAttachment({
      id: attachmentId,
      ticketId,
      originalName: file.name.slice(0, 180),
      storedName,
      mimeType: file.type,
      sizeBytes: file.size,
      uploadedBy,
    });
  } catch (error) {
    await fs.rm(path.join(directory, storedName), { force: true });
    throw error;
  }
}

async function saveJobAttachment(jobId: string, file: File, uploadedBy: string) {
  const attachmentId = newId();
  const extension = path.extname(file.name).toLowerCase().slice(0, 10);
  const storedName = `${attachmentId}${extension}`;
  const directory = path.join(process.cwd(), "data", "portal-uploads", "jobs", jobId);
  await fs.mkdir(directory, { recursive: true });
  await fs.writeFile(path.join(directory, storedName), Buffer.from(await file.arrayBuffer()));
  try {
    insertJobAttachment({ id: attachmentId, jobId, originalName: file.name.slice(0, 180), storedName, mimeType: file.type, sizeBytes: file.size, uploadedBy });
  } catch (error) {
    await fs.rm(path.join(directory, storedName), { force: true });
    throw error;
  }
}

async function saveCustomerTicketAttachment(ticketId: string, file: File) {
  const attachmentId = newId();
  const extension = path.extname(file.name).toLowerCase().slice(0, 10);
  const storedName = `${attachmentId}${extension}`;
  const directory = path.join(process.cwd(), "data", "portal-uploads", ticketId);
  await fs.mkdir(directory, { recursive: true });
  await fs.writeFile(path.join(directory, storedName), Buffer.from(await file.arrayBuffer()));
  try {
    insertCustomerTicketAttachment({
      id: attachmentId,
      ticketId,
      originalName: file.name.slice(0, 180),
      storedName,
      mimeType: file.type,
      sizeBytes: file.size,
    });
  } catch (error) {
    await fs.rm(path.join(directory, storedName), { force: true });
    throw error;
  }
}

export async function uploadTicketAttachmentAction(ticketId: string, _: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requirePortalUser();

  try {
    const current = getPortalDatabase().prepare("SELECT id, assigned_to FROM service_tickets WHERE id = ? LIMIT 1").get(ticketId) as { id: string; assigned_to: string | null } | undefined;
    if (!current) return { error: "That support ticket no longer exists." };
    if (user.role === "technician" && current.assigned_to !== user.id) return { error: "You can only add files to tickets assigned to you." };

    const attachment = formData.get("attachment");
    const validationError = validateAttachment(attachment);
    if (validationError) return { error: validationError };
    if (!(attachment instanceof File) || attachment.size === 0) return { error: "Choose a file to attach." };
    await saveTicketAttachment(ticketId, attachment, user.id);
    recordActivity({ entityType: "service-ticket", entityId: ticketId, action: "attachment_added", actorId: user.id, details: { fileName: attachment.name.slice(0, 180) } });
  } catch (error) {
    return { error: safeError(error, "Unable to save the attachment.") };
  }

  revalidatePath(`/portal/tickets/${ticketId}`);
  redirect(`/portal/tickets/${ticketId}?saved=attachment`);
}

export async function updateServiceTicketAction(ticketId: string, _: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requirePortalUser();

  try {
    const current = getPortalDatabase()
      .prepare("SELECT id, reference, assigned_to FROM service_tickets WHERE id = ? LIMIT 1")
      .get(ticketId) as { id: string; reference: string; assigned_to: string | null } | undefined;
    if (!current) return { error: "That support ticket no longer exists." };
    if (user.role === "technician" && current.assigned_to !== user.id) {
      return { error: "You can only update tickets assigned to you." };
    }

    const input = serviceTicketUpdateSchema.parse({
      status: text(formData, "status"),
      assignedTo: optionalText(formData, "assignedTo"),
      internalNotes: optionalText(formData, "internalNotes"),
      customerUpdate: optionalText(formData, "customerUpdate"),
      resolutionSummary: optionalText(formData, "resolutionSummary"),
    });
    const assignedTo = user.role === "technician" ? current.assigned_to : input.assignedTo;

    if (assignedTo) {
      const technician = getPortalDatabase()
        .prepare("SELECT id FROM users WHERE id = ? AND role = 'technician' AND is_active = 1 LIMIT 1")
        .get(assignedTo) as { id: string } | undefined;
      if (!technician) return { error: "Select an active technician." };
    }

    updateServiceTicket({ id: ticketId, ...input, assignedTo });
    if (assignedTo && assignedTo !== current.assigned_to) {
      createNotification({
        userId: assignedTo,
        type: "assigned-service-ticket",
        title: "Support ticket assigned",
        message: `${current.reference} has been assigned to you.`,
        entityType: "service-ticket",
        entityId: ticketId,
      });
      const technician = getPortalDatabase().prepare("SELECT email FROM users WHERE id = ? LIMIT 1").get(assignedTo) as { email: string } | undefined;
      if (technician) {
        await sendPortalEmail({
          to: technician.email,
          subject: `Support ticket ${current.reference} assigned to you`,
          text: `${current.reference} has been assigned to you. Sign in to the portal to review the request.`,
        });
      }
    }
    recordActivity({
      entityType: "service-ticket",
      entityId: ticketId,
      action: "updated",
      actorId: user.id,
      details: { status: input.status, assignedTo },
    });
  } catch (error) {
    return { error: safeError(error, "Unable to update the support ticket.") };
  }

  revalidatePath("/portal/tickets");
  revalidatePath(`/portal/tickets/${ticketId}`);
  revalidatePath("/portal/dashboard");
  redirect(`/portal/tickets/${ticketId}?saved=ticket`);
}

const serviceJobSchema = z.object({
  customerId: z.string().nullable(),
  customerName: z.string().min(2, "Enter the customer name.").max(180),
  phone: z.string().min(7, "Enter a customer phone number.").max(40),
  siteAddress: z.string().max(500).nullable(),
  siteArea: z.string().max(160).nullable(),
  siteLatitude: z.number().min(-90, "Latitude must be between -90 and 90.").max(90, "Latitude must be between -90 and 90.").nullable(),
  siteLongitude: z.number().min(-180, "Longitude must be between -180 and 180.").max(180, "Longitude must be between -180 and 180.").nullable(),
  category: z.enum(jobCategories),
  title: z.string().min(3, "Enter a job title.").max(180),
  description: z.string().min(5, "Describe the work needed.").max(5000),
  requiredSkills: z.string().max(1000).nullable(),
  preferredStart: z.string().nullable(),
  preferredEnd: z.string().nullable(),
  urgency: z.enum(jobUrgencies),
  estimatedMinutes: z.number().int().positive().nullable(),
  internalNotes: z.string().max(3000).nullable(),
  technicianNotes: z.string().max(3000).nullable(),
  acceptanceDeadline: z.string().nullable(),
});

function optionalInteger(formData: FormData, key: string) {
  const value = optionalText(formData, key);
  if (value === null) return null;
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : NaN;
}

function parseServiceJobForm(formData: FormData) {
  const estimatedMinutes = optionalInteger(formData, "estimatedMinutes");
  if (Number.isNaN(estimatedMinutes)) return { error: "Enter a valid estimated duration." } as const;
  const latitudeText = optionalText(formData, "siteLatitude");
  const longitudeText = optionalText(formData, "siteLongitude");
  const siteLatitude = latitudeText === null ? null : Number(latitudeText);
  const siteLongitude = longitudeText === null ? null : Number(longitudeText);
  if (siteLatitude !== null && !Number.isFinite(siteLatitude)) return { error: "Enter a valid map latitude." } as const;
  if (siteLongitude !== null && !Number.isFinite(siteLongitude)) return { error: "Enter a valid map longitude." } as const;
  return { input: serviceJobSchema.parse({
    customerId: optionalText(formData, "customerId"),
    customerName: text(formData, "customerName"),
    phone: text(formData, "phone"),
    siteAddress: optionalText(formData, "siteAddress"),
    siteArea: optionalText(formData, "siteArea"),
    siteLatitude,
    siteLongitude,
    category: text(formData, "category"),
    title: text(formData, "title"),
    description: text(formData, "description"),
    requiredSkills: optionalText(formData, "requiredSkills"),
    preferredStart: optionalText(formData, "preferredStart"),
    preferredEnd: optionalText(formData, "preferredEnd"),
    urgency: text(formData, "urgency"),
    estimatedMinutes,
    internalNotes: optionalText(formData, "internalNotes"),
    technicianNotes: optionalText(formData, "technicianNotes"),
    acceptanceDeadline: optionalText(formData, "acceptanceDeadline"),
  }) } as const;
}

export async function createServiceJobAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requirePortalUser(["owner", "manager", "staff"]);
  try {
    const parsed = parseServiceJobForm(formData);
    if ("error" in parsed) return parsed;
    const input = parsed.input;
    if (input.customerId) {
      const customer = getPortalDatabase().prepare("SELECT id FROM customers WHERE id = ? LIMIT 1").get(input.customerId) as { id: string } | undefined;
      if (!customer) return { error: "Select an existing customer or leave the customer blank." };
    }
    const id = newId();
    insertServiceJob({ id, reference: nextReference("service-job", "JOB"), ...input, createdBy: user.id });
    if (text(formData, "intent") === "broadcast") {
      broadcastServiceJob(id, user.id, input.acceptanceDeadline);
    }
    recordActivity({ entityType: "service-job", entityId: id, action: "created", actorId: user.id, details: { category: input.category, urgency: input.urgency } });
    if (text(formData, "intent") === "broadcast") {
      recordActivity({ entityType: "service-job", entityId: id, action: "broadcast", actorId: user.id });
    }
  } catch (error) {
    return { error: safeError(error, "Unable to create the technician job.") };
  }
  revalidatePath("/portal/jobs");
  revalidatePath("/portal/dashboard");
  redirect(`/portal/jobs?saved=${text(formData, "intent") === "broadcast" ? "broadcast" : "created"}`);
}

export async function broadcastServiceJobAction(jobId: string, _: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requirePortalUser(["owner", "manager", "staff"]);
  try {
    broadcastServiceJob(jobId, user.id, optionalText(formData, "acceptanceDeadline"));
    recordActivity({ entityType: "service-job", entityId: jobId, action: "broadcast", actorId: user.id });
  } catch (error) {
    return { error: safeError(error, "Unable to broadcast the job.") };
  }
  revalidatePath("/portal/jobs");
  revalidatePath(`/portal/jobs/${jobId}`);
  revalidatePath("/portal/dashboard");
  redirect(`/portal/jobs/${jobId}?saved=broadcast`);
}

export async function respondToServiceJobAction(jobId: string, _: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requirePortalUser(["technician"]);
  try {
    const status = z.enum(["accepted", "declined"] as const).parse(text(formData, "status"));
    respondToServiceJob({ jobId, technicianId: user.id, status, reason: optionalText(formData, "reason") });
  } catch (error) {
    return { error: safeError(error, "Unable to respond to this job.") };
  }
  revalidatePath("/portal/jobs");
  revalidatePath(`/portal/jobs/${jobId}`);
  redirect(`/portal/jobs/${jobId}?saved=response`);
}

export async function assignServiceJobAction(jobId: string, _: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requirePortalUser(["owner", "manager", "staff"]);
  try {
    const technicianId = text(formData, "technicianId");
    const technician = getPortalDatabase().prepare("SELECT id FROM users WHERE id = ? AND role = 'technician' AND is_active = 1 LIMIT 1").get(technicianId) as { id: string } | undefined;
    if (!technician) return { error: "Select an active technician." };
    assignServiceJob({ jobId, technicianId, actorId: user.id, reason: optionalText(formData, "reason") });
    recordActivity({ entityType: "service-job", entityId: jobId, action: "assigned", actorId: user.id, details: { technicianId } });
  } catch (error) {
    return { error: safeError(error, "Unable to assign the job.") };
  }
  revalidatePath("/portal/jobs");
  revalidatePath(`/portal/jobs/${jobId}`);
  revalidatePath("/portal/dashboard");
  redirect(`/portal/jobs/${jobId}?saved=assigned`);
}

export async function updateServiceJobStatusAction(jobId: string, _: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requirePortalUser();
  try {
    const status = z.enum(jobStatuses).parse(text(formData, "status"));
    const job = getPortalDatabase().prepare("SELECT assigned_technician_id FROM service_jobs WHERE id = ? LIMIT 1").get(jobId) as { assigned_technician_id: string | null } | undefined;
    if (!job) return { error: "That job no longer exists." };
    if (status === "open") return { error: "Use the broadcast action to open this job for technician acceptance." };
    if (status === "assigned") return { error: "Use the assignment action to choose a technician." };
    if (status === "completed" || status === "awaiting-verification") return { error: "Use the completion review workflow to move a job into verification or completed status." };
    if (user.role === "technician" && (job.assigned_technician_id !== user.id || status !== "in-progress")) return { error: "You can only move an assigned job into progress." };
    updateServiceJobStatus({ jobId, status, actorId: user.id, reason: optionalText(formData, "reason") });
  } catch (error) {
    return { error: safeError(error, "Unable to update the job status.") };
  }
  revalidatePath("/portal/jobs");
  revalidatePath(`/portal/jobs/${jobId}`);
  redirect(`/portal/jobs/${jobId}?saved=status`);
}

export async function submitJobCompletionAction(jobId: string, _: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requirePortalUser(["technician"]);
  try {
    const summary = text(formData, "summary");
    if (summary.length < 5) return { error: "Describe what was completed." };
    const cameraCountText = optionalText(formData, "cameraCount");
    const cameraCount = cameraCountText === null ? null : Number(cameraCountText);
    if (cameraCount !== null && (!Number.isInteger(cameraCount) || cameraCount < 1)) return { error: "Enter a valid camera count." };
    submitJobCompletion({ jobId, technicianId: user.id, summary, workNotes: optionalText(formData, "workNotes"), materials: optionalText(formData, "materials"), cameraCount });
    recordActivity({ entityType: "service-job", entityId: jobId, action: "completion_submitted", actorId: user.id });
  } catch (error) {
    return { error: safeError(error, "Unable to submit the completion record.") };
  }
  revalidatePath("/portal/jobs");
  revalidatePath(`/portal/jobs/${jobId}`);
  redirect(`/portal/jobs/${jobId}?saved=completion`);
}

export async function uploadJobAttachmentAction(jobId: string, _: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requirePortalUser();
  try {
    const job = getPortalDatabase().prepare("SELECT id, assigned_technician_id FROM service_jobs WHERE id = ? LIMIT 1").get(jobId) as { id: string; assigned_technician_id: string | null } | undefined;
    if (!job) return { error: "That job no longer exists." };
    if (user.role === "technician" && job.assigned_technician_id !== user.id) return { error: "You can only add evidence to a job assigned to you." };
    const attachment = formData.get("attachment");
    const validationError = validateAttachment(attachment);
    if (validationError) return { error: validationError };
    if (!(attachment instanceof File) || attachment.size === 0) return { error: "Choose a file to attach." };
    await saveJobAttachment(jobId, attachment, user.id);
    recordActivity({ entityType: "service-job", entityId: jobId, action: "evidence_added", actorId: user.id, details: { fileName: attachment.name.slice(0, 180) } });
  } catch (error) {
    return { error: safeError(error, "Unable to save the job evidence.") };
  }
  revalidatePath(`/portal/jobs/${jobId}`);
  redirect(`/portal/jobs/${jobId}?saved=attachment`);
}

export async function verifyJobCompletionAction(jobId: string, _: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requirePortalUser(["owner", "manager", "staff"]);
  try {
    const approve = text(formData, "decision") === "approve";
    verifyJobCompletion({ jobId, reviewerId: user.id, approve, reason: optionalText(formData, "reason") });
    recordActivity({ entityType: "service-job", entityId: jobId, action: approve ? "completion_verified" : "completion_returned", actorId: user.id });
  } catch (error) {
    return { error: safeError(error, "Unable to review the completion record.") };
  }
  revalidatePath("/portal/jobs");
  revalidatePath(`/portal/jobs/${jobId}`);
  revalidatePath("/portal/points");
  revalidatePath("/portal/dashboard");
  redirect(`/portal/jobs/${jobId}?saved=verification`);
}

const pointRuleSchema = z.object({
  name: z.string().min(2).max(180),
  type: z.enum(pointRuleTypes),
  points: z.number().int().positive("Points must be greater than zero."),
  category: z.string().nullable(),
  sampleLabel: z.string().max(240).nullable(),
  enabled: z.boolean(),
});

function parsePointRuleForm(formData: FormData) {
  const points = Number(text(formData, "points"));
  if (!Number.isInteger(points)) return { error: "Enter a whole number of points." } as const;
  return { input: pointRuleSchema.parse({ name: text(formData, "name"), type: text(formData, "type"), points, category: optionalText(formData, "category"), sampleLabel: optionalText(formData, "sampleLabel"), enabled: text(formData, "enabled") !== "false" }) } as const;
}

export async function createPointRuleAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requirePortalUser(["owner"]);
  try {
    const parsed = parsePointRuleForm(formData);
    if ("error" in parsed) return parsed;
    insertPointRule({ id: newId(), ...parsed.input, actorId: user.id });
    recordActivity({ entityType: "point-rule", entityId: parsed.input.name, action: "created", actorId: user.id });
  } catch (error) { return { error: safeError(error, "Unable to create the SS Points rule.") }; }
  revalidatePath("/portal/points");
  redirect("/portal/points?saved=rule");
}

export async function updatePointRuleAction(ruleId: string, _: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requirePortalUser(["owner"]);
  try {
    const parsed = parsePointRuleForm(formData);
    if ("error" in parsed) return parsed;
    updatePointRule({ id: ruleId, ...parsed.input, actorId: user.id });
  } catch (error) { return { error: safeError(error, "Unable to update the SS Points rule.") }; }
  revalidatePath("/portal/points");
  redirect("/portal/points?saved=rule");
}

export async function adjustPointsAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requirePortalUser(["owner"]);
  try {
    const points = Number(text(formData, "points"));
    if (!Number.isInteger(points) || points === 0) return { error: "Enter a non-zero whole number of points." };
    const reason = text(formData, "reason");
    if (reason.length < 3) return { error: "Enter a reason for the adjustment." };
    applyPointAdjustment({ id: newId(), technicianId: text(formData, "technicianId"), points, reason, actorId: user.id });
  } catch (error) { return { error: safeError(error, "Unable to adjust SS Points.") }; }
  revalidatePath("/portal/points");
  redirect("/portal/points?saved=adjustment");
}

const rewardSchema = z.object({
  productId: z.string().nullable(), name: z.string().min(2).max(180), description: z.string().max(1000).nullable(), category: z.string().min(2).max(100), imagePath: z.string().max(1000).nullable(), pointsCost: z.number().int().positive(), stockQuantity: z.number().int().nonnegative(), active: z.boolean(),
});

function parseRewardForm(formData: FormData) {
  const pointsCost = Number(text(formData, "pointsCost"));
  const stockQuantity = Number(text(formData, "stockQuantity"));
  return { input: rewardSchema.parse({ productId: optionalText(formData, "productId"), name: text(formData, "name"), description: optionalText(formData, "description"), category: text(formData, "category"), imagePath: optionalText(formData, "imagePath"), pointsCost, stockQuantity, active: text(formData, "active") !== "false" }) } as const;
}

export async function createRewardAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requirePortalUser(["owner"]);
  try { const { input } = parseRewardForm(formData); const id = newId(); insertRewardItem({ id, ...input, actorId: user.id }); recordActivity({ entityType: "reward", entityId: id, action: "created", actorId: user.id }); } catch (error) { return { error: safeError(error, "Unable to create the reward.") }; }
  revalidatePath("/portal/rewards");
  redirect("/portal/rewards?saved=reward");
}

export async function updateRewardAction(rewardId: string, _: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requirePortalUser(["owner"]);
  try { const { input } = parseRewardForm(formData); updateRewardItem({ id: rewardId, ...input, actorId: user.id }); } catch (error) { return { error: safeError(error, "Unable to update the reward.") }; }
  revalidatePath("/portal/rewards");
  redirect("/portal/rewards?saved=reward");
}

export async function requestRedemptionAction(rewardId: string, _: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requirePortalUser(["technician"]);
  try {
    const quantity = Number(text(formData, "quantity"));
    if (!Number.isInteger(quantity) || quantity < 1) return { error: "Enter a valid quantity." };
    const reward = getPortalDatabase().prepare("SELECT name, points_cost FROM reward_items WHERE id = ? LIMIT 1").get(rewardId) as { name: string; points_cost: number } | undefined;
    if (!reward) return { error: "That reward no longer exists." };
    const id = newId();
    requestRedemption({ id, reference: nextReference("redemption", "RDM"), technicianId: user.id, rewardId, rewardName: reward.name, pointsCost: reward.points_cost, quantity, notes: optionalText(formData, "notes") });
  } catch (error) { return { error: safeError(error, "Unable to request the reward.") }; }
  revalidatePath("/portal/rewards");
  revalidatePath("/portal/redemptions");
  redirect("/portal/rewards?saved=redemption");
}

export async function approveRedemptionAction(redemptionId: string, _: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requirePortalUser(["owner"]);
  try { approveRedemption({ redemptionId, actorId: user.id, approve: text(formData, "decision") === "approve", reason: optionalText(formData, "reason") }); } catch (error) { return { error: safeError(error, "Unable to review the redemption.") }; }
  revalidatePath("/portal/redemptions");
  revalidatePath("/portal/rewards");
  revalidatePath("/portal/points");
  redirect("/portal/redemptions?saved=reviewed");
}

export async function updateRedemptionStatusAction(redemptionId: string, _: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requirePortalUser(["owner", "manager", "staff"]);
  try { const status = z.enum(["ready", "collected", "cancelled"] as const).parse(text(formData, "status")); updateRedemptionStatus({ redemptionId, status, actorId: user.id, reason: optionalText(formData, "reason") }); } catch (error) { return { error: safeError(error, "Unable to update the redemption status.") }; }
  revalidatePath("/portal/redemptions");
  revalidatePath("/portal/rewards");
  redirect("/portal/redemptions?saved=status");
}

export async function markNotificationReadAction(notificationId: string) {
  const user = await requirePortalUser();
  markNotificationRead(notificationId, user.id);
  revalidatePath("/portal/dashboard");
}

export async function seedDevelopmentOwner() {
  if (process.env.NODE_ENV === "production" || countUsers() > 0) {
    return;
  }

  const email = normalizeEmail(process.env.PORTAL_BOOTSTRAP_EMAIL ?? "suvashshah251@gmail.com");
  const password = process.env.PORTAL_BOOTSTRAP_PASSWORD;
  const name = process.env.PORTAL_BOOTSTRAP_NAME ?? "Super Star Owner";

  if (!password) {
    return;
  }

  const userId = createUser({ email, name, role: "owner", passwordHash: await bcrypt.hash(password, 12) });
  recordActivity({ entityType: "user", entityId: userId, action: "created_development_owner", actorId: userId });
}

export async function revokePortalSessionForUser(userId: string) {
  const owner = await requirePortalUser(["owner"]);
  if (owner.id === userId) {
    return { error: "You cannot deactivate your own account." };
  }

  getPortalDatabase().prepare("UPDATE users SET is_active = 0, updated_at = ? WHERE id = ?").run(nowIso(), userId);
  recordActivity({ entityType: "user", entityId: userId, action: "deactivated", actorId: owner.id });
  revalidatePath("/portal/team");
  return { success: "Account deactivated." };
}
