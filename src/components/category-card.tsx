import type { ProductCategory } from "@/types/site";
import { buildWhatsAppUrl } from "@/lib/urls";

interface CategoryCardProps {
  category: ProductCategory;
}

export function CategoryCard({ category }: CategoryCardProps) {
  return (
    <article className="surface-card flex h-full flex-col p-6 sm:p-7">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-blue">
            Product Category
          </p>
          <h3 className="mt-3 font-heading text-2xl tracking-tight text-ink">
            {category.name}
          </h3>
        </div>
        <span className="rounded-full bg-brand-blue px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white">
          Inquiry
        </span>
      </div>

      <p className="mt-4 text-sm leading-7 copy-muted sm:text-base">
        {category.description}
      </p>

      <div className="mt-5">
        <p className="text-sm font-semibold text-ink">Best for</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {category.useCases.map((useCase) => (
            <span
              key={useCase}
              className="rounded-full bg-surface px-3 py-1 text-sm text-brand-blue"
            >
              {useCase}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-5">
        <p className="text-sm font-semibold text-ink">Supported brands</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {category.supportedBrands.map((brand) => (
            <span
              key={brand}
              className="rounded-full border border-line px-3 py-1 text-sm copy-muted"
            >
              {brand}
            </span>
          ))}
        </div>
      </div>

      <a
        href={buildWhatsAppUrl({
          type: "product",
          subject: category.inquiryLabel,
          details: ["Please share price", "Please share availability"],
        })}
        target="_blank"
        rel="noreferrer"
        className="action-primary mt-8"
      >
        Get More Info
      </a>
    </article>
  );
}
