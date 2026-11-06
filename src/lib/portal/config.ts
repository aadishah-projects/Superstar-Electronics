export function getPortalVatRate() {
  const configured = Number(process.env.PORTAL_VAT_RATE ?? "13");
  return Number.isFinite(configured) && configured >= 0 ? configured : 13;
}

export function getDefaultQuotationValidityDays() {
  const configured = Number(process.env.PORTAL_QUOTATION_VALIDITY_DAYS ?? "3");
  return Number.isInteger(configured) && configured > 0 ? configured : 3;
}

export function getDefaultWarrantyMonths() {
  const configured = Number(process.env.PORTAL_WARRANTY_MONTHS ?? "12");
  return Number.isInteger(configured) && configured > 0 ? configured : 12;
}

export function getPortalToday() {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kathmandu", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

export function normalizePortalPhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("977")) return digits;
  if (digits.startsWith("0")) return `977${digits.slice(1)}`;
  if (digits.length === 10 && digits.startsWith("9")) return `977${digits}`;
  return digits;
}

export function getPortalWhatsAppHref(phone: string, message?: string) {
  const number = normalizePortalPhone(phone);
  const query = message ? `?text=${encodeURIComponent(message)}` : "";
  return `https://wa.me/${number}${query}`;
}
