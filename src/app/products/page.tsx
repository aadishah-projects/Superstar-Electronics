import type { Metadata } from "next";
import { Container } from "@/components/container";
import { ProductsCatalogBrowser } from "@/components/products-catalog-browser";
import { catalogCategories, catalogProducts, catalogSyncedAt } from "@/data/catalog";
import { buildMetadata } from "@/lib/metadata";
import { buildWhatsAppUrl } from "@/lib/urls";

export const metadata: Metadata = buildMetadata({
  title: "Products",
  description:
    "Browse CCTV, wireless cameras, recorders, networking gear, intercoms, and access devices with searchable categories and MRP-backed pricing.",
  path: "/products",
  keywords: [
    "CCTV products Chitwan",
    "MRP camera price Nepal",
    "POE switches Nepal",
    "video intercom Chitwan",
    "biometric access control Nepal",
  ],
});

export default function ProductsPage() {
  return (
    <section className="page-section pt-8 sm:pt-14">
      <Container>
        <div>
          <span className="section-kicker">Product Categories</span>
          <h1 className="mt-4 max-w-4xl font-heading text-2xl leading-tight tracking-tight text-ink sm:mt-5 sm:text-4xl">
            A searchable product catalog built around real models, brand grouping, and MRP-led pricing.
          </h1>
          <p className="mt-3 max-w-3xl text-[0.98rem] leading-7 copy-muted sm:mt-4 sm:text-lg sm:leading-8">
            Browse the full website catalog, including the newly imported supplier price-list
            products. Search by brand or model, explore larger sections by brand group, and
            open WhatsApp with the exact item already filled in.
          </p>
        </div>

        <ProductsCatalogBrowser
          categories={catalogCategories}
          products={catalogProducts}
          syncedAt={catalogSyncedAt}
        />

        <div className="mt-12 grid gap-5 sm:mt-16 sm:gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="surface-card p-5 sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-brand-blue">
              Need Help Choosing?
            </p>
            <h2 className="mt-3 font-heading text-2xl leading-tight tracking-tight text-ink sm:text-3xl">
              Tell us your space, budget, or preferred brand and we can point you to
              the right category or model.
            </h2>
            <p className="mt-3 text-[0.98rem] leading-7 copy-muted sm:mt-4 sm:text-base sm:leading-8">
              This version keeps browsing clean while still showing specific models and
              supplier-backed MRP pricing where available. If you do not see the exact
              product you want, we can still guide you manually on WhatsApp.
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
              className="action-primary mt-5 w-full sm:mt-6 sm:w-auto"
            >
              Ask For A Recommendation
            </a>
          </div>

          <div className="surface-card p-5 sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-brand-blue">
              Catalog Summary
            </p>
            <div className="mt-5 grid gap-3 sm:mt-6 sm:gap-4 sm:grid-cols-2">
              <div className="rounded-[1.2rem] border border-line bg-white p-4 sm:rounded-[1.5rem] sm:p-5">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-blue">
                  Total Products
                </p>
                <p className="mt-2 font-heading text-[1.75rem] text-ink sm:text-3xl">{catalogProducts.length}</p>
                <p className="mt-2 text-sm leading-7 copy-muted">
                  Combined website and supplier-list products in one searchable catalog.
                </p>
              </div>
              <div className="rounded-[1.2rem] border border-line bg-white p-4 sm:rounded-[1.5rem] sm:p-5">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-blue">
                  Inquiry Flow
                </p>
                <p className="mt-2 font-heading text-[1.75rem] text-ink sm:text-3xl">1 Click</p>
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
