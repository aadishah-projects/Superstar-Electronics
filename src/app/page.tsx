import Link from "next/link";
import { BrandStrip } from "@/components/brand-strip";
import { CompactProductCard } from "@/components/compact-product-card";
import { Container } from "@/components/container";
import { HomeProductShowcase } from "@/components/home-product-showcase";
import { IconMark } from "@/components/icon-mark";
import { JsonLd } from "@/components/json-ld";
import { SectionHeading } from "@/components/section-heading";
import { ServiceCard } from "@/components/service-card";
import { catalogCategories, getProductsForCategory } from "@/data/catalog";
import {
  businessStats,
  services,
  siteConfig,
  whyChooseUs,
} from "@/data/site";
import { buildWhatsAppUrl, toTelHref } from "@/lib/urls";
import { getOrganizationSchema } from "@/lib/structured-data";

const wirelessHotProducts = getProductsForCategory("wireless-cameras").slice(0, 4);
const cctvHotProducts = getProductsForCategory("cctv-cameras").slice(0, 4);
const networkingHotProducts = [
  ...getProductsForCategory("routers-networking").slice(0, 2),
  ...getProductsForCategory("poe-gigabit-switches").slice(0, 2),
];
const heroWirelessProducts = wirelessHotProducts.slice(0, 3);
const homeShowcaseSections = [
  {
    key: "wireless",
    label: "Wireless Cameras",
    title: "Hot wireless cameras for homes, rooms, and storefront monitoring.",
    description:
      "Smart indoor and outdoor Wi-Fi cameras are one of the fastest-moving product groups. These are great for customers who want simple app-based monitoring and fast setup.",
    href: "/products#wireless-cameras",
    products: wirelessHotProducts,
  },
  {
    key: "cctv",
    label: "CCTV Cameras",
    title: "Reliable dome and bullet camera picks for core CCTV installations.",
    description:
      "These models are better suited for fixed surveillance coverage in shops, offices, and larger security layouts where wired systems are preferred.",
    href: "/products#cctv-cameras",
    products: cctvHotProducts,
  },
  {
    key: "networking",
    label: "Networking & Switches",
    title: "Router and switch products that support smooth connectivity and IP camera setups.",
    description:
      "A strong CCTV setup also depends on dependable routing and switching. These picks cover everyday network expansion and camera power/distribution needs.",
    href: "/products#routers-networking",
    products: networkingHotProducts,
  },
];
const categoryTiles = catalogCategories.map((category) => ({
  ...category,
  count: getProductsForCategory(category.key).length,
}));

