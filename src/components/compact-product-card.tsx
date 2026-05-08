import Image from "next/image";
import type { CatalogProduct } from "@/types/site";
import { buildProductWhatsAppUrl, formatNpr } from "@/lib/urls";

interface CompactProductCardProps {
  product: CatalogProduct;
}

export function CompactProductCard({ product }: CompactProductCardProps) {
  return (
    <a
      href={buildProductWhatsAppUrl(product)}
      target="_blank"
      rel="noreferrer"
      className="group flex items-center gap-4 rounded-[1.5rem] border border-line bg-white/92 p-4 transition hover:-translate-y-0.5 hover:border-brand-blue"
    >
      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-surface-strong">
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="80px"
          className="object-contain p-2 transition duration-300 group-hover:scale-105"
          unoptimized
        />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-blue">
          {product.brand}
        </p>
        <h3 className="mt-1 line-clamp-2 font-heading text-lg leading-6 text-ink transition group-hover:text-brand-blue">
          {product.name}
        </h3>
        <div className="mt-2 flex items-center justify-between gap-3">
          <p className="font-heading text-lg text-brand-red">{formatNpr(product.price)}</p>
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-blue">
            Ask Now
          </span>
        </div>
      </div>
    </a>
  );
}
