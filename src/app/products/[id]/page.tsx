import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/json-ld";
import { Container } from "@/components/container";
import { IconMark } from "@/components/icon-mark";
import { getCatalogSnapshot } from "@/lib/catalog-source";
import { getProductBadges } from "@/lib/product-badges";
import { buildMetadata } from "@/lib/metadata";
import { getProductSchema } from "@/lib/structured-data";
import { buildProductWhatsAppUrl, buildWhatsAppUrl, formatNpr } from "@/lib/urls";

async function getProduct(id: string) {
  return (await getCatalogSnapshot()).products.find((product) => product.id === id);
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const product = await getProduct((await params).id);
  if (!product) return buildMetadata({ title: "Product not found", description: "The requested product could not be found.", path: "/products" });
  return buildMetadata({ title: product.name, description: `${product.name} from ${product.brand}. Ask Super Star Electronics about availability, installation, and current pricing.`, path: `/products/${product.id}` });
}

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const product = await getProduct((await params).id);
  if (!product) notFound();
  const badges = getProductBadges(product);
  const availability = product.availability === "in_stock" ? "In Stock" : product.availability === "out_of_stock" ? "Out of Stock" : "Availability on request";

  return (
    <>
      <JsonLd data={getProductSchema(product)} />
      <section className="px-4 py-6 sm:px-6 lg:px-8"><Container>
      <p className="text-[0.68rem] font-medium text-[#8b98aa]">Home <span className="px-1">/</span> {product.categoryName} <span className="px-1">/</span> {product.name}</p>
      <div className="mt-4 grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-xl border border-[#dce6f2] bg-white p-4 shadow-[0_8px_26px_rgba(20,67,125,0.05)]"><div className="relative aspect-[1.05/0.82] overflow-hidden rounded-lg bg-[#f2f6fa]"><Image src={product.image} alt={product.name} fill sizes="(min-width: 1024px) 52vw, 100vw" className="object-contain p-8 sm:p-14" priority unoptimized /></div><div className="mt-3 flex gap-2"><div className="relative h-12 w-12 overflow-hidden rounded-md border border-[#dce6f2] bg-[#f2f6fa]"><Image src={product.image} alt="Product thumbnail" fill sizes="48px" className="object-contain p-1" unoptimized /></div><div className="relative h-12 w-12 overflow-hidden rounded-md border border-[#dce6f2] bg-[#f2f6fa]"><Image src={product.image} alt="Product thumbnail" fill sizes="48px" className="object-contain p-1" unoptimized /></div></div></div>
        <div className="rounded-xl border border-[#dce6f2] bg-white p-6 shadow-[0_8px_26px_rgba(20,67,125,0.05)] sm:p-8"><div className="flex items-center justify-between gap-3"><span className="text-[0.66rem] font-bold uppercase tracking-[0.16em] text-[#1463d7]">{product.brand}</span><span className={`rounded-md px-2 py-1 text-[0.62rem] font-semibold ${product.availability === "in_stock" ? "bg-[#e5f7ee] text-[#198754]" : "bg-[#fff4db] text-[#9b6a16]"}`}>{availability}</span></div><h1 className="mt-3 font-heading text-2xl font-semibold leading-tight tracking-tight text-[#1d3e68] sm:text-3xl">{product.name}</h1>{product.model ? <p className="mt-2 text-xs text-[#8391a2]">Model: {product.model}</p> : null}<div className="mt-5 flex items-end gap-3"><p className="font-heading text-3xl font-semibold text-[#123b75]">{product.price === null ? "Contact for price" : formatNpr(product.price)}</p>{product.originalPrice && product.price !== null && product.originalPrice > product.price ? <p className="text-sm text-[#9aa5b4] line-through">{formatNpr(product.originalPrice)}</p> : null}</div><p className="mt-1 text-[0.62rem] uppercase tracking-[0.14em] text-[#8b98aa]">{product.priceType === "mrp" ? "MRP / catalogue price" : "Current market reference"}</p><div className="mt-4 flex flex-wrap gap-1.5">{badges.slice(0, 4).map((badge) => <span key={badge} className="rounded-md bg-[#eef5ff] px-2 py-1 text-[0.62rem] font-semibold text-[#54718e]">{badge}</span>)}</div><div className="mt-6 flex flex-wrap gap-2"><a href={buildProductWhatsAppUrl(product)} target="_blank" rel="noreferrer" className="action-whatsapp">Get Price on WhatsApp</a><Link href="/contact" className="action-secondary">Ask a question</Link></div><div className="mt-6 border-t border-[#edf1f5] pt-5"><p className="text-[0.66rem] font-bold uppercase tracking-[0.16em] text-[#7e8c9d]">Installation service</p><Link href="/services#cctv-installation" className="mt-2 flex items-center gap-2 rounded-lg border border-[#e2eaf3] px-3 py-3 text-xs font-semibold text-[#405a77] hover:border-[#8cb4f7] hover:text-[#1463d7]"><IconMark name="camera" className="h-7 w-7" />Need setup, mounting, or mobile viewing help?</Link></div></div>
      </div>
      <div className="mt-5 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]"><section className="rounded-xl border border-[#dce6f2] bg-white p-6"><p className="text-[0.66rem] font-bold uppercase tracking-[0.16em] text-[#1463d7]">Product details</p><h2 className="mt-2 font-heading text-xl font-semibold text-[#1d3e68]">What we know about this item</h2><div className="mt-4 grid gap-0 border-t border-[#edf1f5] text-xs sm:grid-cols-2">{[["Category", product.categoryName], ["Brand", product.brand], ["Model", product.model ?? "Not specified"], ["Availability", availability], ["Warranty", "Confirm with quotation"], ["Source", product.sourceCategory || "Managed catalog"]].map(([label, value]) => <div key={label} className="flex items-center justify-between gap-4 border-b border-[#edf1f5] py-3"><span className="text-[#8b98aa]">{label}</span><span className="text-right font-semibold text-[#405a77]">{value}</span></div>)}</div></section><section className="rounded-xl border border-[#dce6f2] bg-[#f2f7fd] p-6"><p className="text-[0.66rem] font-bold uppercase tracking-[0.16em] text-[#1463d7]">Need a complete setup?</p><h2 className="mt-2 font-heading text-xl font-semibold text-[#1d3e68]">We can recommend the right package for your space.</h2><p className="mt-3 text-sm leading-6 text-[#718096]">Tell us your location, coverage area, and budget. We can pair this product with installation, recording, networking, or after-sales support.</p><a href={buildWhatsAppUrl({ type: "quote", subject: `${product.name} and a complete installation package` })} target="_blank" rel="noreferrer" className="action-primary mt-5">Request a quotation</a></section></div>
      </Container></section>
    </>
  );
}
