import Image from "next/image";
import type { CatalogProduct } from "@/types/site";
import { buildProductWhatsAppUrl, formatNpr } from "@/lib/urls";

interface CatalogProductCardProps {
  product: CatalogProduct;
}

export function CatalogProductCard({ product }: CatalogProductCardProps) {
  return (
    <article className="surface-card flex h-full flex-col overflow-hidden">
      <a
        href={buildProductWhatsAppUrl(product)}
        target="_blank"
        rel="noreferrer"
        className="group block"
      >
        <div className="relative aspect-square overflow-hidden bg-surface-strong">
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(min-width: 1280px) 25vw, (min-width: 768px) 33vw, 100vw"
            className="object-contain p-5 transition duration-300 group-hover:scale-[1.03]"
            unoptimized
          />
        </div>
      </a>

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-brand-blue px-3 py-1 text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-white">
            {product.brand}
          </span>
          <span className="rounded-full bg-surface px-3 py-1 text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-brand-blue">
            {product.sourceCategory}
          </span>
        </div>

        <a
          href={buildProductWhatsAppUrl(product)}
          target="_blank"
          rel="noreferrer"
          className="mt-4 block"
        >
          <h3 className="font-heading text-xl leading-7 tracking-tight text-ink transition hover:text-brand-blue">
            {product.name}
          </h3>
        </a>

        <p className="mt-3 text-sm leading-7 copy-muted">
          {product.model ? `Model: ${product.model}` : `Category: ${product.categoryName}`}
        </p>

        <div className="mt-4 flex items-end gap-3">
          <p className="font-heading text-2xl text-brand-red">{formatNpr(product.price)}</p>
          {product.originalPrice && product.originalPrice > product.price ? (
            <p className="text-sm text-gray-500 line-through">
              {formatNpr(product.originalPrice)}
            </p>
          ) : null}
        </div>

        <p className="mt-2 text-xs uppercase tracking-[0.18em] copy-muted">
          Reference price
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <a
            href={buildProductWhatsAppUrl(product)}
            target="_blank"
            rel="noreferrer"
            className="action-primary"
          >
            Ask About This Product
          </a>
        </div>
      </div>
    </article>
  );
}
