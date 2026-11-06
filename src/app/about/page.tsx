import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { BrandStrip } from "@/components/brand-strip";
import { Container } from "@/components/container";
import { IconMark } from "@/components/icon-mark";
import { siteConfig, whyChooseUs } from "@/data/site";
import { buildMetadata } from "@/lib/metadata";
import { buildWhatsAppUrl } from "@/lib/urls";

export const metadata: Metadata = buildMetadata({
  title: "About Us",
  description:
    "Meet the people, partnerships, and practical security work behind Super Star Electronics Industries in Chitwan.",
  path: "/about",
  keywords: ["about CCTV company Chitwan", "security solutions provider Nepal"],
});

const businessFacts = [
  { title: "Owner", value: siteConfig.owner, icon: "support" as const },
  { title: "Working Hours", value: `${siteConfig.hours.daysLabel} | ${siteConfig.hours.hoursLabel}`, icon: "clock" as const },
  { title: "Service Area", value: siteConfig.serviceArea, icon: "map" as const },
  { title: "Warranty", value: siteConfig.warranty, icon: "shield" as const },
];

const relationshipStories = [
  {
    image: "/story/relationship-handover.jpg",
    label: "Trust is personal",
    title: "Every connection carries a promise",
    detail: "The work is built on people who keep showing up for one another — before, during, and after the sale.",
  },
  {
    image: "/story/team-portrait.jpg",
    label: "Shared learning",
    title: "Better systems start with better conversations",
    detail: "We stay close to product partners and the local network so our advice stays practical.",
  },
  {
    image: "/story/dealer-summit.jpg",
    label: "Growing together",
    title: "A local team with a wider view",
    detail: "Our Chitwan base is part of a wider security and networking community across Nepal.",
  },
] as const;

