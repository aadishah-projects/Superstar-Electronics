"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Container } from "@/components/container";
import { BrandLogo } from "@/components/brand-logo";
import { navigation, services, siteConfig } from "@/data/site";
import { buildWhatsAppUrl, toTelHref } from "@/lib/urls";

export function SiteFooter() {
  const pathname = usePathname();
  if (pathname.startsWith("/portal")) return null;

  return (
    <footer className="mt-12 bg-[#123d6a] pb-8 pt-10 text-white print:hidden">
      <Container>
        <div className="grid gap-8 md:grid-cols-[1.25fr_0.75fr_0.75fr_1fr]">
          <div>
            <BrandLogo dark />
            <p className="mt-4 max-w-xs text-xs leading-6 text-white/70">Modern. Reliable. Your Security Partner in Chitwan and Beyond.</p>
            <div className="mt-5 flex gap-2"><a href={buildWhatsAppUrl({ type: "general" })} target="_blank" rel="noreferrer" className="inline-flex h-8 items-center rounded-md bg-[#0b9b9a] px-3 text-[0.68rem] font-semibold text-white">WhatsApp</a><a href={toTelHref(siteConfig.contact.primaryPhone)} className="inline-flex h-8 items-center rounded-md border border-white/25 px-3 text-[0.68rem] font-semibold text-white">Call now</a></div>
          </div>
          <div><p className="text-[0.66rem] font-bold uppercase tracking-[0.16em] text-white/55">Quick Links</p><div className="mt-3 grid gap-2 text-xs text-white/80">{navigation.map((item) => <Link key={item.href} href={item.href} className="transition hover:text-white">{item.label}</Link>)}<Link href="/portal/login" className="transition hover:text-white">Staff Portal</Link></div></div>
          <div><p className="text-[0.66rem] font-bold uppercase tracking-[0.16em] text-white/55">Our Services</p><div className="mt-3 grid gap-2 text-xs text-white/80">{services.slice(0, 4).map((service) => <Link key={service.slug} href={`/services#${service.slug}`} className="transition hover:text-white">{service.name}</Link>)}</div></div>
          <div><p className="text-[0.66rem] font-bold uppercase tracking-[0.16em] text-white/55">Contact Us</p><div className="mt-3 grid gap-2 text-xs leading-5 text-white/80"><a href={toTelHref(siteConfig.contact.primaryPhone)}>{siteConfig.contact.primaryPhone}</a><a href={siteConfig.contact.mapsUrl} target="_blank" rel="noreferrer">{siteConfig.address.street}, {siteConfig.address.locality}</a><span>{siteConfig.hours.daysLabel} · {siteConfig.hours.hoursLabel}</span></div></div>
        </div>
        <div className="mt-8 flex flex-col gap-2 border-t border-white/15 pt-5 text-[0.65rem] text-white/55 sm:flex-row sm:items-center sm:justify-between"><p>© {new Date().getFullYear()} Super Star Electronics Industries. All rights reserved.</p><p>Built for dependable security solutions.</p></div>
      </Container>
    </footer>
  );
}
