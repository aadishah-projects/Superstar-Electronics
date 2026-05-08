import Image from "next/image";
import type { CatalogProduct } from "@/types/site";
import { getProductBadges, getProductSubtitle } from "@/lib/product-badges";
import { buildProductWhatsAppUrl, formatNpr } from "@/lib/urls";

interface CatalogProductCardProps {
  product: CatalogProduct;
}

export function CatalogProductCard({ product }: CatalogProductCardProps) {
  const badges = getProductBadges(product);
  const savings =
    product.originalPrice && product.originalPrice > product.price
      ? product.originalPrice - product.price
      : null;
  const priceLabel = product.priceType === "mrp" ? "MRP" : "Market reference price";

  return (
    <article className="surface-card group flex h-full flex-col overflow-hidden">
      <a
        href={buildProductWhatsAppUrl(product)}
        target="_blank"
        rel="noreferrer"
        className="block"
      >
        <div className="relative overflow-hidden bg-[linear-gradient(180deg,rgba(245,248,252,0.98),rgba(232,238,248,0.9))]">
          <div className="absolute left-3 top-3 z-10 flex max-w-[78%] flex-wrap gap-1.5 sm:left-4 sm:top-4 sm:max-w-[75%] sm:gap-2">
            <span className="rounded-full bg-brand-blue px-2.5 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-white sm:px-3 sm:text-[0.64rem] sm:tracking-[0.16em]">
              {product.brand}
            </span>
            {badges.slice(0, 2).map((badge) => (
              <span
                key={badge}
                className={
                  badge === "Price Drop"
                    ? "rounded-full bg-brand-red px-2.5 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-white sm:px-3 sm:text-[0.64rem] sm:tracking-[0.16em]"
                    : "rounded-full border border-line bg-white/90 px-2.5 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-brand-blue sm:px-3 sm:text-[0.64rem] sm:tracking-[0.16em]"
                }
              >
                {badge}
              </span>
            ))}
          </div>

          {savings ? (
            <div className="absolute right-3 top-3 z-10 rounded-full bg-white px-2.5 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-brand-red shadow-[0_12px_28px_rgba(200,43,43,0.14)] sm:right-4 sm:top-4 sm:px-3 sm:text-[0.64rem] sm:tracking-[0.16em]">
              Save {formatNpr(savings)}
            </div>
          ) : null}

          <div className="relative aspect-[4/3] overflow-hidden">
            <Image
              src={product.image}
              alt={product.name}
              fill
              sizes="(min-width: 1280px) 25vw, (min-width: 768px) 33vw, 100vw"
              className="object-contain p-3 transition duration-300 group-hover:scale-[1.06] sm:p-6"
              unoptimized
            />
          </div>
        </div>
      </a>

      <div className="flex flex-1 flex-col p-4 sm:p-6">
        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-brand-blue sm:text-[0.74rem]">
          {getProductSubtitle(product)}
        </p>

        <a
          href={buildProductWhatsAppUrl(product)}
          target="_blank"
          rel="noreferrer"
          className="mt-2 block"
        >
          <h3 className="line-clamp-2 font-heading text-lg leading-6 tracking-tight text-ink transition hover:text-brand-blue sm:text-xl sm:leading-7">
            {product.name}
          </h3>
        </a>

        {badges.length > 2 ? (
          <div className="mt-3 flex flex-wrap gap-1.5 sm:gap-2">
            {badges.slice(2).map((badge) => (
              <span
                key={badge}
                className="rounded-full border border-line bg-surface-strong px-2.5 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-brand-blue sm:px-3 sm:text-[0.64rem] sm:tracking-[0.16em]"
              >
                {badge}
              </span>
            ))}
          </div>
        ) : null}

        <div className="mt-4 flex items-end gap-2.5 sm:mt-5 sm:gap-3">
          <p className="font-heading text-[1.55rem] text-brand-red sm:text-3xl">{formatNpr(product.price)}</p>
          {product.originalPrice && product.originalPrice > product.price ? (
            <p className="text-sm text-gray-500 line-through sm:text-base">
              {formatNpr(product.originalPrice)}
            </p>
          ) : null}
        </div>

        <p className="mt-1 text-xs uppercase tracking-[0.18em] copy-muted">{priceLabel}</p>

        <div className="mt-4 flex flex-wrap gap-2 sm:mt-5">
          <a
            href={buildProductWhatsAppUrl(product)}
            target="_blank"
            rel="noreferrer"
            className="action-accent w-full sm:w-auto"
          >
            Get Price on WhatsApp
          </a>
        </div>
      </div>
    </article>
  );
}