export default function AboutPage() {
  return (
    <section className="px-4 pb-12 pt-8 sm:px-6 sm:pt-10 lg:px-8">
      <Container>
        <div className="grid gap-7 lg:grid-cols-[0.86fr_1.14fr] lg:items-center">
          <div>
            <p className="text-[0.66rem] font-bold uppercase tracking-[0.16em] text-[#1463d7]">About Super Star</p>
            <h1 className="mt-4 max-w-xl font-heading text-3xl font-semibold leading-[1.08] tracking-tight text-[#123b75] sm:text-5xl">The faces behind your security setup.</h1>
            <p className="mt-4 max-w-xl text-sm leading-6 text-[#718198] sm:text-base">We are a Chitwan-based team helping homes, shops, offices, and institutions make security feel simpler — from the first question to the final handover.</p>
            <div className="mt-6 flex flex-wrap gap-2.5"><a href={buildWhatsAppUrl({ type: "general" })} target="_blank" rel="noreferrer" className="action-primary">Talk to the team</a><a href="https://www.tiktok.com/@cctvnetworkingchitwan" target="_blank" rel="noreferrer" className="action-secondary">See our field notes ↗</a></div>
          </div>
          <div className="grid grid-cols-[1.18fr_0.82fr] gap-3">
            <div className="relative min-h-[330px] overflow-hidden rounded-2xl"><Image src="/story/owner-speaking.jpg" alt="Suvash Chandra Shah, owner of Super Star Electronics, speaking at a security industry event" fill priority sizes="(min-width: 1024px) 45vw, 100vw" className="object-cover" /><div className="absolute bottom-4 left-4 rounded-xl border border-white/30 bg-[#092b56]/80 px-3 py-2 text-white shadow-lg backdrop-blur-sm"><p className="text-[0.58rem] font-bold uppercase tracking-[0.15em] text-[#b9d7ff]">Owner</p><p className="mt-1 text-sm font-semibold">Suvash Chandra Shah</p></div></div>
            <div className="grid gap-3"><div className="relative min-h-[160px] overflow-hidden rounded-2xl"><Image src="/story/owner-at-podium.jpg" alt="Suvash Chandra Shah, owner of Super Star Electronics, at a dealer summit" fill sizes="(min-width: 1024px) 25vw, 50vw" className="object-cover" /></div><div className="relative min-h-[160px] overflow-hidden rounded-2xl"><Image src="/story/shop-team.jpg" alt="Super Star Electronics team meeting in the shop" fill sizes="(min-width: 1024px) 25vw, 50vw" className="object-cover" /></div></div>
          </div>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-2xl border border-[#dce6f2] bg-white p-6 sm:p-8">
            <p className="text-[0.66rem] font-bold uppercase tracking-[0.16em] text-[#1463d7]">Our story</p>
            <h2 className="mt-2 font-heading text-2xl font-semibold tracking-tight text-[#1d3e68]">A shop, a team, and relationships that keep the work moving.</h2>
            <div className="mt-4 space-y-3 text-sm leading-6 text-[#718198]"><p>Super Star Electronics Industries is based at Ganesh Market, Narayangarh, Chitwan. We supply genuine CCTV, networking, and security products with practical installation and support.</p><p>People come to us with a concern, not a product code. Our job is to understand the space, recommend what fits, install it carefully, and stay available after the system is in use.</p></div>
            <div className="mt-6 grid gap-2 sm:grid-cols-3"><div className="rounded-xl bg-[#f2f7fd] p-3"><p className="font-heading text-xl font-semibold text-[#123b75]">01</p><p className="mt-1 text-xs text-[#718198]">Listen first</p></div><div className="rounded-xl bg-[#f2f7fd] p-3"><p className="font-heading text-xl font-semibold text-[#123b75]">02</p><p className="mt-1 text-xs text-[#718198]">Plan clearly</p></div><div className="rounded-xl bg-[#f2f7fd] p-3"><p className="font-heading text-xl font-semibold text-[#123b75]">03</p><p className="mt-1 text-xs text-[#718198]">Support after</p></div></div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {businessFacts.map((fact) => <div key={fact.title} className="rounded-2xl border border-[#dce6f2] bg-white p-5"><IconMark name={fact.icon} className="h-9 w-9" /><p className="mt-4 text-[0.62rem] font-bold uppercase tracking-[0.16em] text-[#1463d7]">{fact.title}</p><p className="mt-2 text-sm leading-5 text-[#405a77]">{fact.value}</p></div>)}
          </div>
        </div>

        <div className="mt-12"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-[0.66rem] font-bold uppercase tracking-[0.16em] text-[#1463d7]">Built through relationships</p><h2 className="mt-2 font-heading text-2xl font-semibold tracking-tight text-[#1d3e68] sm:text-3xl">The work behind the work.</h2></div><Link href="/contact" className="text-[0.7rem] font-semibold text-[#1463d7]">Start a conversation →</Link></div><div className="mt-5 grid gap-3 md:grid-cols-3">{relationshipStories.map((story) => <article key={story.title} className="group overflow-hidden rounded-2xl border border-[#dce6f2] bg-white"><div className="relative aspect-[1.18] overflow-hidden bg-[#eaf1f7]"><Image src={story.image} alt={story.title} fill sizes="(min-width: 768px) 33vw, 100vw" className="object-cover transition duration-500 group-hover:scale-105" /></div><div className="p-4"><p className="text-[0.62rem] font-bold uppercase tracking-[0.15em] text-[#1463d7]">{story.label}</p><h3 className="mt-2 font-heading text-lg font-semibold leading-6 text-[#234a78]">{story.title}</h3><p className="mt-2 text-xs leading-5 text-[#8190a1]">{story.detail}</p></div></article>)}</div></div>

        <div className="mt-12 grid gap-6 lg:grid-cols-[0.92fr_1.08fr]"><div className="rounded-2xl border border-[#dce6f2] bg-[#f2f7fd] p-6 sm:p-8"><p className="text-[0.66rem] font-bold uppercase tracking-[0.16em] text-[#1463d7]">Who we serve</p><h2 className="mt-2 font-heading text-2xl font-semibold tracking-tight text-[#1d3e68]">Practical security for real places.</h2><div className="mt-4 flex flex-wrap gap-2">{siteConfig.targetCustomers.map((customer) => <span key={customer} className="rounded-full border border-[#dce6f2] bg-white px-3 py-2 text-xs text-[#5d7089]">{customer}</span>)}</div></div><div className="rounded-2xl border border-[#dce6f2] bg-white p-6 sm:p-8"><p className="text-[0.66rem] font-bold uppercase tracking-[0.16em] text-[#1463d7]">Why customers stay with us</p><div className="mt-4 grid gap-2 sm:grid-cols-2">{whyChooseUs.slice(0, 4).map((item) => <div key={item} className="flex items-center gap-2 rounded-xl border border-[#e4ebf3] px-3 py-3 text-xs text-[#4f6178]"><IconMark name="shield" className="h-7 w-7 shrink-0" />{item}</div>)}</div></div></div>

        <div className="mt-12"><BrandStrip /></div>
      </Container>
    </section>
  );
}
