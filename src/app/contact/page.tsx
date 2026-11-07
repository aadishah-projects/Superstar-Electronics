import Image from "next/image";
import type { Metadata } from "next";
import { Container } from "@/components/container";
import { IconMark } from "@/components/icon-mark";
import { JsonLd } from "@/components/json-ld";
import { contactMethods, offerHighlights, siteConfig } from "@/data/site";
import { buildMetadata } from "@/lib/metadata";
import { getLocalBusinessSchema } from "@/lib/structured-data";
import { buildWhatsAppUrl, toTelHref } from "@/lib/urls";

export const metadata: Metadata = buildMetadata({
  title: "Contact CCTV & Security Experts in Chitwan",
  description:
    "Contact Super Star Electronics Industries for CCTV installation, product inquiries, quotations, and technical support in Chitwan and across Nepal.",
  path: "/contact",
  keywords: ["contact CCTV Chitwan", "WhatsApp CCTV inquiry Nepal", "security system quote Nepal"],
});

const quickInquiryOptions = [
  { title: "Ask For Price", icon: "quote" as const, href: buildWhatsAppUrl({ type: "product", subject: "current product pricing" }) },
  { title: "Installation Inquiry", icon: "tools" as const, href: buildWhatsAppUrl({ type: "service", subject: "CCTV installation" }) },
  { title: "Bulk Order", icon: "warehouse" as const, href: buildWhatsAppUrl({ type: "product", subject: "a wholesale or bulk order" }) },
  { title: "Technical Support", icon: "support" as const, href: buildWhatsAppUrl({ type: "service", subject: "technical support" }) },
];

