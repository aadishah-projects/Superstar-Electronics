import Link from "next/link";
import { Container } from "@/components/container";
import { JsonLd } from "@/components/json-ld";
import { siteConfig } from "@/data/site";
import type { LocalServicePage } from "@/data/local-service-pages";
import { buildWhatsAppUrl, toTelHref } from "@/lib/urls";

function getSchema(page: LocalServicePage) {
  const pageUrl = `${siteConfig.siteUrl}${page.path}`;
  const localBusinessId = `${siteConfig.siteUrl}#local-business`;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${pageUrl}#webpage`,
        url: pageUrl,
        name: page.title,
        description: page.description,
        about: { "@id": `${pageUrl}#service` },
      },
      {
        "@type": "Service",
        "@id": `${pageUrl}#service`,
        name: page.eyebrow,
        description: page.description,
        provider: { "@id": localBusinessId },
        areaServed: "Chitwan, Bharatpur, Narayangarh, Nepal",
        url: pageUrl,
      },
      {
        "@type": "FAQPage",
        mainEntity: page.faqs.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: faq.answer,
          },
        })),
      },
    ],
  };
}

export function LocalServicePage({ page }: { page: LocalServicePage }) {
  return (
    <>
      <JsonLd data={getSchema(page)} />

      <section className="px-4 pb-14 pt-8 sm:px-6 sm:pt-12 lg:px-8">
        <Container>
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
            <div>
              <p className="text-[0.68rem] font-bold uppercase tracking-[0.18em] text-brand-blue">{page.eyebrow}</p>
              <h1 className="mt-4 max-w-4xl font-heading text-3xl font-semibold leading-tight tracking-tight text-ink sm:text-5xl">{page.headline}</h1>
              <p className="mt-5 max-w-3xl text-base leading-8 copy-muted sm:text-lg">{page.intro}</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <a href={buildWhatsAppUrl({ type: "quote", subject: page.eyebrow })} target="_blank" rel="noreferrer" className="action-primary">Ask on WhatsApp</a>
                <a href={toTelHref(siteConfig.contact.primaryPhone)} className="action-secondary">Call {siteConfig.contact.primaryPhone}</a>
              </div>
            </div>

            <div className="surface-card-strong p-6 sm:p-7">
              <p className="text-[0.66rem] font-bold uppercase tracking-[0.17em] text-brand-blue">Local support</p>
              <p className="mt-3 font-heading text-2xl leading-tight text-ink">{page.summary}</p>
              <div className="mt-5 border-t border-line pt-5 text-sm leading-6 copy-muted">
                <p>{siteConfig.name}</p>
                <p>{siteConfig.address.street}, {siteConfig.address.locality}</p>
                <p>{siteConfig.hours.daysLabel} · {siteConfig.hours.hoursLabel}</p>
              </div>
            </div>
          </div>

          <div className="mt-14">
            <p className="text-[0.66rem] font-bold uppercase tracking-[0.17em] text-brand-blue">What we can help with</p>
            <h2 className="mt-3 font-heading text-2xl tracking-tight text-ink sm:text-3xl">The useful part of the service, clearly explained.</h2>
            <div className="mt-7 grid gap-4 md:grid-cols-2">
              {page.services.map((service) => (
                <article key={service.title} className="surface-card p-6">
                  <h3 className="font-heading text-xl text-ink">{service.title}</h3>
                  <p className="mt-3 text-sm leading-7 copy-muted">{service.description}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="mt-14 grid gap-7 lg:grid-cols-[0.82fr_1.18fr]">
            <div className="rounded-2xl border border-line bg-surface p-6 sm:p-8">
              <p className="text-[0.66rem] font-bold uppercase tracking-[0.17em] text-brand-blue">A good fit for</p>
              <h2 className="mt-3 font-heading text-2xl tracking-tight text-ink">Real places with real security needs.</h2>
              <div className="mt-5 flex flex-wrap gap-2">
                {page.bestFor.map((item) => <span key={item} className="rounded-full border border-line bg-white px-3 py-2 text-xs text-brand-blue">{item}</span>)}
              </div>
            </div>

            <div>
              <p className="text-[0.66rem] font-bold uppercase tracking-[0.17em] text-brand-blue">How it works</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {page.process.map((item) => (
                  <div key={item.step} className="rounded-2xl border border-line bg-white p-5">
                    <p className="font-heading text-xl font-semibold text-brand-blue">{item.step}</p>
                    <h3 className="mt-3 font-heading text-lg text-ink">{item.title}</h3>
                    <p className="mt-2 text-sm leading-6 copy-muted">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-14">
            <p className="text-[0.66rem] font-bold uppercase tracking-[0.17em] text-brand-blue">Common questions</p>
            <div className="mt-4 divide-y divide-line rounded-2xl border border-line bg-white px-5 sm:px-7">
              {page.faqs.map((faq) => (
                <details key={faq.question} className="py-5">
                  <summary className="cursor-pointer list-none pr-5 font-heading text-lg text-ink">{faq.question}</summary>
                  <p className="mt-3 max-w-3xl text-sm leading-7 copy-muted">{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>

          <div className="surface-card-strong mt-14 p-7 sm:p-10">
            <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
              <div>
                <p className="text-[0.66rem] font-bold uppercase tracking-[0.17em] text-brand-blue">Start with a conversation</p>
                <h2 className="mt-3 max-w-3xl font-heading text-2xl tracking-tight text-ink sm:text-3xl">Tell us what you need protected, repaired, or connected.</h2>
                <p className="mt-3 max-w-2xl text-sm leading-7 copy-muted">Send a photo, your location, or a short description. We will help you decide the next practical step.</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <a href={buildWhatsAppUrl({ type: "general", subject: page.eyebrow })} target="_blank" rel="noreferrer" className="action-primary">Message the team</a>
                <Link href="/services" className="action-secondary">See all services</Link>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
