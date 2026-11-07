import { unstable_cache } from "next/cache";
import { catalogCategories as staticCategories, catalogProducts as staticProducts, catalogSyncedAt } from "@/data/catalog";
import { getProductsFromSqlite } from "@/lib/portal/queries";
import { getFirestorePublishedProducts } from "@/lib/portal/firestore-data";
import { isFirestorePortalBackend } from "@/lib/portal/backend";
import type { CatalogCategory, CatalogProduct } from "@/types/site";

function buildManagedSnapshot(products: Array<{
  id: string;
  name: string;
  brand: string;
  model: string | null;
  categoryKey: string;
  categoryName: string;
  currentPrice: number | null;
  referencePrice: number | null;
  priceType: "market" | "mrp";
  priceDisplayMode: "show_price" | "contact_for_price";
  availability: "in_stock" | "out_of_stock" | "unavailable" | "not_tracked";
  imagePath: string | null;
  sourceUrl: string | null;
  sourceCategory: string | null;
}>) {
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

export async function getCatalogSnapshot() {
  const useManagedCatalog = process.env.PORTAL_CATALOG_SOURCE === "database" || isFirestorePortalBackend();
  if (!useManagedCatalog) {
    return { categories: staticCategories, products: staticProducts, syncedAt: catalogSyncedAt };
  }

  return getCachedManagedCatalogSnapshot();
}

const getCachedManagedCatalogSnapshot = unstable_cache(
  async () => {
  try {
    const products = isFirestorePortalBackend()
      ? await getFirestorePublishedProducts()
      : getProductsFromSqlite({ status: "published" });
    return buildManagedSnapshot(products) ?? { categories: staticCategories, products: staticProducts, syncedAt: catalogSyncedAt };
  } catch {
    return { categories: staticCategories, products: staticProducts, syncedAt: catalogSyncedAt };
  }
  },
  ["managed-public-catalog"],
  { revalidate: 300, tags: ["public-catalog"] },
);

export async function getPublicProductsForCategory(categoryKey: string) {
  return (await getCatalogSnapshot()).products.filter((product) => product.categoryKey === categoryKey);
}
