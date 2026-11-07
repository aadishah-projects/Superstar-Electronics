import type { Metadata } from "next";
import { Container } from "@/components/container";
import { EzvizFeaturedCollection } from "@/components/ezviz-featured-collection";
import { ProductsCatalogBrowser } from "@/components/products-catalog-browser";
import { buildMetadata } from "@/lib/metadata";
import { getCatalogSnapshot } from "@/lib/catalog-source";
import { buildWhatsAppUrl } from "@/lib/urls";

export const metadata: Metadata = buildMetadata({ title: "Products", description: "Browse CCTV, wireless cameras, recorders, networking gear, intercoms, and access devices from Super Star Electronics.", path: "/products", keywords: ["CCTV products Chitwan", "MRP camera price Nepal", "POE switches Nepal", "video intercom Chitwan", "biometric access control Nepal"] });

export default async function ProductsPage() {
  const { categories, products, syncedAt } = await getCatalogSnapshot();
  const ezvizProducts = products.filter((product) => product.brand.toLowerCase() === "ezviz");
  return <section className="px-4 py-6 sm:px-6 lg:px-8"><Container><div className="flex flex-col gap-3 border-b border-[#dce6f2] pb-5 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-[0.68rem] font-medium text-[#8b98aa]">Home <span className="px-1">/</span> Products</p><h1 className="mt-2 font-heading text-3xl font-semibold tracking-tight text-[#1d3e68]">Product Catalogue</h1><p className="mt-2 max-w-2xl text-[0.76rem] leading-6 text-[#7d899a]">Browse real models, compare current prices, and ask for availability or installation help.</p></div><a href={buildWhatsAppUrl({ type: "product", subject: "product recommendations" })} target="_blank" rel="noreferrer" className="action-primary self-start sm:self-auto">Ask for recommendation</a></div><EzvizFeaturedCollection products={ezvizProducts} /><ProductsCatalogBrowser categories={categories} products={products} syncedAt={syncedAt} /></Container></section>;
}
