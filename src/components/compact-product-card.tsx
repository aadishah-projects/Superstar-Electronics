import Image from "next/image";
import Link from "next/link";
import type { CatalogProduct } from "@/types/site";
import { getProductBadges } from "@/lib/product-badges";
import { buildProductWhatsAppUrl, formatNpr } from "@/lib/urls";

export function CompactProductCard({ product }: { product: CatalogProduct }) {
  const badges = getProductBadges(product, 2);
  return (
    <article className="group rounded-xl border border-[#dfe8f2] bg-white p-3 transition hover:-translate-y-0.5 hover:border-[#8cb4f7] hover:shadow-[0_10px_22px_rgba(20,67,125,0.07)]">
      <Link href={`/products/${product.id}`} className="flex items-center gap-3">
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-[#f2f6fa]"><Image src={product.image} alt={product.name} fill sizes="80px" className="object-contain p-2 transition group-hover:scale-105" unoptimized /></div>
        <div className="min-w-0 flex-1"><p className="text-[0.62rem] font-bold uppercase tracking-[0.14em] text-[#1463d7]">{product.brand}</p><h3 className="mt-1 line-clamp-2 text-sm font-semibold leading-5 text-[#304a67]">{product.name}</h3>{badges.length ? <div className="mt-1 flex flex-wrap gap-1">{badges.map((badge) => <span key={badge} className="rounded bg-[#eef5ff] px-1.5 py-0.5 text-[0.55rem] font-semibold text-[#54718e]">{badge}</span>)}</div> : null}</div>
      </Link>
      <div className="mt-3 flex items-center justify-between gap-2 border-t border-[#edf1f5] pt-3"><p className="font-heading text-base font-semibold text-[#123b75]">{product.price === null ? "Contact for price" : formatNpr(product.price)}</p><a href={buildProductWhatsAppUrl(product)} target="_blank" rel="noreferrer" className="action-whatsapp">Get Price on WhatsApp</a></div>
    </article>
  );
}
