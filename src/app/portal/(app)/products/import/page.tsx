import Link from "next/link";
import { PortalPageHeader } from "@/components/portal/portal-ui";
import { requirePortalUser } from "@/lib/portal/auth";

export const runtime = "nodejs";

export default async function PortalProductImportPage() {
  await requirePortalUser(["owner", "manager"]);

  return (
    <div className="space-y-6">
      <PortalPageHeader eyebrow="Catalog tools" title="Product updates disabled" description="The catalogue is maintained in source code so the public website has no Firestore product dependency." action={<Link href="/portal/products" className="action-secondary">Back to products</Link>} />
      <section className="surface-card max-w-3xl p-5 sm:p-7">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-blue">Code-managed catalogue</p>
        <h2 className="mt-2 font-heading text-2xl tracking-tight text-ink">Update src/data/catalog.ts</h2>
        <p className="mt-3 text-sm leading-6 copy-muted">Product creation, editing, CSV import, and export are disabled in the portal. Make product changes in the code-managed catalogue and deploy the website.</p>
        <Link href="/products" className="mt-5 inline-flex action-primary">View public catalogue</Link>
      </section>
    </div>
  );
}
