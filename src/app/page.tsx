import Image from "next/image";
import Link from "next/link";
import { BrandStrip } from "@/components/brand-strip";
import { CompactProductCard } from "@/components/compact-product-card";
import { Container } from "@/components/container";
import { IconMark } from "@/components/icon-mark";
import { JsonLd } from "@/components/json-ld";
import { ServiceCard } from "@/components/service-card";
import { customerScenarios, offerHighlights, services, siteConfig, whyChooseUs } from "@/data/site";
import { getCatalogSnapshot } from "@/lib/catalog-source";
import { buildWhatsAppUrl, toTelHref } from "@/lib/urls";
import { getLocalBusinessSchema, getOrganizationSchema, getWebSiteSchema } from "@/lib/structured-data";

const categoryHighlights: Record<string, string> = {
  "cctv-cameras": "Indoor & outdoor coverage",
  "wireless-cameras": "App-based monitoring",
  "dvr-nvr-systems": "Central recording",
  "routers-networking": "Stable connectivity",
  "poe-gigabit-switches": "Camera power & switching",
  "accessories-cables": "Cables, power & adapters",
  "biometrics-access": "Attendance & access control",
  "video-intercom": "Door entry & monitors",
  "monitors-displays": "Viewing & display screens",
  "interactive-boards": "Classroom & meeting displays",
};
const storyMoments = [
  {
    image: "/story/installed-system.jpg",
    label: "After the install",
    title: "A working system, not just a box",
    detail: "We help customers get cameras online, connected, and easy to check from the phone.",
  },
  {
    image: "/story/dealer-partners.jpg",
    label: "The people behind the work",
    title: "Relationships matter in security",
    detail: "Good products and dependable local relationships make support easier when it matters.",
  },
  {
    image: "/story/network-visit.jpg",
    label: "Always learning",
    title: "From Chitwan to the wider network",
    detail: "We keep learning from partners, sites, and the people who use these systems every day.",
  },
] as const;

