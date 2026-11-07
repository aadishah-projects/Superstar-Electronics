import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductForm } from "@/components/portal/portal-forms";
import { PortalPageHeader, formatPortalDateTime, formatPortalNpr } from "@/components/portal/portal-ui";
import { catalogCategories } from "@/data/catalog";
import { requirePortalUser } from "@/lib/portal/auth";
import { getProduct, getProductPriceHistory } from "@/lib/portal/queries";

export const runtime = "nodejs";

export default async function PortalProductDetailPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string }> }) {
  await requirePortalUser(["owner", "manager"]);
  const { id } = await params;
  const query = await searchParams;
  const product = await getProduct(id);
  if (!product) notFound();
  const history = await getProductPriceHistory(id);

  return (
    <div className="space-y-6">
      <PortalPageHeader eyebrow="Catalog record" title={product.name} description={`${product.brand}${product.model ? ` · ${product.model}` : ""} · ${product.categoryName}`} action={<Link href="/portal/products" className="action-secondary">Back to products</Link>} />
      {query.saved === "updated" ? <p className="rounded-xl border border-brand-blue/20 bg-brand-blue/[0.06] px-4 py-3 text-sm text-brand-blue">Product changes saved and the price history was checked.</p> : null}
      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <section className="surface-card p-5 sm:p-7">
          <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-surface-strong">{product.imagePath ? <Image src={product.imagePath} alt={product.imageAlt ?? product.name} fill sizes="(min-width: 1280px) 35vw, 100vw" className="object-contain p-6" unoptimized /> : <p className="flex h-full items-center justify-center text-sm copy-muted">No product image set.</p>}</div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-line bg-white p-4"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-blue">Current price</p><p className="mt-2 font-heading text-2xl text-ink">{product.priceDisplayMode === "contact_for_price" ? "Contact for price" : product.currentPrice === null ? "Not set" : formatPortalNpr(product.currentPrice)}</p></div>
            <div className="rounded-xl border border-line bg-white p-4"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-blue">Reference price</p><p className="mt-2 font-heading text-2xl text-ink">{product.referencePrice === null ? "Not set" : formatPortalNpr(product.referencePrice)}</p></div>
          </div>
          {product.sourceUrl ? <a href={product.sourceUrl} target="_blank" rel="noreferrer" className="mt-4 inline-flex text-sm font-semibold text-brand-blue hover:underline">Open source reference</a> : null}
        </section>
        <section className="surface-card p-5 sm:p-7"><p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-blue">Edit product</p><h2 className="mt-2 font-heading text-2xl tracking-tight text-ink">Update catalog details</h2><div className="mt-5"><ProductForm product={product} categories={catalogCategories.map((category) => ({ key: category.key, name: category.name }))} /></div></section>
      </div>
      <section className="surface-card p-5 sm:p-7"><p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-blue">Price audit history</p><h2 className="mt-2 font-heading text-2xl tracking-tight text-ink">{history.length} recorded changes</h2>{history.length ? <div className="mt-5 space-y-3">{history.map((entry) => <article key={entry.id} className="rounded-xl border border-line bg-white p-4"><div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between"><p className="font-semibold text-ink">{entry.previousPrice === null ? "Initial price" : `${formatPortalNpr(entry.previousPrice)} → ${entry.newPrice === null ? "Contact for price" : formatPortalNpr(entry.newPrice)}`}</p><p className="text-xs copy-muted">{formatPortalDateTime(entry.createdAt)} · {entry.changedByName ?? "Imported baseline"}</p></div><p className="mt-2 text-sm copy-muted">{entry.reason ?? "No reason recorded."}</p></article>)}</div> : <p className="mt-5 rounded-xl border border-dashed border-line px-4 py-8 text-center text-sm copy-muted">No price changes recorded yet.</p>}</section>
    </div>
  );
}
