import { siteConfig } from "@/data/site";
import type { CatalogProduct, InquiryContext } from "@/types/site";

export function toTelHref(phone: string) {
  return `tel:${phone.replace(/\D/g, "")}`;
}

export function buildWhatsAppUrl(context: InquiryContext) {
  const greeting = "Hello Super Star Electronics Industries,";

  let message = "";

  switch (context.type) {
    case "product":
      message = `${greeting}\nI am interested in ${context.subject ?? "your products"}.\nPlease share availability, pricing, and installation options.`;
      break;
    case "service":
      message = `${greeting}\nI would like more information about ${context.subject ?? "your services"}.\nPlease let me know the process and expected cost.`;
      break;
    case "quote":
      message = `${greeting}\nI would like a quotation for ${context.subject ?? "a CCTV and security setup"}.\nPlease include suitable options, installation cost, and availability.`;
      break;
    default:
      message = `${greeting}\nI would like more information about your CCTV, security, and networking solutions.`;
      break;
  }

  if (context.details?.length) {
    message += `\n\nDetails:\n- ${context.details.join("\n- ")}`;
  }

  return `https://wa.me/${siteConfig.contact.whatsapp}?text=${encodeURIComponent(message)}`;
}

export function formatNpr(value: number) {
  return `NPR ${value.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

export function buildProductWhatsAppUrl(product: CatalogProduct) {
  const priceLabel = product.priceType === "mrp" ? "MRP" : "Reference market price";
  const details = [
    product.model ? `Model: ${product.model}` : null,
    `${priceLabel}: ${formatNpr(product.price)}`,
    `Category: ${product.categoryName}`,
  ].filter(Boolean) as string[];

  const message = buildWhatsAppUrl({
    type: "product",
    subject: product.name,
    details: [
      ...details,
      "Please share your current price",
      "Please confirm availability",
      "Please include installation cost if applicable",
    ],
  });

  return message.replace(siteConfig.contact.whatsapp, siteConfig.contact.productWhatsapp);
}
