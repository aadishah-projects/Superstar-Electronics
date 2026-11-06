import Link from "next/link";
import { CompactProductCard } from "@/components/compact-product-card";
import type { CatalogProduct } from "@/types/site";

export function EzvizFeaturedCollection({ products }: { products: CatalogProduct[] }) {
  if (!products.length) return null;

  return (
    <section id="ezviz" className="relative mt-6 overflow-hidden rounded-[1.75rem] bg-[#123b75] p-4 shadow-[0_18px_42px_rgba(18,59,117,0.16)] sm:mt-8 sm:p-6">
      <div aria-hidden="true" className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full border-[26px] border-white/10" />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-28 left-1/3 h-64 w-64 rounded-full bg-[#2e83d7]/25 blur-3xl" />
      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl">
          <p className="text-[0.62rem] font-bold uppercase tracking-[0.18em] text-[#b9d7ff]">Featured collection</p>
          <h2 className="mt-2 font-heading text-2xl font-semibold tracking-tight text-white sm:text-3xl">EZVIZ smart cameras</h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-white/70">Simple app-based monitoring for homes, shops, and small businesses. Start with the models customers ask about most.</p>
        </div>
        <Link href="/products#wireless-cameras" className="inline-flex shrink-0 items-center justify-center rounded-full bg-white px-4 py-2.5 text-xs font-semibold text-[#123b75] transition hover:-translate-y-0.5 hover:bg-[#eaf3ff]">Browse EZVIZ range <span aria-hidden="true" className="ml-1">→</span></Link>
      </div>
      <div className="relative mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {products.slice(0, 4).map((product) => <CompactProductCard key={product.id} product={product} />)}
      </div>
    </section>
  );
}