export default async function HomePage() {
  const catalog = await getCatalogSnapshot();
  const categories = catalog.categories
    .map((category) => ({
      ...category,
      products: catalog.products.filter((product) => product.categoryKey === category.key),
    }))
    .filter((category) => category.products.length);
  const featuredProducts = catalog.products
    .filter((product) => product.categoryKey === "wireless-cameras")
    .slice(0, 3);
  const localBusinessSchema = await getLocalBusinessSchema(catalog.products);
  return (
    <>
      <JsonLd data={getOrganizationSchema()} />
      <JsonLd data={getWebSiteSchema()} />
      <JsonLd data={localBusinessSchema} />

      <section className="pb-6 pt-0">
        <Container fullBleed className="overflow-hidden border-y border-[#dce6f2] bg-white shadow-[0_12px_35px_rgba(25,65,115,0.07)]">
          <div className="grid lg:grid-cols-[0.92fr_1.08fr]">
            <div className="flex flex-col justify-center bg-[#f2f7fd] p-5 sm:p-10 lg:p-12">
              <div className="flex items-center gap-2 text-[0.68rem] font-bold uppercase tracking-[0.16em] text-[#1463d7]"><span className="h-1.5 w-1.5 rounded-full bg-[#1fa36b]" />Ganesh Market · Narayangarh</div>
              <h1 className="mt-4 max-w-xl font-heading text-[2.05rem] font-semibold leading-[1.05] tracking-tight text-[#123b75] sm:text-5xl">Security that starts with a conversation.</h1>
              <p className="mt-4 max-w-lg text-sm leading-6 text-[#66788f] sm:text-base">From a first question at our shop to a system that works at home, in a store, or across an office — Super Star Electronics is here for the whole journey.</p>
              <div className="mt-5 flex flex-wrap gap-2.5"><a href={buildWhatsAppUrl({ type: "quote", subject: "a CCTV quotation" })} target="_blank" rel="noreferrer" className="action-primary">Start a conversation</a><Link href="/products" className="action-secondary">Explore products</Link></div>
              <div className="mt-8 grid max-w-lg grid-cols-3 gap-3 border-t border-[#d7e3ef] pt-5"><div><p className="font-heading text-lg font-semibold text-[#123b75]">01</p><p className="mt-1 text-[0.68rem] leading-4 text-[#708198]">Tell us what needs protecting</p></div><div><p className="font-heading text-lg font-semibold text-[#123b75]">02</p><p className="mt-1 text-[0.68rem] leading-4 text-[#708198]">Plan the right coverage</p></div><div><p className="font-heading text-lg font-semibold text-[#123b75]">03</p><p className="mt-1 text-[0.68rem] leading-4 text-[#708198]">Keep it running after install</p></div></div>
            </div>
            <div className="relative min-h-[300px] overflow-hidden bg-[#dfeaf3] sm:min-h-[440px]">
              <Image src="/story/owner-speaking.jpg" alt="Suvash Chandra Shah, owner of Super Star Electronics, speaking at a security industry event" fill priority sizes="(min-width: 1024px) 55vw, 100vw" className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#092b56]/75 via-transparent to-[#092b56]/5" />
              <div className="absolute bottom-5 left-5 max-w-[18rem] rounded-xl border border-white/30 bg-[#092b56]/80 px-4 py-3 text-white shadow-lg backdrop-blur-sm sm:bottom-7 sm:left-7"><p className="text-[0.62rem] font-bold uppercase tracking-[0.16em] text-[#b9d7ff]">The story starts here</p><p className="mt-1 text-sm font-medium leading-5">Real people, real products, and support that stays close to the customer.</p></div>
              <div className="absolute right-4 top-4 h-20 w-20 overflow-hidden rounded-xl border-4 border-white bg-white shadow-lg sm:right-7 sm:top-7 sm:h-32 sm:w-32"><Image src="/story/owner-at-podium.jpg" alt="Suvash Chandra Shah, owner of Super Star Electronics, at a dealer summit" fill sizes="128px" className="object-cover" /></div>
            </div>
          </div>
          <div className="grid grid-cols-2 border-t border-[#dce6f2] sm:grid-cols-4">{offerHighlights.slice(0, 4).map((item) => <div key={item.title} className="flex items-center gap-2 border-b border-[#e8eef5] px-3 py-3 last:border-b-0 sm:gap-2.5 sm:px-4 sm:py-3 sm:border-b-0 sm:border-r sm:last:border-r-0"><IconMark name={item.icon} className="h-7 w-7 shrink-0 sm:h-8 sm:w-8" /><div><p className="text-[0.64rem] font-semibold text-[#234a78] sm:text-[0.68rem]">{item.title}</p><p className="mt-0.5 text-[0.57rem] leading-4 text-[#8190a1] sm:text-[0.6rem]">{item.detail}</p></div></div>)}</div>
        </Container>
      </section>

      <section className="px-4 py-7 sm:px-6 lg:px-8"><Container className="grid gap-6 lg:grid-cols-[0.84fr_1.16fr] lg:items-center"><div><p className="text-[0.66rem] font-bold uppercase tracking-[0.16em] text-[#1463d7]">More than a product counter</p><h2 className="mt-2 max-w-xl font-heading text-2xl font-semibold tracking-tight text-[#1d3e68] sm:text-3xl">We turn a security concern into a system you can trust.</h2><p className="mt-3 max-w-xl text-sm leading-6 text-[#75849a]">Super Star Electronics is a Chitwan-based team. We listen first, match the right products to the space, install carefully, and stay available when the system needs attention.</p><div className="mt-5 grid gap-2 sm:grid-cols-2"><div className="flex gap-3 rounded-xl border border-[#dce6f2] bg-white p-3"><IconMark name="support" className="h-8 w-8 shrink-0" /><div><p className="text-sm font-semibold text-[#31516f]">Straight answers</p><p className="mt-1 text-xs leading-5 text-[#8190a1]">No confusing packages or unnecessary equipment.</p></div></div><div className="flex gap-3 rounded-xl border border-[#dce6f2] bg-white p-3"><IconMark name="tools" className="h-8 w-8 shrink-0" /><div><p className="text-sm font-semibold text-[#31516f]">Careful handover</p><p className="mt-1 text-xs leading-5 text-[#8190a1]">A clean setup and practical help using it.</p></div></div></div></div><div className="grid grid-cols-[1.15fr_0.85fr] gap-3"><div className="relative min-h-[260px] overflow-hidden rounded-2xl"><Image src="/story/field-team.jpg" alt="Security professionals meeting outside a customer location" fill sizes="(min-width: 1024px) 35vw, 100vw" className="object-cover" /></div><div className="grid gap-3"><div className="relative min-h-[124px] overflow-hidden rounded-2xl"><Image src="/story/dealer-partners.jpg" alt="Super Star Electronics team with dealer partner agreements" fill sizes="(min-width: 1024px) 25vw, 50vw" className="object-cover" /></div><div className="relative min-h-[124px] overflow-hidden rounded-2xl"><Image src="/story/team-learning.jpg" alt="Security industry partners and teams learning together" fill sizes="(min-width: 1024px) 25vw, 50vw" className="object-cover" /></div></div></div></Container></section>

      <section className="px-4 py-7 sm:px-6 lg:px-8"><Container><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-[0.66rem] font-bold uppercase tracking-[0.16em] text-[#1463d7]">Field notes</p><h2 className="mt-2 font-heading text-2xl font-semibold tracking-tight text-[#1d3e68] sm:text-3xl">A little of the work behind the work.</h2></div><div className="flex flex-wrap gap-3"><a href="https://share.google/SPTS7p2FtDBNFKmsg" target="_blank" rel="noreferrer" className="text-[0.7rem] font-semibold text-[#1463d7]">View the shared story ↗</a><a href="https://www.tiktok.com/@cctvnetworkingchitwan" target="_blank" rel="noreferrer" className="text-[0.7rem] font-semibold text-[#1463d7]">See more from the team ↗</a></div></div><div className="mt-5 grid gap-3 md:grid-cols-3">{storyMoments.map((moment) => <article key={moment.title} className="group overflow-hidden rounded-2xl border border-[#dce6f2] bg-white"><div className="relative aspect-[1.2] overflow-hidden bg-[#eaf1f7]"><Image src={moment.image} alt={moment.title} fill sizes="(min-width: 768px) 33vw, 100vw" className="object-cover transition duration-500 group-hover:scale-105" /></div><div className="p-4"><p className="text-[0.62rem] font-bold uppercase tracking-[0.15em] text-[#1463d7]">{moment.label}</p><h3 className="mt-2 font-heading text-lg font-semibold leading-6 text-[#234a78]">{moment.title}</h3><p className="mt-2 text-xs leading-5 text-[#8190a1]">{moment.detail}</p></div></article>)}</div></Container></section>

      <section className="px-4 py-5 sm:px-6 lg:px-8"><Container><div className="flex items-end justify-between gap-4"><div><p className="text-[0.66rem] font-bold uppercase tracking-[0.16em] text-[#1463d7]">Shop by Category</p><h2 className="mt-1 font-heading text-2xl font-semibold tracking-tight text-[#1d3e68]">Find the right equipment faster.</h2></div><Link href="/products" className="hidden text-[0.7rem] font-semibold text-[#1463d7] sm:block">View all →</Link></div><div className="mt-4 grid gap-2 sm:grid-cols-2 md:grid-cols-4 xl:grid-cols-7">{categories.slice(0, 7).map((category) => <Link key={category.key} href={`/products#${category.key}`} className="group rounded-xl border border-[#dfe8f2] bg-white p-3 transition hover:-translate-y-0.5 hover:border-[#8cb4f7] hover:shadow-[0_10px_22px_rgba(20,67,125,0.07)]"><div className="flex items-center gap-2"><span className="relative h-9 w-9 shrink-0 overflow-hidden rounded-lg bg-[#f1f6fb]">{category.products[0]?.image ? <Image src={category.products[0].image} alt={category.name} fill sizes="36px" className="object-contain p-1" unoptimized /> : null}</span><span className="text-[0.68rem] font-semibold leading-4 text-[#405a77] group-hover:text-[#1463d7]">{category.name}</span></div><p className="mt-2 text-[0.58rem] leading-4 text-[#8b98aa]">{categoryHighlights[category.key] ?? "Security essentials"}</p></Link>)}</div></Container></section>

      <section className="px-4 py-5 sm:px-6 lg:px-8"><Container><div className="flex items-end justify-between gap-4"><div><p className="text-[0.66rem] font-bold uppercase tracking-[0.16em] text-[#1463d7]">Featured Products</p><h2 className="mt-1 font-heading text-2xl font-semibold tracking-tight text-[#1d3e68]">Popular cameras customers ask about first.</h2></div><Link href="/products#wireless-cameras" className="text-[0.7rem] font-semibold text-[#1463d7]">Browse catalogue →</Link></div><div className="mt-4 grid gap-3 md:grid-cols-3">{featuredProducts.map((product) => <CompactProductCard key={product.id} product={product} />)}</div></Container></section>

      <section className="px-4 py-5 sm:px-6 lg:px-8"><Container><div className="flex items-end justify-between gap-4"><div><p className="text-[0.66rem] font-bold uppercase tracking-[0.16em] text-[#1463d7]">Our Services</p><h2 className="mt-1 font-heading text-2xl font-semibold tracking-tight text-[#1d3e68]">Everything you need for a working security system.</h2></div><Link href="/services" className="text-[0.7rem] font-semibold text-[#1463d7]">View all services →</Link></div><div className="mt-4 grid gap-3 md:grid-cols-3">{services.slice(0, 3).map((service) => <ServiceCard key={service.slug} service={service} />)}</div></Container></section>

      <section className="px-4 py-6 sm:px-6 lg:px-8"><Container className="grid gap-4 lg:grid-cols-[1fr_1.2fr]"><div className="rounded-xl border border-[#dce6f2] bg-[#f2f7fd] p-6"><p className="text-[0.66rem] font-bold uppercase tracking-[0.16em] text-[#1463d7]">Why choose us</p><h2 className="mt-2 font-heading text-2xl font-semibold tracking-tight text-[#1d3e68]">Clear advice. Neat installation. Support after the sale.</h2><div className="mt-5 grid gap-2 sm:grid-cols-2">{whyChooseUs.slice(0, 4).map((item) => <div key={item} className="flex items-center gap-2 rounded-lg border border-[#dce6f2] bg-white px-3 py-2.5 text-xs text-[#4f6178]"><IconMark name="shield" className="h-7 w-7 shrink-0" />{item}</div>)}</div></div><div className="rounded-xl border border-[#dce6f2] bg-white p-6"><p className="text-[0.66rem] font-bold uppercase tracking-[0.16em] text-[#1463d7]">Who we serve</p><div className="mt-3 grid gap-3 sm:grid-cols-3">{customerScenarios.slice(0, 3).map((scenario) => <div key={scenario.title} className="rounded-lg border border-[#e4ebf3] p-3"><p className="text-sm font-semibold text-[#31516f]">{scenario.title}</p><p className="mt-1 text-xs leading-5 text-[#8b98aa]">{scenario.detail}</p></div>)}</div><div className="mt-5 flex flex-wrap gap-2"><a href={toTelHref(siteConfig.contact.primaryPhone)} className="action-primary">Call {siteConfig.contact.primaryPhone}</a><Link href="/contact" className="action-secondary">Contact us</Link></div></div></Container></section>

      <section className="px-4 pb-10 pt-5 sm:px-6 lg:px-8"><Container><div className="overflow-hidden rounded-xl border border-[#dce6f2] bg-white"><div className="grid lg:grid-cols-[1fr_1.1fr]"><div className="p-6 sm:p-8"><p className="text-[0.66rem] font-bold uppercase tracking-[0.16em] text-[#1463d7]">Visit the shop</p><h2 className="mt-2 font-heading text-2xl font-semibold tracking-tight text-[#1d3e68]">Ganesh Market, Narayangarh, Chitwan.</h2><p className="mt-3 text-sm leading-6 text-[#7d899a]">Call or WhatsApp before visiting to confirm model availability or request a site visit.</p><div className="mt-5 flex flex-wrap gap-2"><a href={siteConfig.contact.mapsUrl} target="_blank" rel="noreferrer" className="action-secondary">Get directions</a><a href={buildWhatsAppUrl({ type: "general" })} target="_blank" rel="noreferrer" className="action-primary">Ask on WhatsApp</a></div></div><iframe title="Super Star Electronics Industries location map" src={siteConfig.contact.embedMapUrl} className="h-64 w-full border-0 lg:h-full" loading="lazy" referrerPolicy="no-referrer-when-downgrade" /></div></div><div className="mt-7"><BrandStrip /></div></Container></section>
    </>
  );
}
