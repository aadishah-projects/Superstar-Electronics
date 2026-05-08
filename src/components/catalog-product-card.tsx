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
          <div className="absolute left-4 top-4 z-10 flex max-w-[75%] flex-wrap gap-2">
            <span className="rounded-full bg-brand-blue px-3 py-1 text-[0.64rem] font-semibold uppercase tracking-[0.16em] text-white">
              {product.brand}
            </span>
            {badges.slice(0, 2).map((badge) => (
              <span
                key={badge}
                className={
                  badge === "Price Drop"
                    ? "rounded-full bg-brand-red px-3 py-1 text-[0.64rem] font-semibold uppercase tracking-[0.16em] text-white"
                    : "rounded-full border border-line bg-white/90 px-3 py-1 text-[0.64rem] font-semibold uppercase tracking-[0.16em] text-brand-blue"
                }
              >
                {badge}
              </span>
            ))}
          </div>

          {savings ? (
            <div className="absolute right-4 top-4 z-10 rounded-full bg-white px-3 py-1 text-[0.64rem] font-semibold uppercase tracking-[0.16em] text-brand-red shadow-[0_12px_28px_rgba(200,43,43,0.14)]">
              Save {formatNpr(savings)}
            </div>
          ) : null}

          <div className="relative aspect-[4/3] overflow-hidden">
            <Image
              src={product.image}
              alt={product.name}
              fill
              sizes="(min-width: 1280px) 25vw, (min-width: 768px) 33vw, 100vw"
              className="object-contain p-4 transition duration-300 group-hover:scale-[1.06] sm:p-6"
              unoptimized
            />
          </div>
        </div>
      </a>

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-brand-blue sm:text-[0.74rem]">
          {getProductSubtitle(product)}
        </p>

        <a
          href={buildProductWhatsAppUrl(product)}
          target="_blank"
          rel="noreferrer"
          className="mt-2 block"
        >
          <h3 className="line-clamp-2 font-heading text-xl leading-7 tracking-tight text-ink transition hover:text-brand-blue">
            {product.name}
          </h3>
        </a>

        {badges.length > 2 ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {badges.slice(2).map((badge) => (
              <span
                key={badge}
                className="rounded-full border border-line bg-surface-strong px-3 py-1 text-[0.64rem] font-semibold uppercase tracking-[0.16em] text-brand-blue"
              >
                {badge}
              </span>
            ))}
          </div>
        ) : null}

        <div className="mt-5 flex items-end gap-3">
          <p className="font-heading text-2xl text-brand-red sm:text-3xl">{formatNpr(product.price)}</p>
          {product.originalPrice && product.originalPrice > product.price ? (
            <p className="text-sm text-gray-500 line-through sm:text-base">
              {formatNpr(product.originalPrice)}
            </p>
          ) : null}
        </div>

        <p className="mt-1 text-xs uppercase tracking-[0.18em] copy-muted">{priceLabel}</p>

        <div className="mt-5 flex flex-wrap gap-2">
          <a
            href={buildProductWhatsAppUrl(product)}
            target="_blank"
            rel="noreferrer"
            className="action-accent w-full sm:w-auto"
          >
            Get Price On WhatsApp
          </a>
        </div>
      </div>
    </article>
  );
}
