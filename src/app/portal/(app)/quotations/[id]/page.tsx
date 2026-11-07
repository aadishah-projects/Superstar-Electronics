import Link from "next/link";
import { notFound } from "next/navigation";
import { PrintButton } from "@/components/portal/print-button";
import { QuotationStatusForm } from "@/components/portal/portal-forms";
import { PortalActivityList, PortalPageHeader, PortalStatusBadge, formatPortalDate, formatPortalDateTime, formatPortalNpr } from "@/components/portal/portal-ui";
import { requirePortalUser } from "@/lib/portal/auth";
import { getEntityActivity, getQuotation } from "@/lib/portal/queries";

export const runtime = "nodejs";

export default async function PortalQuotationDetailPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string }> }) {
  await requirePortalUser(["owner", "manager", "staff"]);
  const { id } = await params;
  const query = await searchParams;
  const quotation = await getQuotation(id);
  if (!quotation) notFound();
  const activities = await getEntityActivity("quotation", quotation.id);

  return (
    <div className="space-y-6">
      <PortalPageHeader eyebrow={quotation.reference} title="Quotation" description={`${quotation.customerName} · valid for ${quotation.validDays} days`} action={<div className="flex flex-wrap gap-2 print:hidden"><PrintButton /><Link href="/portal/quotations" className="action-secondary">Back to quotations</Link></div>} />
      {query.saved === "status" ? <p className="rounded-xl border border-brand-blue/20 bg-brand-blue/[0.06] px-4 py-3 text-sm text-brand-blue">Quotation status updated.</p> : null}

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="surface-card print-sheet p-5 sm:p-7">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-blue">Quote snapshot</p><h2 className="mt-2 font-heading text-2xl tracking-tight text-ink">{quotation.customerName}</h2></div><PortalStatusBadge value={quotation.status} /></div>
          <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm copy-muted"><span>Created {formatPortalDateTime(quotation.createdAt)}</span><span>Valid until {formatPortalDate(quotation.validUntil)}</span>{quotation.projectId ? <Link href={`/portal/projects/${quotation.projectId}`} className="font-semibold text-brand-blue hover:underline">{quotation.projectReference}</Link> : <span>No project linked</span>}</div>
          <div className="mt-6 overflow-x-auto rounded-xl border border-line"><table className="w-full min-w-[34rem] text-left text-sm"><thead className="bg-surface-strong/60 text-xs uppercase tracking-[0.12em] copy-muted"><tr><th className="px-4 py-3">Description</th><th className="px-4 py-3">Qty</th><th className="px-4 py-3">Unit price</th><th className="px-4 py-3 text-right">Line total</th></tr></thead><tbody>{quotation.items.map((item) => <tr key={item.id} className="border-t border-line"><td className="px-4 py-3 text-ink">{item.description}</td><td className="px-4 py-3 copy-muted">{item.quantity}</td><td className="px-4 py-3 copy-muted">{formatPortalNpr(item.unitPrice)}</td><td className="px-4 py-3 text-right text-ink">{formatPortalNpr(item.lineTotal)}</td></tr>)}</tbody></table></div>
          <div className="mt-5 ml-auto max-w-sm space-y-2 text-sm"><div className="flex justify-between gap-4 copy-muted"><span>Before VAT</span><span>{formatPortalNpr(quotation.subtotal)}</span></div><div className="flex justify-between gap-4 copy-muted"><span>VAT ({quotation.vatRate}%)</span><span>{formatPortalNpr(quotation.vatAmount)}</span></div><div className="flex justify-between gap-4 border-t border-line pt-3 font-heading text-xl text-ink"><span>Total after VAT</span><span>{formatPortalNpr(quotation.total)}</span></div></div>
          {quotation.notes ? <p className="mt-6 border-t border-line pt-4 whitespace-pre-wrap text-sm leading-6 text-ink">{quotation.notes}</p> : null}
          <p className="mt-5 text-xs copy-muted">Use Print / Save PDF to create a customer-ready copy from this quotation.</p>
        </section>

        <section className="surface-card p-5 sm:p-7"><p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-blue">History</p><h2 className="mt-2 font-heading text-2xl tracking-tight text-ink">Activity</h2><div className="mt-5"><PortalActivityList activities={activities} /></div></section>
      </div>

      <section className="surface-card p-5 sm:p-7"><p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-blue">Workflow</p><h2 className="mt-2 font-heading text-2xl tracking-tight text-ink">Update quotation status</h2><p className="mt-2 text-sm leading-6 copy-muted">Keep the internal quote lifecycle separate from the customer or project record.</p><div className="mt-5 max-w-md"><QuotationStatusForm quotation={quotation} /></div></section>
    </div>
  );
}
