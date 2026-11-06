import type { Metadata } from "next";
import Link from "next/link";
import { SupportTicketForm } from "@/components/portal/portal-forms";
import { Container } from "@/components/container";
import { siteConfig } from "@/data/site";
import { buildMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Technical Support",
  description: "Submit a technical support request to Super Star Electronics Industries for CCTV and security system help.",
  path: "/support",
  keywords: ["CCTV technical support Chitwan", "security camera repair Nepal", "Super Star Electronics support"],
});

export default async function SupportPage({ searchParams }: { searchParams: Promise<{ submitted?: string; reference?: string }> }) {
  const params = await searchParams;

  return (
    <section className="page-section pt-10 sm:pt-14">
      <Container>
        <div className="max-w-3xl">
          <span className="section-kicker">Technical support</span>
          <h1 className="mt-5 font-heading text-3xl tracking-tight text-ink sm:text-4xl">Tell us what needs attention.</h1>
          <p className="mt-4 text-base leading-8 copy-muted sm:text-lg">Submit a support request for your CCTV or security system. We will review it and contact you using the details you provide.</p>
        </div>

        {params.submitted === "1" ? (
          <div className="surface-card-strong mt-8 max-w-3xl p-6 sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-blue">Request received</p>
            <h2 className="mt-3 font-heading text-2xl text-ink">Thank you — your support request is with our team.</h2>
            {params.reference ? <p className="mt-3 text-sm font-semibold text-brand-blue">Reference: {params.reference}</p> : null}
            <p className="mt-3 text-sm leading-7 copy-muted">Please keep your phone available. We will follow up after reviewing the issue.</p>
            <Link href="/" className="action-secondary mt-6">Back to website</Link>
          </div>
        ) : (
          <div className="mt-8 max-w-3xl surface-card p-6 sm:p-8">
            <SupportTicketForm />
            <p className="mt-5 text-xs leading-5 copy-muted">For urgent issues, you can also call {siteConfig.contact.primaryPhone}.</p>
            <Link href="/support/status" className="mt-4 inline-flex text-sm font-semibold text-brand-blue hover:underline">Already submitted a request? Check ticket status</Link>
          </div>
        )}
      </Container>
    </section>
  );
}
