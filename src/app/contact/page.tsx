import type { Metadata } from "next";
import { Container } from "@/components/container";
import { IconMark } from "@/components/icon-mark";
import { JsonLd } from "@/components/json-ld";
import { contactMethods, siteConfig } from "@/data/site";
import { buildMetadata } from "@/lib/metadata";
import { getLocalBusinessSchema } from "@/lib/structured-data";
import { buildWhatsAppUrl, toTelHref } from "@/lib/urls";

export const metadata: Metadata = buildMetadata({
  title: "Contact",
  description:
    "Contact Super Star Electronics Industries for CCTV installation, product inquiries, quotations, and technical support in Chitwan and across Nepal.",
  path: "/contact",
  keywords: ["contact CCTV Chitwan", "WhatsApp CCTV inquiry Nepal", "security system quote Nepal"],
});

const quickInquiryOptions = [
  {
    title: "Ask For Price",
    href: buildWhatsAppUrl({
      type: "product",
      subject: "current product pricing",
    }),
  },
  {
    title: "Installation Inquiry",
    href: buildWhatsAppUrl({
      type: "service",
      subject: "CCTV installation",
    }),
  },
  {
    title: "Bulk Order",
    href: buildWhatsAppUrl({
      type: "product",
      subject: "a wholesale or bulk order",
    }),
  },
  {
    title: "Technical Support",
    href: buildWhatsAppUrl({
      type: "service",
      subject: "technical support",
    }),
  },
];

export default function ContactPage() {
  return (
    <>
      <JsonLd data={getLocalBusinessSchema()} />

      <section className="page-section pt-10 sm:pt-14">
        <Container>
          <div>
            <span className="section-kicker">Contact</span>
            <h1 className="mt-5 max-w-4xl font-heading text-3xl tracking-tight text-ink sm:text-4xl">
              Reach us directly for product questions, quotations, installation
              help, and technical support.
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-8 copy-muted sm:text-lg">
              The fastest way to get help is by phone or WhatsApp. You can also
              email us or visit the shop in Ganesh Market, Narayangarh, Chitwan.
            </p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {contactMethods.map((method) => (
              <a
                key={method.label}
                href={method.href}
                target={method.href.startsWith("http") ? "_blank" : undefined}
                rel={method.href.startsWith("http") ? "noreferrer" : undefined}
                className="surface-card block p-6 transition hover:-translate-y-1"
              >
                <IconMark name={method.icon} />
                <p className="mt-5 text-sm font-semibold uppercase tracking-[0.18em] text-brand-blue">
                  {method.label}
                </p>
                <p className="mt-2 font-heading text-xl text-ink">{method.value}</p>
                <p className="mt-3 text-sm leading-7 copy-muted">{method.note}</p>
              </a>
            ))}
          </div>

          <div className="mt-16 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="surface-card p-6 sm:p-8">
              <div className="flex items-center gap-4">
                <IconMark name="clock" />
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-blue">
                    Working Hours
                  </p>
                  <p className="mt-1 font-heading text-2xl text-ink">
                    {siteConfig.hours.daysLabel}
                  </p>
                </div>
              </div>
              <p className="mt-5 text-base leading-8 copy-muted">
                Business hours are {siteConfig.hours.hoursLabel}. The shop is closed
                on {siteConfig.hours.closedOn}. For urgent support, calling the main
                line is the fastest option.
              </p>
              <a
                href={toTelHref(siteConfig.contact.primaryPhone)}
                className="action-primary mt-6"
              >
                Call {siteConfig.contact.primaryPhone}
              </a>
            </div>

            <div className="surface-card p-6 sm:p-8">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-brand-blue">
                Quick Inquiry Shortcuts
              </p>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {quickInquiryOptions.map((item) => (
                  <a
                    key={item.title}
                    href={item.href}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-[1.5rem] border border-line bg-white p-5 text-sm font-semibold text-ink transition hover:border-brand-blue hover:text-brand-blue"
                  >
                    {item.title}
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div className="surface-card-strong mt-16 p-8 sm:p-10">
            <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-brand-blue">
                  Location
                </p>
                <h2 className="mt-3 font-heading text-3xl tracking-tight text-ink">
                  Visit us at Ganesh Market, Narayangarh, Chitwan, Nepal.
                </h2>
                <p className="mt-4 max-w-3xl text-base leading-8 copy-muted">
                  Use Google Maps for directions or contact us first if you want to
                  confirm product availability before visiting the shop.
                </p>
              </div>

              <a
                href={siteConfig.contact.mapsUrl}
                target="_blank"
                rel="noreferrer"
                className="action-secondary"
              >
                Open In Google Maps
              </a>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
