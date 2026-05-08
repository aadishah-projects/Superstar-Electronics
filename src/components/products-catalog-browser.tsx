"use client";

import { useDeferredValue, useState, useTransition } from "react";
import { CatalogProductCard } from "@/components/catalog-product-card";
import { cn } from "@/lib/cn";
import type { CatalogCategory, CatalogProduct } from "@/types/site";

interface ProductsCatalogBrowserProps {
  categories: CatalogCategory[];
  products: CatalogProduct[];
  syncedAt: string;
}

const BRAND_GROUP_THRESHOLD = 12;

function normalizeSearch(value: string) {
  return value.toLowerCase().trim().replace(/\s+/g, " ");
}

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function sortProducts(products: CatalogProduct[]) {
  return [...products].sort((left, right) => {
    const byBrand = left.brand.localeCompare(right.brand);
    if (byBrand !== 0) {
      return byBrand;
    }

    const byName = left.name.localeCompare(right.name);
    if (byName !== 0) {
      return byName;
    }

    return left.price - right.price;
  });
}

function matchesSearch(product: CatalogProduct, query: string) {
  if (!query) {
    return true;
  }

  const haystack = [
    product.name,
    product.brand,
    product.model ?? "",
    product.categoryName,
    product.sourceCategory,
  ]
    .join(" ")
    .toLowerCase();

  return query.split(" ").every((term) => haystack.includes(term));
}

function buildBrandGroups(products: CatalogProduct[]) {
  const groups = new Map<string, CatalogProduct[]>();

  for (const product of sortProducts(products)) {
    const current = groups.get(product.brand) ?? [];
    current.push(product);
    groups.set(product.brand, current);
  }

  return [...groups.entries()].map(([brand, items]) => ({
    brand,
    products: items,
  }));
}