export default async function ContactPage() {
  return (
    <>
      <JsonLd data={await getLocalBusinessSchema()} />

      <section className="px-4 pb-12 pt-8 sm:px-6 sm:pt-10 lg:px-8">
        <Container>
          <div className="grid gap-7 lg:grid-cols-[0.86fr_1.14fr] lg:items-center">
            <div>
              <p className="text-[0.66rem] font-bold uppercase tracking-[0.16em] text-[#1463d7]">Contact Super Star</p>
              <h1 className="mt-4 max-w-xl font-heading text-3xl font-semibold leading-[1.08] tracking-tight text-[#123b75] sm:text-5xl">Let&apos;s make your next space feel safer.</h1>
              <p className="mt-4 max-w-xl text-sm leading-6 text-[#718198] sm:text-base">Tell us what you are trying to protect, improve, or connect. We will help you choose the next practical step.</p>
              <div className="mt-6 flex flex-wrap gap-2.5"><a href={buildWhatsAppUrl({ type: "general" })} target="_blank" rel="noreferrer" className="action-primary">WhatsApp the team</a><a href={toTelHref(siteConfig.contact.primaryPhone)} className="action-secondary">Call {siteConfig.contact.primaryPhone}</a></div>
              <div className="mt-7 flex items-center gap-3 text-xs text-[#718198]"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#e9f3ff] text-[#1463d7]">●</span><span><strong className="font-semibold text-[#31516f]">Secure More. Connect Better.</strong><br />Ganesh Market, Narayangarh, Chitwan</span></div>
            </div>
            <div className="grid gap-3 sm:grid-cols-[1.2fr_0.8fr]">
              <div className="relative min-h-[250px] overflow-hidden rounded-2xl sm:min-h-[330px]"><Image src="/story/owner-at-podium.jpg" alt="Suvash Chandra Shah, owner of Super Star Electronics, speaking at a dealer summit" fill priority sizes="(min-width: 1024px) 45vw, 100vw" className="object-cover" /></div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-1"><div className="relative min-h-[130px] overflow-hidden rounded-2xl sm:min-h-[160px]"><Image src="/story/owner-speaking.jpg" alt="Suvash Chandra Shah, owner of Super Star Electronics, speaking at a security industry event" fill sizes="(min-width: 1024px) 25vw, 50vw" className="object-cover" /></div><div className="relative min-h-[130px] overflow-hidden rounded-2xl sm:min-h-[160px]"><Image src="/story/shop-team.jpg" alt="Super Star Electronics team in the shop" fill sizes="(min-width: 1024px) 25vw, 50vw" className="object-cover" /></div></div>
            </div>
          </div>

          <div className="mt-10 grid gap-3 md:grid-cols-2 xl:grid-cols-4">{contactMethods.map((method) => <a key={method.label} href={method.href} target={method.href.startsWith("http") ? "_blank" : undefined} rel={method.href.startsWith("http") ? "noreferrer" : undefined} className="group rounded-2xl border border-[#dce6f2] bg-white p-5 transition hover:-translate-y-0.5 hover:border-[#8cb4f7] hover:shadow-[0_10px_22px_rgba(20,67,125,0.07)]"><IconMark name={method.icon} className="h-9 w-9" /><p className="mt-4 text-[0.62rem] font-bold uppercase tracking-[0.16em] text-[#1463d7]">{method.label}</p><p className="mt-2 font-heading text-lg font-semibold text-[#234a78]">{method.value}</p><p className="mt-2 text-xs leading-5 text-[#8190a1]">{method.note}</p></a>)}</div>

          <div className="mt-12 grid gap-6 lg:grid-cols-[0.94fr_1.06fr]">
            <div className="rounded-2xl border border-[#dce6f2] bg-white p-6 sm:p-8"><div className="flex items-center gap-3"><IconMark name="clock" className="h-9 w-9" /><div><p className="text-[0.62rem] font-bold uppercase tracking-[0.16em] text-[#1463d7]">Working hours</p><p className="mt-1 font-heading text-2xl font-semibold text-[#234a78]">{siteConfig.hours.daysLabel}</p></div></div><p className="mt-4 text-sm leading-6 text-[#718198]">{siteConfig.hours.hoursLabel}. Closed on {siteConfig.hours.closedOn}. Call the main line for urgent support.</p><div className="mt-5 grid gap-2 sm:grid-cols-2">{offerHighlights.slice(0, 2).map((item) => <div key={item.title} className="rounded-xl border border-[#e4ebf3] bg-[#f7faff] p-3"><p className="text-sm font-semibold text-[#31516f]">{item.title}</p><p className="mt-1 text-xs leading-5 text-[#8190a1]">{item.detail}</p></div>)}</div><a href={toTelHref(siteConfig.contact.primaryPhone)} className="action-primary mt-5">Call {siteConfig.contact.primaryPhone}</a></div>
            <div className="rounded-2xl border border-[#dce6f2] bg-[#f2f7fd] p-6 sm:p-8"><div className="grid gap-5 sm:grid-cols-[0.72fr_1.28fr] sm:items-center"><div className="relative aspect-square overflow-hidden rounded-2xl"><Image src="/story/relationship-handover.jpg" alt="Security partners sharing a moment" fill sizes="(min-width: 640px) 20vw, 50vw" className="object-cover" /></div><div><p className="text-[0.62rem] font-bold uppercase tracking-[0.16em] text-[#1463d7]">A real conversation is the first step</p><h2 className="mt-2 font-heading text-2xl font-semibold tracking-tight text-[#1d3e68]">Ask us before you buy.</h2><p className="mt-3 text-sm leading-6 text-[#718198]">Send a photo, tell us the space, or simply ask what would work. We will help you get oriented.</p><div className="mt-4 flex flex-wrap gap-3"><a href="https://www.tiktok.com/@cctvnetworkingchitwan" target="_blank" rel="noreferrer" className="text-xs font-semibold text-[#1463d7]">Follow the team ↗</a><a href={buildWhatsAppUrl({ type: "general" })} target="_blank" rel="noreferrer" className="text-xs font-semibold text-[#1463d7]">Message us ↗</a></div></div></div></div>
          </div>

          <div className="mt-12 rounded-2xl border border-[#dce6f2] bg-white p-3 sm:p-4"><div className="overflow-hidden rounded-2xl border border-[#dce6f2] bg-[#f2f7fd]"><iframe title="Super Star Electronics Industries location map" src={siteConfig.contact.embedMapUrl} className="h-[300px] w-full border-0 sm:h-[360px]" loading="lazy" referrerPolicy="no-referrer-when-downgrade" /></div><div className="grid gap-5 p-4 sm:p-6 lg:grid-cols-[1fr_auto] lg:items-end"><div><p className="text-[0.62rem] font-bold uppercase tracking-[0.16em] text-[#1463d7]">Come by the shop</p><h2 className="mt-2 font-heading text-2xl font-semibold tracking-tight text-[#1d3e68] sm:text-3xl">Ganesh Market, Narayangarh, Chitwan.</h2><p className="mt-3 max-w-2xl text-sm leading-6 text-[#718198]">Use Google Maps for directions or message us first to confirm availability and schedule a site visit.</p></div><div className="flex flex-wrap gap-2 lg:flex-col"><a href={siteConfig.contact.mapsUrl} target="_blank" rel="noreferrer" className="action-secondary">Open in Google Maps</a><a href={buildWhatsAppUrl({ type: "general" })} target="_blank" rel="noreferrer" className="action-primary">Ask before visiting</a></div></div></div>

          <div className="mt-12"><p className="text-[0.66rem] font-bold uppercase tracking-[0.16em] text-[#1463d7]">Quick inquiry</p><h2 className="mt-2 font-heading text-2xl font-semibold tracking-tight text-[#1d3e68]">Choose what you need help with.</h2><div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{quickInquiryOptions.map((item) => <a key={item.title} href={item.href} target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-2xl border border-[#dce6f2] bg-white p-4 text-sm font-semibold text-[#31516f] transition hover:-translate-y-0.5 hover:border-[#8cb4f7]"><IconMark name={item.icon} className="h-8 w-8 shrink-0" />{item.title}</a>)}</div></div>
        </Container>
      </section>
    </>
  );
}
