import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/container";
import { JsonLd } from "@/components/json-ld";
import { SectionHeading } from "@/components/section-heading";
import { ServiceCard } from "@/components/service-card";
import { localServicePages } from "@/data/local-service-pages";
import { solutionPackages, services } from "@/data/site";
import { buildMetadata } from "@/lib/metadata";
import { buildWhatsAppUrl } from "@/lib/urls";
import { getServiceListSchema } from "@/lib/structured-data";

export const metadata: Metadata = buildMetadata({
  title: "CCTV Installation & Security Services in Chitwan",
  description:
    "Explore CCTV installation, repair, maintenance, networking setup, wholesale supply, and technical consultation from Super Star Electronics Industries.",
  path: "/services",
  keywords: ["CCTV installation Chitwan", "security setup Nepal", "CCTV maintenance service"],
});

export default function ServicesPage() {
  return (
    <>
      <JsonLd data={getServiceListSchema()} />
      <section className="page-section pt-10 sm:pt-14">
      <Container>
        <div>
          <span className="section-kicker">Services</span>
          <h1 className="mt-5 max-w-4xl font-heading text-3xl tracking-tight text-ink sm:text-4xl">
            Product supply backed by installation, support, and practical technical
            guidance.
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-8 copy-muted sm:text-lg">
            We help customers move from product interest to a complete working
            setup, whether the need is a simple home camera or a larger commercial
            installation.
          </p>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
          {services.map((service) => (
            <ServiceCard key={service.slug} service={service} />
          ))}
        </div>

        <div className="mt-14">
          <SectionHeading
            eyebrow="Local service guides"
            title="Start with the service that matches your question."
            description="These guides explain what we help with, who it is for, and what to expect before you contact the team."
          />
          <div className="mt-7 grid gap-4 md:grid-cols-3">
            {localServicePages.map((page) => (
              <Link key={page.path} href={page.path} className="surface-card group p-6 transition hover:-translate-y-0.5 hover:border-brand-blue">
                <p className="text-[0.66rem] font-bold uppercase tracking-[0.16em] text-brand-blue">{page.eyebrow}</p>
                <h3 className="mt-3 font-heading text-xl tracking-tight text-ink group-hover:text-brand-blue">{page.headline}</h3>
                <p className="mt-3 text-sm leading-6 copy-muted">{page.summary}</p>
                <span className="mt-5 inline-flex text-sm font-semibold text-brand-blue">Read the guide →</span>
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-16">
          <SectionHeading
            eyebrow="Popular Packages"
            title="Simple starting points for the most common customer needs."
            description="If you are not sure where to begin, these package ideas help frame the conversation before we tailor a final recommendation."
          />

          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {solutionPackages.map((item) => (
              <article key={item.title} className="surface-card p-6 sm:p-7">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-blue">
                  {item.fitFor}
                </p>
                <h3 className="mt-3 font-heading text-2xl tracking-tight text-ink">
                  {item.title}
                </h3>
                <p className="mt-4 text-sm leading-7 copy-muted sm:text-base">
                  {item.description}
                </p>
                <a
                  href={buildWhatsAppUrl({
                    type: "quote",
                    subject: item.inquiryLabel,
                  })}
                  target="_blank"
                  rel="noreferrer"
                  className="action-accent mt-8"
                >
                  Request Quote
                </a>
              </article>
            ))}
          </div>
        </div>

        <div className="surface-card-strong mt-16 p-8 sm:p-10">
          <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-brand-blue">
                After-Sales Support
              </p>
              <h2 className="mt-3 font-heading text-3xl tracking-tight text-ink">
                Installation is only the start. Reliable service matters after the
                system is running.
              </h2>
              <p className="mt-4 max-w-3xl text-base leading-8 copy-muted">
                We support maintenance, upgrades, troubleshooting, and advice so your
                surveillance and networking systems keep working the way they should.
              </p>
            </div>

            <a
              href={buildWhatsAppUrl({
                type: "service",
                subject: "repair, maintenance, or technical support",
              })}
              target="_blank"
              rel="noreferrer"
              className="action-primary"
            >
              Ask For Technical Support
            </a>
          </div>
        </div>
      </Container>
      </section>
    </>
  );
}
