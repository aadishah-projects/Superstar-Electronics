import Link from "next/link";
import { QuotationForm } from "@/components/portal/portal-forms";
import { PortalPageHeader, PortalStatusBadge, formatPortalDate, formatPortalDateTime, formatPortalNpr } from "@/components/portal/portal-ui";
import { getDefaultQuotationValidityDays, getPortalVatRate } from "@/lib/portal/config";
import { requirePortalUser } from "@/lib/portal/auth";
import { getCustomers, getProjects, getQuotations } from "@/lib/portal/queries";
import { getCatalogSnapshot } from "@/lib/catalog-source";

export const runtime = "nodejs";

export default async function PortalQuotationsPage({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  await requirePortalUser(["owner", "manager", "staff"]);
  const params = await searchParams;
  const customers = getCustomers();
  const projects = getProjects();
  const quotations = getQuotations();
  const catalogProducts = getCatalogSnapshot().products;

  return (
    <div className="space-y-6">
      <PortalPageHeader eyebrow="Commercial workflow" title="Quotations" description="Prepare a clear quote snapshot for a customer or project, show the VAT breakdown, and keep the validity period visible." />
      {params.saved === "quotation" ? <p className="rounded-xl border border-brand-blue/20 bg-brand-blue/[0.06] px-4 py-3 text-sm text-brand-blue">Quotation created successfully.</p> : null}

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <section className="surface-card p-5 sm:p-7">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-blue">New quotation</p>
          <h2 className="mt-2 font-heading text-2xl tracking-tight text-ink">Create a quote</h2>
          <p className="mt-2 text-sm leading-6 copy-muted">Choose current catalog products or add custom service lines. Prices remain editable before VAT, and each quotation stores its own line-item snapshot, subtotal, VAT, total, and validity.</p>
          <div className="mt-5"><QuotationForm customers={customers.map((customer) => ({ id: customer.id, name: customer.name, phonePrimary: customer.phonePrimary }))} projects={projects.map((project) => ({ id: project.id, customerId: project.customerId, reference: project.reference, title: project.title }))} products={catalogProducts.map((product) => ({ id: product.id, name: product.name, brand: product.brand, model: product.model, categoryName: product.categoryName, price: product.price, priceType: product.priceType, image: product.image }))} vatRate={getPortalVatRate()} validityDays={getDefaultQuotationValidityDays()} /></div>
        </section>

        <section className="surface-card min-w-0 p-5 sm:p-7">
          <div className="flex items-end justify-between gap-4">
            <div><p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-blue">Quote register</p><h2 className="mt-2 font-heading text-2xl tracking-tight text-ink">{quotations.length} quotations</h2></div>
          </div>
          {quotations.length ? (
            <div className="mt-5 space-y-3">
              {quotations.map((quotation) => (
                <article key={quotation.id} className="rounded-xl border border-line bg-white p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-blue"><Link href={`/portal/quotations/${quotation.id}`} className="hover:underline">{quotation.reference}</Link></p>
                      <h3 className="mt-1 font-heading text-xl text-ink"><Link href={`/portal/quotations/${quotation.id}`} className="hover:text-brand-blue">{quotation.customerName}</Link></h3>
                      <p className="mt-1 text-sm copy-muted">{quotation.projectReference ?? "No project linked"} · {formatPortalNpr(quotation.total)}</p>
                    </div>
                    <PortalStatusBadge value={quotation.status} />
                  </div>
                  <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm copy-muted"><span>Valid until {formatPortalDate(quotation.validUntil)}</span><span>VAT {quotation.vatRate}%</span><span>Created {formatPortalDateTime(quotation.createdAt)}</span></div>
                  <Link href={`/portal/quotations/${quotation.id}`} className="mt-4 inline-flex text-sm font-semibold text-brand-blue hover:underline">Open quotation</Link>
                </article>
              ))}
            </div>
          ) : <p className="mt-6 rounded-xl border border-dashed border-line px-4 py-8 text-center text-sm copy-muted">No quotations created yet.</p>}
        </section>
      </div>
    </div>
  );
}