export default function HomePage() {
  return (
    <>
      <JsonLd data={getOrganizationSchema()} />

      <section className="page-section overflow-hidden pt-10 sm:pt-14">
        <Container className="grid gap-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-end">
          <div className="fade-up">
            <span className="section-kicker">CCTV & Security Solutions In Nepal</span>
            <h1 className="mt-6 max-w-4xl font-heading text-4xl tracking-tight text-ink sm:text-5xl lg:text-6xl">
              Explore hot products, real models, and practical security solutions
              for homes and businesses.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 copy-muted sm:text-lg">
              {siteConfig.shortName} now combines a cleaner product-first catalog
              with installation support, expert guidance, and fast inquiry flow
              from Narayangarh, Chitwan to customers across Nepal.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/products" className="action-primary">
                View Products
              </Link>
              <a
                href={buildWhatsAppUrl({ type: "general" })}
                target="_blank"
                rel="noreferrer"
                className="action-accent"
              >
                WhatsApp Us
              </a>
              <a href={toTelHref(siteConfig.contact.primaryPhone)} className="action-secondary">
                Call Now
              </a>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {businessStats.map((stat, index) => (
                <div
                  key={stat.label}
                  className={`surface-card p-5 fade-up ${index === 0 ? "fade-delay-1" : index === 1 ? "fade-delay-2" : "fade-delay-3"}`}
                >
                  <p className="font-heading text-xl text-brand-blue">{stat.value}</p>
                  <p className="mt-2 text-sm uppercase tracking-[0.18em] copy-muted">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="surface-card-strong subtle-pattern fade-up fade-delay-1 relative overflow-hidden p-6 sm:p-8">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(200,43,43,0.12),transparent_16rem)]" />
            <div className="relative">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.22em] text-brand-blue">
                    Hot Products
                  </p>
                  <h2 className="mt-3 font-heading text-3xl tracking-tight text-ink">
                    Wireless cameras customers are asking about right now.
                  </h2>
                </div>
                <Link href="/products#wireless-cameras" className="action-ghost hidden sm:inline-flex">
                  View All
                </Link>
              </div>

              <p className="mt-5 text-sm leading-7 copy-muted sm:text-base">
                Start with easy-to-install smart cameras and then move into complete
                CCTV or networking setups when you need broader coverage.
              </p>

              <div className="mt-6 space-y-3">
                {heroWirelessProducts.map((product) => (
                  <CompactProductCard key={`hero-${product.id}`} product={product} />
                ))}
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-[1.5rem] border border-line bg-white/90 p-5">
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-blue">
                    Product Focus
                  </p>
                  <p className="mt-2 font-heading text-xl text-ink">Wireless Cameras</p>
                  <p className="mt-1 text-sm copy-muted">
                    Smart viewing, simple setup, and fast WhatsApp inquiry flow
                  </p>
                </div>
                <div className="rounded-[1.5rem] border border-line bg-white/90 p-5">
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-blue">
                    Quotation Ready
                  </p>
                  <p className="mt-2 font-heading text-xl text-ink">Homes, Offices, Shops</p>
                  <p className="mt-1 text-sm copy-muted">
                    Ask for package pricing and installation guidance
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
            title="Jump into the catalog by product type, not just by page."
            description="Use category shortcuts like a storefront menu and go straight to the products that match your requirement."
          />

          <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {categoryTiles.map((category) => (
              <Link
                key={category.key}
                href={`/products#${category.key}`}
                className="surface-card group p-5 transition hover:-translate-y-1 hover:border-brand-blue"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-heading text-xl tracking-tight text-ink transition group-hover:text-brand-blue">
                      {category.name}
                    </p>
                    <p className="mt-3 text-sm leading-7 copy-muted">
                      {category.description}
                    </p>
                  </div>
                  <span className="rounded-full bg-brand-blue px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-white">
                    {category.count}
                  </span>
                </div>
                <span className="mt-5 inline-flex text-sm font-semibold text-brand-blue">
                  Browse Category
                </span>
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

      <section className="page-section pt-0">
        <Container>
          <BrandStrip />
        </Container>
      </section>

      <section className="page-section">
        <Container>
          <SectionHeading
            eyebrow="Services"
            title="Installation, setup, support, and supply built for real-world business needs."
            description="We combine products with the service work that makes them valuable: planning, setup, repair, maintenance, and responsive support."
          />

          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {services.slice(0, 3).map((service) => (
              <ServiceCard key={service.slug} service={service} />
            ))}
          </div>

          <div className="mt-8">
            <Link href="/services" className="action-primary">
              Explore All Services
            </Link>
          </div>
        </Container>
      </section>

      <section className="page-section">
        <Container>
          <SectionHeading
            eyebrow="Why Choose Us"
            title="A dependable local partner for surveillance, networking, and after-sales support."
            description="Customers choose Super Star Electronics Industries because they want trustworthy brands, professional installation, and straightforward support after the sale."
          />

          <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {whyChooseUs.map((item) => (
              <div key={item} className="surface-card p-6">
                <div className="flex items-start gap-4">
                  <IconMark name="shield" className="h-11 w-11 shrink-0" />
                  <p className="text-base leading-7 text-ink">{item}</p>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="page-section pt-8">
        <Container>
          <div className="surface-card-strong relative overflow-hidden p-8 sm:p-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(28,60,110,0.12),transparent_20rem)]" />
            <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
              <div>
                <span className="section-kicker">Request A Quote</span>
                <h2 className="mt-5 font-heading text-3xl tracking-tight text-ink sm:text-4xl">
                  Need a CCTV package, installation quote, or product recommendation?
                </h2>
                <p className="mt-4 max-w-2xl text-base leading-8 copy-muted sm:text-lg">
                  Send a quick inquiry and we can help you compare options for homes,
                  shops, offices, and industrial spaces.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
                <a
                  href={buildWhatsAppUrl({
                    type: "quote",
                    subject: "a CCTV and security quotation",
                  })}
                  target="_blank"
                  rel="noreferrer"
                  className="action-accent"
                >
                  Request CCTV Quotation
                </a>
                <a
                  href={siteConfig.contact.mapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="action-secondary"
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
