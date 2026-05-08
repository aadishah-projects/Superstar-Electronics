import type { Metadata } from "next";
import { CatalogProductCard } from "@/components/catalog-product-card";
import { Container } from "@/components/container";
import {
  catalogCategories,
  catalogProducts,
  catalogSyncedAt,
  getProductsForCategory,
} from "@/data/catalog";
import { buildMetadata } from "@/lib/metadata";
import { buildWhatsAppUrl } from "@/lib/urls";

export const metadata: Metadata = buildMetadata({
  title: "Products",
  description:
    "Browse real CCTV cameras, wireless cameras, recorders, routers, switches, accessories, and biometric products with market-reference prices.",
  path: "/products",
  keywords: [
    "CCTV products Chitwan",
    "POE switches Nepal",
    "wireless camera shop",
    "security camera price Nepal",
  ],
});

export default function ProductsPage() {
  return (
    <section className="page-section pt-10 sm:pt-14">
      <Container>
        <div>
          <span className="section-kicker">Product Categories</span>
          <h1 className="mt-5 max-w-4xl font-heading text-3xl tracking-tight text-ink sm:text-4xl">
            A clear product catalog built for inquiry, not checkout friction.
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-8 copy-muted sm:text-lg">
            Browse a real catalog snapshot with specific models and market-reference
            prices, then send a WhatsApp inquiry tied to the exact product you want.
          </p>
        </div>

        <div className="surface-card mt-10 p-6 sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-brand-blue">
                Product Catalog
              </p>
              <p className="mt-3 max-w-3xl text-base leading-8 copy-muted">
                Browse organized product sections with real models, pricing
                references, and direct inquiry actions tailored for Super Star
                Electronics Industries.
              </p>
            </div>

            <div className="rounded-[1.5rem] border border-line bg-surface-strong px-5 py-4">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-blue">
                Last Synced
              </p>
              <p className="mt-2 font-heading text-2xl text-ink">{catalogSyncedAt}</p>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            {catalogCategories.map((category) => (
              <a
                key={category.key}
                href={`#${category.key}`}
                className="rounded-full border border-line px-4 py-2 text-sm font-semibold text-ink transition hover:border-brand-blue hover:text-brand-blue"
              >
                {category.name}
              </a>
            ))}
          </div>
        </div>

        <div className="mt-12 space-y-12">
          {catalogCategories.map((category) => {
            const products = getProductsForCategory(category.key);

            return (
              <section key={category.key} id={category.key} className="scroll-mt-32">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                  <div>
                    <span className="section-kicker">{category.name}</span>
                    <h2 className="mt-5 font-heading text-3xl tracking-tight text-ink sm:text-4xl">
                      {category.description}
                    </h2>
                    <p className="mt-4 max-w-3xl text-base leading-8 copy-muted">
                      Source focus: {category.sourceSummary}. Click any product card or
                      CTA to open WhatsApp with a message specific to that exact model.
                    </p>
                  </div>

                  <div className="rounded-[1.5rem] border border-line bg-white px-5 py-4">
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-blue">
                      Products In This Section
                    </p>
                    <p className="mt-2 font-heading text-2xl text-ink">{products.length}</p>
                  </div>
                </div>

                <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {products.map((product) => (
                    <CatalogProductCard key={product.id} product={product} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>

        <div className="mt-16 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="surface-card p-6 sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-brand-blue">
              Need Help Choosing?
            </p>
            <h2 className="mt-3 font-heading text-3xl tracking-tight text-ink">
              Tell us your space, budget, or preferred brand and we can point you to
              the right category or model.
            </h2>
            <p className="mt-4 text-base leading-8 copy-muted">
              This version keeps the browsing experience clean while still showing
              real product names and prices. If you do not see the model you want,
              we can still guide you manually on WhatsApp.
            </p>

            <a
              href={buildWhatsAppUrl({
                type: "product",
                subject: "the right camera or networking setup",
                details: [
                  "Please recommend the best options for my location",
                  "Please suggest based on my budget and usage",
                ],
              })}
              target="_blank"
              rel="noreferrer"
              className="action-primary mt-6"
            >
              Ask For A Recommendation
            </a>
          </div>

          <div className="surface-card p-6 sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-brand-blue">
              Catalog Summary
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-[1.5rem] border border-line bg-white p-5">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-blue">
                  Total Products
                </p>
                <p className="mt-2 font-heading text-3xl text-ink">{catalogProducts.length}</p>
                <p className="mt-2 text-sm leading-7 copy-muted">
                  Real models grouped into clean business-friendly categories.
                </p>
              </div>
              <div className="rounded-[1.5rem] border border-line bg-white p-5">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-blue">
                  Inquiry Flow
                </p>
                <p className="mt-2 font-heading text-3xl text-ink">1 Click</p>
                <p className="mt-2 text-sm leading-7 copy-muted">
                  Each product card opens a product-specific WhatsApp message.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
