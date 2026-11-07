import Link from "next/link";
import { catalogCategories, catalogProducts } from "@/data/catalog";
import { PortalPageHeader, formatPortalNpr } from "@/components/portal/portal-ui";
import { requirePortalUser } from "@/lib/portal/auth";

export const runtime = "nodejs";

export default async function PortalProductsPage() {
  await requirePortalUser(["owner", "manager"]);

  return (
    <div className="space-y-6">
      <PortalPageHeader
        eyebrow="Code-managed catalogue"
        title="Products"
        description="The public catalogue is maintained in src/data/catalog.ts and deployed with the website. Staff portal editing, importing, and exporting are disabled."
        action={<Link href="/products" className="action-secondary">View public catalogue</Link>}
      />

      <section className="surface-card p-5 sm:p-7">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-blue">Published source</p>
            <h2 className="mt-2 font-heading text-2xl tracking-tight text-ink">{catalogProducts.length} products</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 copy-muted">To add, remove, or change a product, update the checked-in catalogue data and deploy a new version of the website.</p>
          </div>
          <p className="text-sm copy-muted">{catalogCategories.length} categories</p>
        </div>

        <div className="mt-5 space-y-3">
          {catalogProducts.map((product) => (
            <article key={product.id} className="rounded-xl border border-line bg-white p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-blue">{product.brand} · {product.model ?? "No model"}</p>
                  <h3 className="mt-1 truncate font-heading text-xl text-ink"><Link href={`/portal/products/${product.id}`} className="hover:text-brand-blue">{product.name}</Link></h3>
                  <p className="mt-1 text-sm copy-muted">{product.categoryName} · {product.priceDisplayMode === "contact_for_price" || product.price === null ? "Contact for price" : formatPortalNpr(product.price)}</p>
                </div>
                <span className="rounded-full bg-[#edf5ff] px-3 py-1 text-xs font-semibold text-[#1d5da8]">Read-only</span>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
