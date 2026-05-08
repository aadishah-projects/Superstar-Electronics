import { brands } from "@/data/site";

export function BrandStrip() {
  return (
    <div className="surface-card px-6 py-6 sm:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-blue">
            Trusted Brands
          </p>
          <p className="mt-2 max-w-2xl text-sm leading-7 copy-muted sm:text-base">
            We work with dependable security and networking brands so customers can
            choose the right balance of quality, features, and budget.
          </p>
        </div>
        <p className="text-sm font-medium text-brand-blue">
          Genuine products with installation and after-sales support
        </p>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {brands.map((brand) => (
          <div
            key={brand.name}
            className="rounded-2xl border border-line bg-white px-4 py-4"
          >
            <p className="font-heading text-lg text-ink">{brand.name}</p>
            <p className="mt-1 text-sm leading-6 copy-muted">{brand.specialty}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
