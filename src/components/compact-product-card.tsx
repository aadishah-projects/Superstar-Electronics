import Image from "next/image";
import type { CatalogProduct } from "@/types/site";
import { getProductBadges } from "@/lib/product-badges";
import { buildProductWhatsAppUrl, formatNpr } from "@/lib/urls";

interface CompactProductCardProps {
  product: CatalogProduct;
}

export function CompactProductCard({ product }: CompactProductCardProps) {
  const badges = getProductBadges(product, 2);

  return (
    <a
      href={buildProductWhatsAppUrl(product)}
      target="_blank"
      rel="noreferrer"
      className="group flex items-center gap-2.5 rounded-[1rem] border border-line bg-white/94 p-2.5 transition hover:-translate-y-0.5 hover:border-brand-blue sm:gap-4 sm:rounded-[1.5rem] sm:p-4"
    >
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-[0.85rem] bg-surface-strong sm:h-[5.5rem] sm:w-[5.5rem] sm:rounded-2xl">
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="88px"
          className="object-contain p-2 transition duration-300 group-hover:scale-105"
          unoptimized
        />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.15em] text-brand-blue sm:text-xs sm:tracking-[0.18em]">
          {product.brand}
        </p>
        <h3 className="mt-1 line-clamp-2 font-heading text-[0.96rem] leading-5 text-ink transition group-hover:text-brand-blue sm:text-lg sm:leading-6">
          {product.name}
        </h3>
        {badges.length ? (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {badges.map((badge) => (
              <span
                key={badge}
                className={
                  badge === "Price Drop"
                    ? "rounded-full bg-brand-red px-2 py-0.5 text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-white"
                    : "rounded-full bg-surface px-2 py-0.5 text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-brand-blue"
                }
              >
                {badge}
              </span>
            ))}
          </div>
        ) : null}
        <div className="mt-2.5 flex items-center justify-between gap-2">
          <div className="flex items-end gap-2">
            <p className="font-heading text-lg text-brand-red sm:text-xl">{formatNpr(product.price)}</p>
            {product.originalPrice && product.originalPrice > product.price ? (
              <p className="text-xs text-gray-500 line-through">{formatNpr(product.originalPrice)}</p>
            ) : null}
          </div>
          <span className="text-[0.68rem] font-semibold uppercase tracking-[0.15em] text-brand-blue sm:text-xs sm:tracking-[0.18em]">
            Ask Price
          </span>
        </div>
      </div>
    </a>
  );
}
