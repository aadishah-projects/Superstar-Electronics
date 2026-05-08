import rawCatalog from "@/data/quality-products.json";
import type { CatalogCategory, CatalogProduct } from "@/types/site";

interface RawCatalogPayload {
  sourceSite: string;
  syncedAt: string;
  categories: CatalogCategory[];
  products: CatalogProduct[];
}

const catalog = rawCatalog as RawCatalogPayload;

function dedupeProducts(products: CatalogProduct[]) {
  const seen = new Set<string>();
  const unique: CatalogProduct[] = [];

  for (const product of products) {
    const key = `${product.categoryKey}:${product.id}`;

    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    unique.push(product);
  }

  return unique;
}

export const catalogSourceSite = catalog.sourceSite;
export const catalogSyncedAt = catalog.syncedAt;
export const catalogCategories = catalog.categories;
export const catalogProducts = dedupeProducts(catalog.products);

export function getProductsForCategory(categoryKey: string) {
  return catalogProducts.filter((product) => product.categoryKey === categoryKey);
}

export function getFeaturedCatalogProducts(limit = 6) {
  return catalogProducts.slice(0, limit);
}
