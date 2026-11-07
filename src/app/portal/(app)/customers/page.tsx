import Link from "next/link";
import { CustomerForm } from "@/components/portal/portal-forms";
import { PortalPageHeader, formatPortalDate } from "@/components/portal/portal-ui";
import { requirePortalUser } from "@/lib/portal/auth";
import { getCustomers } from "@/lib/portal/queries";

export const runtime = "nodejs";

export default async function PortalCustomersPage({ searchParams }: { searchParams: Promise<{ search?: string; saved?: string }> }) {
  await requirePortalUser();
  const params = await searchParams;
  const search = params.search ?? "";
  const customers = await getCustomers(search);

  return (
    <div className="space-y-6">
      <PortalPageHeader eyebrow="Customer records" title="Customers" description="Keep contact details in one place so enquiries, projects, quotations, and service history can link back to the right person or organization." />

      {params.saved === "customer" ? <p className="rounded-xl border border-brand-blue/20 bg-brand-blue/[0.06] px-4 py-3 text-sm text-brand-blue">Customer saved successfully.</p> : null}

      <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <section className="surface-card p-5 sm:p-7">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-blue">New customer</p>
          <h2 className="mt-2 font-heading text-2xl tracking-tight text-ink">Save a contact</h2>
          <p className="mt-2 text-sm leading-6 copy-muted">A primary phone number is required. You can add more details later.</p>
          <div className="mt-5"><CustomerForm /></div>
        </section>

        <section className="surface-card min-w-0 p-5 sm:p-7">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-blue">Directory</p>
              <h2 className="mt-2 font-heading text-2xl tracking-tight text-ink">{customers.length} customers</h2>
            </div>
            <form className="flex w-full gap-2 sm:w-auto" method="get">
              <input name="search" defaultValue={search} placeholder="Search name or phone" className="h-11 min-w-0 flex-1 rounded-xl border border-line bg-white px-3 text-sm outline-none focus:border-brand-blue sm:w-56" />
              <button type="submit" className="action-secondary">Search</button>
            </form>
          </div>

          {customers.length ? (
            <div className="mt-5 space-y-3">
              {customers.map((customer) => (
                <article key={customer.id} className="rounded-xl border border-line bg-white p-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h3 className="font-heading text-xl text-ink"><Link href={`/portal/customers/${customer.id}`} className="hover:text-brand-blue">{customer.name}</Link></h3>
                      <p className="mt-1 text-sm copy-muted">{customer.businessName ?? customer.customerType} · {customer.phonePrimary}</p>
                    </div>
                    <p className="text-xs copy-muted">Added {formatPortalDate(customer.createdAt)}</p>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm copy-muted">
                    {customer.area ? <span>{customer.area}</span> : null}
                    {customer.email ? <span>{customer.email}</span> : null}
                    {customer.address ? <span>{customer.address}</span> : null}
                  </div>
                  <Link href={`/portal/customers/${customer.id}`} className="mt-4 inline-flex text-sm font-semibold text-brand-blue hover:underline">Open customer record</Link>
                </article>
              ))}
            </div>
          ) : <p className="mt-6 rounded-xl border border-dashed border-line px-4 py-8 text-center text-sm copy-muted">No customers match this search yet.</p>}
        </section>
      </div>
    </div>
  );
}
