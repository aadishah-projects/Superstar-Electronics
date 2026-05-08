import importedCatalogData from "@/data/product-assets-catalog.json";
import qualityCatalogData from "@/data/quality-products.json";
import type { CatalogCategory, CatalogProduct } from "@/types/site";

interface RawCatalogPayload {
  sourceSite: string;
  syncedAt: string;
  categories: CatalogCategory[];
  products: CatalogProduct[];
}

const qualityCatalog = qualityCatalogData as RawCatalogPayload;
const importedCatalog = importedCatalogData as RawCatalogPayload;
const categoryOrder = [
  "cctv-cameras",
  "wireless-cameras",
  "dvr-nvr-systems",
  "routers-networking",
  "poe-gigabit-switches",
  "accessories-cables",
  "biometrics-access",
  "video-intercom",
  "monitors-displays",
  "interactive-boards",
];

function normalizeToken(value: string | null | undefined) {
  return String(value ?? "").toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function normalizeBrandName(brand: string) {
  const key = normalizeToken(brand);

  if (key === "ugreen") {
    return "UGREEN";
  }

  return brand.trim();
}

function mergeCategorySourceSummary(existing: string, incoming: string) {
  const unique = [...new Set([existing, incoming].map((value) => value.trim()).filter(Boolean))];
  return unique.join(" and ");
}

function mergeCategories(payloads: RawCatalogPayload[]) {
  const categories = new Map<string, CatalogCategory>();

  for (const payload of payloads) {
    for (const category of payload.categories) {
      const current = categories.get(category.key);

      if (!current) {
        categories.set(category.key, category);
        continue;
      }

      categories.set(category.key, {
        ...current,
        description:
          current.description.length >= category.description.length
            ? current.description
            : category.description,
        inquiryLabel: current.inquiryLabel || category.inquiryLabel,
        sourceSummary: mergeCategorySourceSummary(current.sourceSummary, category.sourceSummary),
      });
    }
  }

  return [...categories.values()].sort((left, right) => {
    const leftIndex = categoryOrder.indexOf(left.key);
    const rightIndex = categoryOrder.indexOf(right.key);

    if (leftIndex === -1 && rightIndex === -1) {
      return left.name.localeCompare(right.name);
    }

    if (leftIndex === -1) {
      return 1;
    }

    if (rightIndex === -1) {
      return -1;
    }

    return leftIndex - rightIndex;
  });
}

function normalizeProduct(product: CatalogProduct): CatalogProduct {
  return {
    ...product,
    brand: normalizeBrandName(product.brand),
  };
}

function getProductKey(product: CatalogProduct) {
  if (product.model) {
    return `model:${normalizeToken(product.model)}`;
  }

  return `name:${normalizeToken(product.brand)}:${normalizeToken(product.name)}`;
}

function getProductPriority(product: CatalogProduct) {
  let score = 0;

  if (product.priceType === "mrp") {
    score += 100;
  }

  if (product.image.startsWith("/product-assets-imported/")) {
    score += 10;
  }

  if (product.originalPrice && product.originalPrice > product.price) {
    score += 1;
  }

  return score;
}

function dedupeProducts(products: CatalogProduct[]) {
  const orderedKeys: string[] = [];
  const unique = new Map<string, CatalogProduct>();

  for (const rawProduct of products) {
    const product = normalizeProduct(rawProduct);
    const key = getProductKey(product);
    const current = unique.get(key);

    if (!current) {
      orderedKeys.push(key);
      unique.set(key, product);
      continue;
    }

    if (getProductPriority(product) > getProductPriority(current)) {
      unique.set(key, product);
    }
  }

  return orderedKeys
    .map((key) => unique.get(key))
    .filter((product): product is CatalogProduct => Boolean(product));
}

function mergeCatalogProducts(payloads: RawCatalogPayload[]) {
  return dedupeProducts(payloads.flatMap((payload) => payload.products));
}

const rawCatalogs = [qualityCatalog, importedCatalog];

export const catalogSourceSite = rawCatalogs.map((catalog) => catalog.sourceSite).join(" + ");
export const catalogSyncedAt = rawCatalogs.reduce((latest, catalog) =>
  catalog.syncedAt > latest ? catalog.syncedAt : latest,
  rawCatalogs[0]?.syncedAt ?? "",
);
export const catalogCategories = mergeCategories(rawCatalogs);
export const catalogProducts = mergeCatalogProducts(rawCatalogs);

export function getProductsForCategory(categoryKey: string) {
  return catalogProducts.filter((product) => product.categoryKey === categoryKey);
}

export function getFeaturedCatalogProducts(limit = 6) {
  return catalogProducts.slice(0, limit);
}
