import { catalogCategories as staticCategories, catalogProducts as staticProducts, catalogSyncedAt } from "@/data/catalog";
import { getProductsFromSqlite } from "@/lib/portal/queries";
import { isFirestorePortalBackend } from "@/lib/portal/backend";
import type { CatalogCategory, CatalogProduct } from "@/types/site";

function getManagedSnapshot() {
  if (isFirestorePortalBackend()) return null;
  const products = getProductsFromSqlite({ status: "published" });
  if (!products.length) return null;

  const categories = new Map<string, CatalogCategory>(staticCategories.map((category) => [category.key, category]));
  for (const product of products) {
    if (!categories.has(product.categoryKey)) {
      categories.set(product.categoryKey, {
        key: product.categoryKey,
        name: product.categoryName,
        description: `${product.categoryName} from the managed product catalog.`,
        inquiryLabel: `Ask about ${product.categoryName}`,
        sourceSummary: "Managed catalog",
      });
    }
  }

  const managedProducts: CatalogProduct[] = products.map((product) => ({
    id: product.id,
    name: product.name,
    brand: product.brand,
    model: product.model,
    categoryKey: product.categoryKey,
    categoryName: product.categoryName,
    price: product.priceDisplayMode === "contact_for_price" ? null : product.currentPrice,
    originalPrice: product.referencePrice,
    currency: "NPR",
    priceType: product.priceType,
    priceDisplayMode: product.priceDisplayMode,
    availability: product.availability,
    image: product.imagePath ?? "/brand/logo-icon.png",
    sourceUrl: product.sourceUrl ?? "",
    sourceCategory: product.sourceCategory ?? product.categoryName,
  }));

  return {
    categories: [...categories.values()],
    products: managedProducts,
    syncedAt: "Managed catalog",
  };
}

export function getCatalogSnapshot() {
  if (process.env.PORTAL_CATALOG_SOURCE !== "database") {
    return { categories: staticCategories, products: staticProducts, syncedAt: catalogSyncedAt };
  }

  try {
    return getManagedSnapshot() ?? { categories: staticCategories, products: staticProducts, syncedAt: catalogSyncedAt };
  } catch {
    return { categories: staticCategories, products: staticProducts, syncedAt: catalogSyncedAt };
  }
}

export function getPublicProductsForCategory(categoryKey: string) {
  return getCatalogSnapshot().products.filter((product) => product.categoryKey === categoryKey);
}
