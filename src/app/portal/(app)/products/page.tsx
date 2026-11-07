import Link from "next/link";
import { ProductForm } from "@/components/portal/portal-forms";
import { PortalPageHeader, formatPortalDate, formatPortalNpr, PortalStatusBadge } from "@/components/portal/portal-ui";
import { requirePortalUser } from "@/lib/portal/auth";
import { getProducts } from "@/lib/portal/queries";
import { catalogCategories } from "@/data/catalog";

export const runtime = "nodejs";

export default async function PortalProductsPage({ searchParams }: { searchParams: Promise<{ search?: string; status?: string; availability?: string; priceMode?: string; saved?: string; imported?: string }> }) {
  await requirePortalUser(["owner", "manager"]);
  const params = await searchParams;
  const products = await getProducts({ search: params.search, status: params.status, availability: params.availability, priceMode: params.priceMode });

  return (
    <div className="space-y-6">
      <PortalPageHeader eyebrow="Catalog management" title="Products" description="Manage the private product source used for quotations and, when explicitly enabled, the public catalog. Price edits are recorded in an audit history." action={<Link href="/portal/products/import" className="action-secondary">Import / export CSV</Link>} />
      {params.saved === "created" ? <p className="rounded-xl border border-brand-blue/20 bg-brand-blue/[0.06] px-4 py-3 text-sm text-brand-blue">Product added successfully.</p> : null}
      {params.imported === "success" ? <p className="rounded-xl border border-brand-blue/20 bg-brand-blue/[0.06] px-4 py-3 text-sm text-brand-blue">Product CSV imported successfully.</p> : null}
      <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <section className="surface-card p-5 sm:p-7">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-blue">Add product</p>
          <h2 className="mt-2 font-heading text-2xl tracking-tight text-ink">Create a catalog record</h2>
          <p className="mt-2 text-sm leading-6 copy-muted">Use a stable model or legacy ID where possible. Do not enter stock quantities unless the business is ready to track inventory.</p>
          <div className="mt-5"><ProductForm categories={catalogCategories.map((category) => ({ key: category.key, name: category.name }))} /></div>
        </section>

        <section className="surface-card min-w-0 p-5 sm:p-7">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div><p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-blue">Managed catalog</p><h2 className="mt-2 font-heading text-2xl tracking-tight text-ink">{products.length} products</h2></div>
            <form className="grid gap-2 sm:grid-cols-2" method="get">
              <input name="search" defaultValue={params.search} placeholder="Search name, brand, model" className="h-10 rounded-xl border border-line bg-white px-3 text-sm outline-none focus:border-brand-blue" />
              <select name="status" defaultValue={params.status ?? ""} className="h-10 rounded-xl border border-line bg-white px-3 text-sm outline-none focus:border-brand-blue"><option value="">All publication states</option><option value="draft">Draft</option><option value="published">Published</option><option value="archived">Archived</option></select>
              <select name="availability" defaultValue={params.availability ?? ""} className="h-10 rounded-xl border border-line bg-white px-3 text-sm outline-none focus:border-brand-blue"><option value="">All availability</option><option value="in_stock">In stock</option><option value="out_of_stock">Out of stock</option><option value="unavailable">Unavailable</option><option value="not_tracked">Not tracked</option></select>
              <select name="priceMode" defaultValue={params.priceMode ?? ""} className="h-10 rounded-xl border border-line bg-white px-3 text-sm outline-none focus:border-brand-blue"><option value="">All price modes</option><option value="show_price">Show price</option><option value="contact_for_price">Contact for price</option></select>
              <button type="submit" className="action-secondary">Filter</button>
            </form>
          </div>
          {products.length ? (
            <div className="mt-5 space-y-3">
              {products.map((product) => (
                <article key={product.id} className="rounded-xl border border-line bg-white p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-blue">{product.brand} · {product.model ?? "No model"}</p>
                      <h3 className="mt-1 truncate font-heading text-xl text-ink"><Link href={`/portal/products/${product.id}`} className="hover:text-brand-blue">{product.name}</Link></h3>
                      <p className="mt-1 text-sm copy-muted">{product.categoryName} · {product.priceDisplayMode === "contact_for_price" ? "Contact for price" : product.currentPrice === null ? "No price" : formatPortalNpr(product.currentPrice)}</p>
                    </div>
                    <div className="flex flex-wrap gap-2 sm:justify-end"><PortalStatusBadge value={product.publicationStatus} /><PortalStatusBadge value={product.availability} /></div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs copy-muted"><span>Unit: {product.unit}</span><span>Updated {formatPortalDate(product.updatedAt)}</span><span>{product.imagePath ? "Image set" : "No image"}</span></div>
                  <Link href={`/portal/products/${product.id}`} className="mt-4 inline-flex text-sm font-semibold text-brand-blue hover:underline">Open product record</Link>
                </article>
              ))}
            </div>
          ) : <p className="mt-6 rounded-xl border border-dashed border-line px-4 py-8 text-center text-sm copy-muted">No products match these filters.</p>}
        </section>
      </div>
    </div>
  );
}
