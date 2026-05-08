import type { CatalogProduct } from "@/types/site";

function addBadge(badges: string[], label: string, condition: boolean) {
  if (condition && !badges.includes(label)) {
    badges.push(label);
  }
}

export function getProductBadges(product: CatalogProduct, limit = 3) {
  const text = [
    product.name,
    product.model ?? "",
    product.categoryName,
    product.sourceCategory,
  ]
    .join(" ")
    .toLowerCase();

  const badges: string[] = [];

  addBadge(badges, "Price Drop", Boolean(product.originalPrice && product.originalPrice > product.price));
  addBadge(badges, "WiFi", /\bwi-?fi\b|wireless/.test(text));
  addBadge(badges, "2K", /\b2k\b/.test(text));
  addBadge(badges, "3K", /\b3k\b/.test(text));
  addBadge(badges, "4K", /\b4k\b/.test(text));
  addBadge(badges, "Outdoor", /bullet|outdoor|perimeter/.test(text));
  addBadge(badges, "Indoor", /dome|indoor/.test(text));
  addBadge(badges, "PoE", /\bpoe\b/.test(text));
  addBadge(badges, "Smart", /smart home/.test(text));
  addBadge(badges, "Dual Lens", /dual/.test(text));
  addBadge(badges, "Access", /biometric|attendance|access/.test(text));

  return badges.slice(0, limit);
}

export function getProductSubtitle(product: CatalogProduct) {
  return product.model ? `Model ${product.model}` : product.categoryName;
}
