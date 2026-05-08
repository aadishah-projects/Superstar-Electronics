import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/container";
import { navigation, siteConfig, whyChooseUs } from "@/data/site";
import { buildWhatsAppUrl, toTelHref } from "@/lib/urls";

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-line/80 bg-white/80 pb-24 pt-12 backdrop-blur">
      <Container>
        <div className="grid gap-10 lg:grid-cols-[1.3fr_0.7fr]">
          <div className="surface-card p-6 sm:p-8">
            <Image
              src="/brand/logo-horizontal.png"
              alt={siteConfig.name}
              width={440}
              height={190}
              className="h-auto w-[220px]"
            />
            <p className="mt-5 max-w-2xl text-sm leading-7 copy-muted sm:text-base">
              {siteConfig.description}
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href={buildWhatsAppUrl({ type: "quote", subject: "a CCTV quotation" })}
                target="_blank"
                rel="noreferrer"
                className="action-primary"
              >
                Request Quotation
              </a>
              <a
                href={toTelHref(siteConfig.contact.primaryPhone)}
                className="action-secondary"
              >
                Call {siteConfig.contact.primaryPhone}
              </a>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-1">
            <div className="surface-card p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-blue">
                Quick Links
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                {navigation.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="rounded-full border border-line px-4 py-2 text-sm font-medium text-ink transition hover:border-brand-blue hover:text-brand-blue"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>

            <div className="surface-card p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-blue">
                Why Customers Choose Us
              </p>
              <ul className="mt-4 space-y-3 text-sm leading-7 copy-muted">
                {whyChooseUs.slice(0, 4).map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-4 border-t border-line pt-6 text-sm copy-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            {siteConfig.address.street}, {siteConfig.address.locality}, {siteConfig.address.country}
          </p>
          <p>
            {siteConfig.hours.daysLabel} | {siteConfig.hours.hoursLabel} | Closed on {siteConfig.hours.closedOn}
          </p>
        </div>
      </Container>
    </footer>
  );
}
