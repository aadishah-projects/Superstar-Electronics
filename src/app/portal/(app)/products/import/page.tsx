import Link from "next/link";
import { ProductImportForm } from "@/components/portal/portal-forms";
import { PortalPageHeader } from "@/components/portal/portal-ui";
import { requirePortalUser } from "@/lib/portal/auth";

export const runtime = "nodejs";

export default async function PortalProductImportPage() {
  await requirePortalUser(["owner", "manager"]);
  return (
    <div className="space-y-6">
      <PortalPageHeader eyebrow="Catalog tools" title="Import products" description="Preview a CSV file in the browser, then apply validated creates and updates as one transaction. Products missing from the file are never deleted." action={<Link href="/portal/products" className="action-secondary">Back to products</Link>} />
      <section className="surface-card max-w-3xl p-5 sm:p-7">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-blue">Validated import</p>
        <h2 className="mt-2 font-heading text-2xl tracking-tight text-ink">Upload a product CSV</h2>
        <div className="mt-5"><ProductImportForm /></div>
        <p className="mt-5 text-xs leading-5 copy-muted">Use the <Link href="/portal/products/export" className="font-semibold text-brand-blue hover:underline">current catalog export</Link> as a template. Match existing records using the stable ID or legacy ID; do not match by a vague product name.</p>
      </section>
    </div>
  );
}
