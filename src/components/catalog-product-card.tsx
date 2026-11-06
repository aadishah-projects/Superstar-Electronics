import Image from "next/image";
import Link from "next/link";
import type { CatalogProduct } from "@/types/site";
import { getProductBadges, getProductSubtitle } from "@/lib/product-badges";
import { buildProductWhatsAppUrl, formatNpr } from "@/lib/urls";

interface CatalogProductCardProps {
  product: CatalogProduct;
}

export function CatalogProductCard({ product }: CatalogProductCardProps) {
  const badges = getProductBadges(product);
  const savings =
    product.originalPrice && product.price !== null && product.originalPrice > product.price
      ? product.originalPrice - product.price
      : null;
  const priceLabel = product.priceType === "mrp" ? "MRP" : "Market reference price";

  return (
    <article className="surface-card group flex min-w-0 h-full flex-col overflow-hidden">
      <Link href={`/products/${product.id}`} className="block">
        <div className="relative overflow-hidden bg-[linear-gradient(180deg,rgba(245,248,252,0.98),rgba(232,238,248,0.9))]">
          <div className="absolute inset-x-4 top-4 z-10 flex min-w-0 items-center gap-2">
            <span className="shrink-0 text-[0.62rem] font-bold uppercase tracking-[0.12em] text-[#274b78] sm:text-[0.68rem]">
              {product.brand}
            </span>
            {badges.includes("Price Drop") ? <span className="shrink-0 rounded-full bg-brand-red px-2.5 py-1 text-[0.58rem] font-bold uppercase tracking-[0.11em] text-white">Price drop</span> : null}
          </div>

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
      </Link>

      <div className="flex min-w-0 flex-1 flex-col p-4 sm:p-6">
        <p className="text-[0.64rem] font-semibold uppercase tracking-[0.11em] text-brand-blue sm:text-[0.68rem]">
          {getProductSubtitle(product)}
        </p>

        <Link href={`/products/${product.id}`} className="mt-2 block">
          <h3 className="line-clamp-2 break-words font-sans text-[1.05rem] font-semibold leading-6 tracking-[-0.01em] text-ink transition hover:text-brand-blue sm:text-[1.12rem] sm:leading-6">
            {product.name}
          </h3>
        </Link>

        <div className="mt-5 flex flex-wrap items-end gap-x-2.5 gap-y-1 sm:mt-6 sm:gap-x-3">
          <p className="font-heading text-[1.55rem] text-brand-red sm:text-3xl">{product.price === null ? "Contact for price" : formatNpr(product.price)}</p>
          {product.originalPrice && product.price !== null && product.originalPrice > product.price ? (
            <p className="text-sm text-gray-500 line-through sm:text-base">
              {formatNpr(product.originalPrice)}
            </p>
          ) : null}
          {savings ? <p className="w-full text-[0.68rem] font-semibold text-brand-red">Save {formatNpr(savings)}</p> : null}
        </div>

        <p className="mt-1 text-xs uppercase tracking-[0.18em] copy-muted">{priceLabel}</p>

        <div className="mt-4 flex flex-wrap gap-2 sm:mt-5">
          <a
            href={buildProductWhatsAppUrl(product)}
            target="_blank"
            rel="noreferrer"
            className="action-whatsapp w-full sm:w-auto"
          >
            Get Price on WhatsApp
          </a>
        </div>
      </div>
    </article>
  );
}