export function ProductsCatalogBrowser({
  categories,
  products,
  syncedAt,
}: ProductsCatalogBrowserProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isPending, startTransition] = useTransition();
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const normalizedQuery = normalizeSearch(deferredSearchQuery);
  const visibleProducts = products.filter((product) => matchesSearch(product, normalizedQuery));
  const visibleSections = categories
    .map((category) => ({
      category,
      products: visibleProducts.filter((product) => product.categoryKey === category.key),
    }))
    .filter((section) => section.products.length > 0);
  const mrpProductCount = products.filter((product) => product.priceType === "mrp").length;

  return (
    <>
      <div className="surface-card mt-8 p-5 sm:mt-10 sm:p-8">
        <div className="flex flex-col gap-4 sm:gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-brand-blue">
              Search The Catalog
            </p>
            <h2 className="mt-3 font-heading text-2xl leading-tight tracking-tight text-ink sm:text-3xl">
              Search by brand, model, or product name and jump straight to the right section.
            </h2>
            <p className="mt-3 text-[0.98rem] leading-7 copy-muted sm:mt-4 sm:text-base sm:leading-8">
              Large categories automatically break into brand groups, and imported supplier
              products use MRP so the website stays aligned with the latest price-list files.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div className="rounded-[1.2rem] border border-line bg-surface-strong px-4 py-3 sm:rounded-[1.5rem] sm:px-5 sm:py-4">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-blue">
                Last Synced
              </p>
              <p className="mt-2 font-heading text-xl text-ink sm:text-2xl">{syncedAt}</p>
            </div>
            <div className="rounded-[1.2rem] border border-line bg-surface-strong px-4 py-3 sm:rounded-[1.5rem] sm:px-5 sm:py-4">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-blue">
                MRP Products
              </p>
              <p className="mt-2 font-heading text-xl text-ink sm:text-2xl">{mrpProductCount}</p>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-[1.3rem] border border-line bg-white p-3.5 sm:mt-8 sm:rounded-[1.65rem] sm:p-5">
          <label
            htmlFor="product-search"
            className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-blue"
          >
            Search Products
          </label>
          <div className="mt-3 flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <svg
                aria-hidden="true"
                viewBox="0 0 20 20"
                className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-brand-blue"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="8.5" cy="8.5" r="5.5" />
                <path d="m13 13 4 4" />
              </svg>
              <input
                id="product-search"
                type="search"
                value={searchQuery}
                onChange={(event) => {
                  const nextValue = event.target.value;
                  startTransition(() => {
                    setSearchQuery(nextValue);
                  });
                }}
                placeholder="Try Hikvision, HiLook, NVR, dome camera, switch, DS-..."
                className="h-[3.25rem] w-full rounded-[1rem] border border-line bg-surface-strong pl-11 pr-4 text-[0.98rem] text-ink outline-none transition placeholder:text-gray-400 focus:border-brand-blue sm:h-14 sm:rounded-[1.2rem] sm:pl-12 sm:text-base"
              />
            </div>

            {searchQuery ? (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="action-secondary"
              >
                Clear Search
              </button>
            ) : null}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm copy-muted">
            <span>
              Showing <strong className="text-ink">{visibleProducts.length}</strong> of{" "}
              <strong className="text-ink">{products.length}</strong> products
            </span>
            <span className="hidden h-1 w-1 rounded-full bg-gray-300 sm:inline-block" />
            <span>
              <strong className="text-ink">{visibleSections.length}</strong> matching categories
            </span>
            {isPending ? (
              <>
                <span className="hidden h-1 w-1 rounded-full bg-gray-300 sm:inline-block" />
                <span>Updating results...</span>
              </>
            ) : null}
          </div>
        </div>

        <div className="scroll-row mt-5 sm:mt-6 sm:flex-wrap sm:overflow-visible sm:pb-0">
          {categories.map((category) => {
            const count = visibleProducts.filter((product) => product.categoryKey === category.key).length;

            if (count === 0) {
              return null;
            }

            return (
              <a
                key={category.key}
                href={`#${category.key}`}
                className={cn(
                  "shrink-0 whitespace-nowrap rounded-full border px-3.5 py-2 text-[0.82rem] font-semibold transition sm:px-4 sm:text-sm",
                  normalizedQuery
                    ? "border-brand-blue bg-brand-blue text-white"
                    : "border-line text-ink hover:border-brand-blue hover:text-brand-blue",
                )}
              >
                {category.name} ({count})
              </a>
            );
          })}
        </div>
      </div>

      {visibleSections.length ? (
        <div className="mt-10 space-y-10 sm:mt-12 sm:space-y-12">
          {visibleSections.map(({ category, products: categoryProducts }) => {
            const brandGroups = buildBrandGroups(categoryProducts);
            const shouldGroupByBrand =
              categoryProducts.length >= BRAND_GROUP_THRESHOLD && brandGroups.length > 1;

            return (
              <section key={category.key} id={category.key} className="scroll-mt-32">
                <div className="flex flex-col gap-3 sm:gap-4 lg:flex-row lg:items-end lg:justify-between">
                  <div>
                    <span className="section-kicker">{category.name}</span>
                    <h2 className="mt-4 font-heading text-2xl leading-tight tracking-tight text-ink sm:mt-5 sm:text-4xl">
                      {category.description}
                    </h2>
                    <p className="mt-3 max-w-3xl text-[0.98rem] leading-7 copy-muted sm:mt-4 sm:text-base sm:leading-8">
                      Source focus: {category.sourceSummary}. Search narrows results instantly,
                      and each card still opens a product-specific WhatsApp inquiry.
                    </p>
                  </div>

                  <div className="self-start rounded-[1.2rem] border border-line bg-white px-4 py-3 sm:rounded-[1.5rem] sm:px-5 sm:py-4">
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-blue">
                      Products In This Section
                    </p>
                    <p className="mt-2 font-heading text-xl text-ink sm:text-2xl">{categoryProducts.length}</p>
                  </div>
                </div>

                {shouldGroupByBrand ? (
                  <>
                    <div className="scroll-row mt-5 sm:mt-6 sm:flex-wrap sm:overflow-visible sm:pb-0">
                      {brandGroups.map((group) => (
                        <a
                          key={`${category.key}-${group.brand}`}
                          href={`#${category.key}-${slugify(group.brand)}`}
                          className="shrink-0 whitespace-nowrap rounded-full border border-line bg-white px-3.5 py-2 text-[0.82rem] font-semibold text-ink transition hover:border-brand-blue hover:text-brand-blue sm:px-4 sm:text-sm"
                        >
                          {group.brand} ({group.products.length})
                        </a>
                      ))}
                    </div>

                    <div className="mt-6 space-y-8 sm:mt-8 sm:space-y-10">
                      {brandGroups.map((group) => (
                        <div
                          key={`${category.key}-${group.brand}`}
                          id={`${category.key}-${slugify(group.brand)}`}
                          className="scroll-mt-28"
                        >
                          <div className="mb-4 flex items-center justify-between gap-4 sm:mb-5">
                            <div>
                              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-blue">
                                Brand Group
                              </p>
                              <h3 className="mt-1 font-heading text-xl tracking-tight text-ink sm:text-2xl">
                                {group.brand}
                              </h3>
                            </div>
                            <span className="rounded-full bg-surface-strong px-3.5 py-2 text-[0.82rem] font-semibold text-ink sm:px-4 sm:text-sm">
                              {group.products.length} items
                            </span>
                          </div>

                          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                            {group.products.map((product) => (
                              <CatalogProductCard key={product.id} product={product} />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="mt-6 grid gap-4 sm:mt-8 md:grid-cols-2 xl:grid-cols-3">
                    {sortProducts(categoryProducts).map((product) => (
                      <CatalogProductCard key={product.id} product={product} />
                    ))}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      ) : (
        <div className="surface-card mt-10 p-6 text-center sm:mt-12 sm:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-brand-blue">
            No Matching Products
          </p>
          <h2 className="mt-3 font-heading text-2xl tracking-tight text-ink sm:text-3xl">
            No product matched &quot;{searchQuery.trim()}&quot;.
          </h2>
          <p className="mt-3 text-[0.98rem] leading-7 copy-muted sm:mt-4 sm:text-base sm:leading-8">
            Try a broader search like a brand name, recorder type, or product family.
          </p>
          <button
            type="button"
            onClick={() => setSearchQuery("")}
            className="action-primary mt-6"
          >
            Show Full Catalog
          </button>
        </div>
      )}
    </>
  );
}
