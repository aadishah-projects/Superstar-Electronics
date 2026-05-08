import Image from "next/image";
import Link from "next/link";
import { CompactProductCard } from "@/components/compact-product-card";
import { Container } from "@/components/container";
import { HomeProductShowcase } from "@/components/home-product-showcase";
import { IconMark } from "@/components/icon-mark";
import { JsonLd } from "@/components/json-ld";
import { SectionHeading } from "@/components/section-heading";
import { ServiceCard } from "@/components/service-card";
import { catalogCategories, getProductsForCategory } from "@/data/catalog";
import {
  customerScenarios,
  offerHighlights,
  services,
  siteConfig,
  whyChooseUs,
} from "@/data/site";
import { buildWhatsAppUrl, toTelHref } from "@/lib/urls";
import { getOrganizationSchema } from "@/lib/structured-data";

const wirelessHotProducts = getProductsForCategory("wireless-cameras").slice(0, 3);
const cctvHotProducts = getProductsForCategory("cctv-cameras").slice(0, 3);
const networkingHotProducts = [
  ...getProductsForCategory("routers-networking").slice(0, 2),
  ...getProductsForCategory("poe-gigabit-switches").slice(0, 1),
];
const heroWirelessProducts = wirelessHotProducts.slice(0, 3);
const homeShowcaseSections = [
  {
    key: "wireless",
    label: "Wireless Cameras",
    title: "Wireless cameras for quick setup, mobile viewing, and everyday monitoring.",
    description:
      "Great for homes, rooms, gates, and small storefronts where easy app access matters most.",
    href: "/products#wireless-cameras",
    products: wirelessHotProducts,
  },
  {
    key: "cctv",
    label: "CCTV Cameras",
    title: "Wired CCTV picks for dependable indoor and outdoor coverage.",
    description:
      "Better for shops, offices, and larger layouts where fixed recording and stable coverage are a priority.",
    href: "/products#cctv-cameras",
    products: cctvHotProducts,
  },
  {
    key: "networking",
    label: "Networking & Switches",
    title: "Routers and switches that keep cameras and internet connections stable.",
    description:
      "Useful for IP camera power, network expansion, and remote access performance.",
    href: "/products#routers-networking",
    products: networkingHotProducts,
  },
];
const categoryHighlights: Record<string, string> = {
  "cctv-cameras": "Indoor & outdoor coverage",
  "wireless-cameras": "App-based monitoring",
  "dvr-nvr-systems": "Central recording",
  "routers-networking": "Stable connectivity",
  "poe-gigabit-switches": "Camera power & switching",
  "accessories-cables": "Cables, power, adapters",
  "biometrics-access": "Attendance & access control",
  "video-intercom": "Door entry & indoor monitors",
  "monitors-displays": "Viewing & display screens",
  "interactive-boards": "Classroom & meeting displays",
};

const categoryTiles = catalogCategories.map((category) => ({
  ...category,
  count: getProductsForCategory(category.key).length,
  previewImage: getProductsForCategory(category.key)[0]?.image ?? null,
  helperText: categoryHighlights[category.key] ?? "Security essentials",
}));

