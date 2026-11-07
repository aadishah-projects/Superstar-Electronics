import type { Metadata } from "next";
import Link from "next/link";
import { CustomerTicketAccessForm } from "@/components/portal/portal-forms";
import { PortalStatusBadge, formatPortalDateTime } from "@/components/portal/portal-ui";
import { Container } from "@/components/container";
import { hashToken } from "@/lib/portal/db";
import { getPublicSupportTicket } from "@/lib/portal/queries";
import { buildMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Check Support Ticket Status",
  description: "Securely check the status of a Super Star Electronics technical support request.",
  path: "/support/status",
});

export default async function SupportStatusPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const params = await searchParams;
  const ticket = params.token ? await getPublicSupportTicket(hashToken(params.token)) : undefined;

  return (
    <section className="page-section pt-10 sm:pt-14">
      <Container>
        <div className="max-w-3xl">
          <span className="section-kicker">Technical support</span>
          <h1 className="mt-5 font-heading text-3xl tracking-tight text-ink sm:text-4xl">Check your ticket status.</h1>
          <p className="mt-4 text-base leading-8 copy-muted sm:text-lg">Use the reference and phone number from your support request to open a temporary, private status view.</p>
        </div>

        {ticket ? (
          <article className="surface-card-strong mt-8 max-w-3xl p-6 sm:p-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div><p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-blue">{ticket.reference}</p><h2 className="mt-2 font-heading text-2xl text-ink">{ticket.customerName}</h2></div>
              <div className="flex flex-wrap gap-2"><PortalStatusBadge value={ticket.priority} /><PortalStatusBadge value={ticket.status} /></div>
            </div>
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <div><p className="text-xs font-semibold uppercase tracking-[0.14em] copy-muted">Issue category</p><p className="mt-1 text-sm text-ink">{ticket.category.replaceAll("-", " ")}</p></div>
              <div><p className="text-xs font-semibold uppercase tracking-[0.14em] copy-muted">Last updated</p><p className="mt-1 text-sm text-ink">{formatPortalDateTime(ticket.updatedAt)}</p></div>
              <div className="sm:col-span-2"><p className="text-xs font-semibold uppercase tracking-[0.14em] copy-muted">Your request</p><p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-ink">{ticket.description}</p></div>
              {ticket.customerUpdate ? <div className="sm:col-span-2"><p className="text-xs font-semibold uppercase tracking-[0.14em] copy-muted">Team update</p><p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-ink">{ticket.customerUpdate}</p></div> : null}
              {ticket.resolutionSummary ? <div className="sm:col-span-2"><p className="text-xs font-semibold uppercase tracking-[0.14em] copy-muted">Resolution update</p><p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-ink">{ticket.resolutionSummary}</p></div> : null}
            </div>
            <p className="mt-6 border-t border-line pt-4 text-xs copy-muted">Submitted {formatPortalDateTime(ticket.createdAt)}. Internal team notes are not shown here.</p>
            <div className="mt-6 flex flex-wrap gap-3"><Link href="/support/status" className="action-secondary">Check another ticket</Link><Link href="/support" className="action-secondary">Submit another request</Link></div>
          </article>
        ) : (
          <div className="surface-card mt-8 max-w-xl p-6 sm:p-8">
            <h2 className="font-heading text-2xl text-ink">Open a private status view</h2>
            <div className="mt-5"><CustomerTicketAccessForm /></div>
          </div>
        )}
      </Container>
    </section>
  );
}
