import { getProducts } from "@/lib/portal/queries";
import { requirePortalUser } from "@/lib/portal/auth";
import { productCsvHeaders, toCsvValue } from "@/lib/portal/product-csv";

export const runtime = "nodejs";

export async function GET() {
  await requirePortalUser(["owner", "manager"]);
  const products = getProducts();
  const rows = [productCsvHeaders.join(",")];
  for (const product of products) {
    rows.push([
      product.id,
      product.legacyId,
      product.name,
      product.brand,
      product.model,
      product.categoryKey,
      product.categoryName,
      product.description,
      product.specifications,
      product.imagePath,
      product.imageAlt,
      product.sourceUrl,
      product.sourceCategory,
      product.currentPrice,
      product.referencePrice,
      product.priceDisplayMode,
      product.priceType,
      product.availability,
      product.publicationStatus,
      product.unit,
      product.warrantyMonths,
    ].map((value) => toCsvValue(value)).join(","));
  }

  return new Response(`${rows.join("\n")}\n`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="superstar-products-${new Date().toISOString().slice(0, 10)}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
