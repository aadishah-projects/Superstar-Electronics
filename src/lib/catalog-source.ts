import { catalogCategories, catalogProducts, catalogSyncedAt } from "@/data/catalog";
import type { CatalogProduct } from "@/types/site";

/**
 * The public catalogue is intentionally code-managed. Update src/data/catalog.ts
 * and deploy when product information changes; it does not read from the staff
 * portal or Firestore.
 */
export async function getCatalogSnapshot() {
  return { categories: catalogCategories, products: catalogProducts, syncedAt: catalogSyncedAt };
}

export async function getPublicProductsForCategory(categoryKey: string) {
  return (await getCatalogSnapshot()).products.filter((product: CatalogProduct) => product.categoryKey === categoryKey);
}
