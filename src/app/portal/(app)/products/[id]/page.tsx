import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { catalogProducts } from "@/data/catalog";
import { PortalPageHeader, formatPortalNpr } from "@/components/portal/portal-ui";
import { requirePortalUser } from "@/lib/portal/auth";

export const runtime = "nodejs";

export default async function PortalProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePortalUser(["owner", "manager"]);
  const { id } = await params;
  const product = catalogProducts.find((item) => item.id === id);
  if (!product) notFound();

  return (
    <div className="space-y-6">
      <PortalPageHeader
        eyebrow="Code-managed catalogue"
        title={product.name}
        description={`${product.brand}${product.model ? ` · ${product.model}` : ""} · ${product.categoryName}`}
        action={<Link href="/portal/products" className="action-secondary">Back to products</Link>}
      />

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <section className="surface-card p-5 sm:p-7">
          <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-xl bg-surface-strong p-6">
            {/* The portal is read-only, so the product image is shown without an upload control. */}
            <Image src={product.image} alt={product.name} fill sizes="(min-width: 1280px) 35vw, 100vw" className="object-contain p-6" unoptimized />
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-line bg-white p-4"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-blue">Price</p><p className="mt-2 font-heading text-2xl text-ink">{product.priceDisplayMode === "contact_for_price" || product.price === null ? "Contact for price" : formatPortalNpr(product.price)}</p></div>
            <div className="rounded-xl border border-line bg-white p-4"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-blue">Availability</p><p className="mt-2 font-heading text-2xl capitalize text-ink">{(product.availability ?? "not_tracked").replaceAll("_", " ")}</p></div>
          </div>
          {product.sourceUrl ? <a href={product.sourceUrl} target="_blank" rel="noreferrer" className="mt-4 inline-flex text-sm font-semibold text-brand-blue hover:underline">Open source reference</a> : null}
        </section>

        <section className="surface-card p-5 sm:p-7">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-blue">Read-only record</p>
          <h2 className="mt-2 font-heading text-2xl tracking-tight text-ink">Update through code</h2>
          <p className="mt-3 text-sm leading-6 copy-muted">Product editing is intentionally disabled in the staff portal. Update this product in <code className="rounded bg-surface-strong px-1.5 py-0.5 text-xs">src/data/catalog.ts</code>, then deploy the website.</p>
          <Link href={`/products/${product.id}`} className="mt-5 inline-flex action-primary">View public product page</Link>
        </section>
      </div>
    </div>
  );
}