export default function HomePage() {
  return (
    <>
      <JsonLd data={getOrganizationSchema()} />

      <section className="page-section overflow-hidden pt-8 sm:pt-14">
        <Container className="grid gap-6 sm:gap-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-end">
          <div className="fade-up">
            <span className="section-kicker">CCTV Shop In Chitwan</span>
            <h1 className="mt-4 max-w-4xl font-heading text-[2.2rem] leading-tight tracking-tight text-ink sm:mt-6 sm:text-5xl lg:text-6xl">
              CCTV cameras, wireless security, and installation support for
              homes, shops, and offices.
            </h1>
            <p className="mt-4 max-w-2xl text-[0.98rem] leading-7 copy-muted sm:mt-6 sm:text-lg sm:leading-8">
              Super Star Electronics supplies Hikvision, EZVIZ, networking
              products, and practical setup support from Narayangarh, Chitwan.
            </p>

            <div className="mt-6 flex flex-col gap-2.5 sm:mt-8 sm:flex-row sm:gap-3">
              <a
                href={buildWhatsAppUrl({ type: "general" })}
                target="_blank"
                rel="noreferrer"
                className="action-accent w-full sm:w-auto"
              >
                WhatsApp Us
              </a>
              <Link href="/products" className="action-primary w-full sm:w-auto">
                View Products
              </Link>
              <a href={toTelHref(siteConfig.contact.primaryPhone)} className="action-secondary w-full sm:w-auto">
                Call Now
              </a>
            </div>

            <div className="mt-6 grid gap-3 sm:mt-8 sm:grid-cols-2">
              {offerHighlights.map((item, index) => (
                <div
                  key={item.title}
                  className={`surface-card p-4 sm:p-5 fade-up ${index === 0 ? "fade-delay-1" : index === 1 ? "fade-delay-2" : "fade-delay-3"}`}
                >
                  <div className="flex items-start gap-3">
                    <IconMark name={item.icon} className="h-11 w-11 shrink-0" />
                    <div>
                      <p className="font-heading text-lg text-ink">{item.title}</p>
                      <p className="mt-1 text-sm leading-6 copy-muted">{item.detail}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="surface-card-strong subtle-pattern fade-up fade-delay-1 relative overflow-hidden p-5 sm:p-8">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(200,43,43,0.12),transparent_16rem)]" />
            <div className="relative">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.22em] text-brand-blue">
                    Popular This Week
                  </p>
                  <h2 className="mt-3 font-heading text-2xl leading-tight tracking-tight text-ink sm:text-3xl">
                    Quick-pick cameras customers ask about first.
                  </h2>
                </div>
                <Link href="/products#wireless-cameras" className="action-ghost hidden sm:inline-flex">
                  View All
                </Link>
              </div>

              <p className="mt-4 text-sm leading-7 copy-muted sm:mt-5 sm:text-base">
                A fast starting point for app-based home and shop monitoring.
              </p>

              <div className="mt-5 space-y-3 sm:mt-6">
                {heroWirelessProducts.map((product) => (
                  <CompactProductCard key={`hero-${product.id}`} product={product} />
                ))}
              </div>

              <div className="mt-5 grid gap-3 sm:mt-6 sm:grid-cols-2 sm:gap-4">
                <div className="rounded-[1.2rem] border border-line bg-white/90 p-4 sm:rounded-[1.5rem] sm:p-5">
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-blue">
                    Fast Response
                  </p>
                  <p className="mt-2 font-heading text-xl text-ink">Call, WhatsApp, or visit</p>
                  <p className="mt-1 text-sm copy-muted">
                    Easy inquiry flow for prices, recommendations, and installation help.
                  </p>
                </div>
                <div className="rounded-[1.2rem] border border-line bg-white/90 p-4 sm:rounded-[1.5rem] sm:p-5">
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-blue">
                    Local Support
                  </p>
                  <p className="mt-2 font-heading text-xl text-ink">Homes, shops, offices</p>
                  <p className="mt-1 text-sm copy-muted">
                    Ask for package pricing, product matching, and setup planning.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="page-section pt-6">
        <Container>
          <SectionHeading
            eyebrow="Shop By Category"
            title="Go straight to the category that fits your requirement."
            description="Shortcuts for the main products customers compare first."
          />

          <div className="mt-8 grid gap-3 sm:mt-10 sm:gap-4 md:grid-cols-2 xl:grid-cols-4">
            {categoryTiles.map((category) => (
              <Link
                key={category.key}
                href={`/products#${category.key}`}
                className="surface-card group p-4 sm:p-5 transition hover:-translate-y-1 hover:border-brand-blue"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-heading text-xl tracking-tight text-ink transition group-hover:text-brand-blue">
                      {category.name}
                    </p>
                    <p className="mt-2 text-sm leading-6 copy-muted">
                      {category.helperText}
                    </p>
                  </div>
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-[1rem] bg-surface-strong">
                    {category.previewImage ? (
                      <Image
                        src={category.previewImage}
                        alt={category.name}
                        fill
                        sizes="56px"
                        className="object-contain p-1.5"
                        unoptimized
                      />
                    ) : null}
                  </div>
                </div>
                <div className="mt-5 flex items-center justify-between gap-3">
                  <span className="rounded-full bg-brand-blue px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-white">
                    {category.count} items
                  </span>
                  <span className="text-sm font-semibold text-brand-blue">
                    Browse
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      <section className="page-section">
        <Container>
          <HomeProductShowcase sections={homeShowcaseSections} />
        </Container>
      </section>

      <section className="page-section">
        <Container>
          <SectionHeading
            eyebrow="Why Choose Us"
            title="A local team for products, installation, and after-sales support."
            description="Customers usually want genuine products, neat installation, fast replies, and support after the sale."
          />

          <div className="mt-8 grid gap-3 sm:mt-10 sm:gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {whyChooseUs.map((item) => (
              <div key={item} className="surface-card p-4 sm:p-6">
                <div className="flex items-start gap-4">
                  <IconMark name="shield" className="h-11 w-11 shrink-0" />
                  <p className="text-base leading-7 text-ink">{item}</p>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="page-section pt-0">
        <Container>
          <SectionHeading
            eyebrow="Services"
            title="Installation, setup, repair, and supply for real-world business needs."
            description="The service side stays simple: plan, install, support, and keep systems running."
          />

          <div className="mt-8 grid gap-4 sm:mt-10 sm:gap-6 lg:grid-cols-3">
            {services.slice(0, 3).map((service) => (
              <ServiceCard key={service.slug} service={service} />
            ))}
          </div>

          <div className="mt-6 sm:mt-8">
            <Link href="/services" className="action-primary w-full sm:w-auto">
              Explore All Services
            </Link>
          </div>
        </Container>
      </section>

      <section className="page-section">
        <Container>
          <div className="grid gap-5 sm:gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="surface-card p-5 sm:p-8">
              <span className="section-kicker">Popular Customer Needs</span>
              <h2 className="mt-4 font-heading text-2xl leading-tight tracking-tight text-ink sm:mt-5 sm:text-4xl">
                The setups people ask for most often.
              </h2>
              <div className="mt-5 space-y-3 sm:mt-6 sm:space-y-4">
                {customerScenarios.map((scenario) => (
                  <div key={scenario.title} className="rounded-[1.15rem] border border-line bg-surface-strong p-4 sm:rounded-[1.35rem] sm:p-5">
                    <p className="font-heading text-xl text-ink">{scenario.title}</p>
                    <p className="mt-2 text-sm leading-7 copy-muted">{scenario.detail}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="surface-card-strong overflow-hidden p-3 sm:p-4">
              <div className="overflow-hidden rounded-[1.35rem] border border-line bg-white">
                <iframe
                  title="Super Star Electronics Industries location map"
                  src={siteConfig.contact.embedMapUrl}
                  className="h-64 w-full border-0 sm:h-[320px]"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
              <div className="p-4 sm:p-5">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-blue">
                  Visit The Shop
                </p>
                <h3 className="mt-2 font-heading text-2xl text-ink">
                  Ganesh Market, Narayangarh, Chitwan
                </h3>
                <p className="mt-3 text-sm leading-7 copy-muted sm:text-base">
                  Use Google Maps for directions, then call ahead if you want to confirm model availability.
                </p>
                <div className="mt-4 flex flex-col gap-2.5 sm:mt-5 sm:flex-row sm:gap-3">
                  <a
                    href={siteConfig.contact.mapsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="action-secondary w-full sm:w-auto"
                  >
                    Get Directions
                  </a>
                  <a
                    href={buildWhatsAppUrl({ type: "general" })}
                    target="_blank"
                    rel="noreferrer"
                    className="action-primary w-full sm:w-auto"
                  >
                    Ask On WhatsApp
                  </a>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="page-section pt-6 sm:pt-8">
        <Container>
          <div className="surface-card-strong relative overflow-hidden p-6 sm:p-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(28,60,110,0.12),transparent_20rem)]" />
            <div className="relative grid gap-6 sm:gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
              <div>
                <span className="section-kicker">Request A Quote</span>
                <h2 className="mt-4 font-heading text-2xl leading-tight tracking-tight text-ink sm:mt-5 sm:text-4xl">
                  Need a CCTV package, site visit, or product recommendation?
                </h2>
                <p className="mt-3 max-w-2xl text-[0.98rem] leading-7 copy-muted sm:mt-4 sm:text-lg sm:leading-8">
                  Send a quick inquiry and we can match products, installation, and budget options for your location.
                </p>
              </div>

              <div className="flex flex-col gap-2.5 sm:flex-row sm:gap-3 lg:flex-col">
                <a
                  href={buildWhatsAppUrl({
                    type: "quote",
                    subject: "a CCTV and security quotation",
                  })}
                  target="_blank"
                  rel="noreferrer"
                  className="action-accent w-full sm:w-auto"
                >
                  Request CCTV Quotation
                </a>
                <a
                  href={siteConfig.contact.mapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="action-secondary w-full sm:w-auto"
                >
                  Visit The Shop
                </a>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
