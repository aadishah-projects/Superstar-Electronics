import Link from "next/link";
import { notFound } from "next/navigation";
import { EditCustomerForm } from "@/components/portal/portal-forms";
import { PortalActivityList, PortalPageHeader, formatPortalDateTime } from "@/components/portal/portal-ui";
import { requirePortalUser } from "@/lib/portal/auth";
import { getCustomer, getEntityActivity } from "@/lib/portal/queries";

export const runtime = "nodejs";

export default async function PortalCustomerDetailPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string }> }) {
  const user = await requirePortalUser();
  const { id } = await params;
  const query = await searchParams;
  const customer = getCustomer(id);
  if (!customer) notFound();
  const activities = getEntityActivity("customer", customer.id);

  return (
    <div className="space-y-6">
      <PortalPageHeader
        eyebrow="Customer record"
        title={customer.name}
        description={`${customer.businessName ?? customer.customerType} · ${customer.phonePrimary}`}
        action={<Link href="/portal/customers" className="action-secondary">Back to customers</Link>}
      />

      {query.saved === "customer" ? <p className="rounded-xl border border-brand-blue/20 bg-brand-blue/[0.06] px-4 py-3 text-sm text-brand-blue">Customer updated successfully.</p> : null}

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="surface-card p-5 sm:p-7">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-blue">Contact details</p>
              <h2 className="mt-2 font-heading text-2xl tracking-tight text-ink">Profile</h2>
            </div>
            <p className="text-xs copy-muted">Added {formatPortalDateTime(customer.createdAt)}</p>
          </div>
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <div><p className="text-xs font-semibold uppercase tracking-[0.14em] copy-muted">Primary phone</p><p className="mt-1 text-sm text-ink">{customer.phonePrimary}</p></div>
            <div><p className="text-xs font-semibold uppercase tracking-[0.14em] copy-muted">Secondary phone</p><p className="mt-1 text-sm text-ink">{customer.phoneSecondary ?? "Not set"}</p></div>
            <div><p className="text-xs font-semibold uppercase tracking-[0.14em] copy-muted">Email</p><p className="mt-1 text-sm text-ink">{customer.email ?? "Not set"}</p></div>
            <div><p className="text-xs font-semibold uppercase tracking-[0.14em] copy-muted">Area / locality</p><p className="mt-1 text-sm text-ink">{customer.area ?? "Not set"}</p></div>
            <div className="sm:col-span-2"><p className="text-xs font-semibold uppercase tracking-[0.14em] copy-muted">Address</p><p className="mt-1 text-sm text-ink">{customer.address ?? "Not set"}</p></div>
            <div className="sm:col-span-2"><p className="text-xs font-semibold uppercase tracking-[0.14em] copy-muted">Notes</p><p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-ink">{customer.notes ?? "No notes added."}</p></div>
          </div>
        </section>

        <section className="surface-card p-5 sm:p-7">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-blue">History</p>
          <h2 className="mt-2 font-heading text-2xl tracking-tight text-ink">Activity</h2>
          <div className="mt-5"><PortalActivityList activities={activities} /></div>
        </section>
      </div>

      {user.role === "owner" || user.role === "manager" || user.role === "staff" ? (
        <section className="surface-card p-5 sm:p-7">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-blue">Maintain record</p>
          <h2 className="mt-2 font-heading text-2xl tracking-tight text-ink">Edit customer</h2>
          <p className="mt-2 text-sm leading-6 copy-muted">Update contact details as the relationship develops. Changes are recorded in the activity history.</p>
          <div className="mt-5"><EditCustomerForm customer={customer} /></div>
        </section>
      ) : null}
    </div>
  );
}
