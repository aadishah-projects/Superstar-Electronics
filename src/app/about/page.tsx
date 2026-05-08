import type { Metadata } from "next";
import { BrandStrip } from "@/components/brand-strip";
import { Container } from "@/components/container";
import { IconMark } from "@/components/icon-mark";
import { siteConfig, whyChooseUs } from "@/data/site";
import { buildMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildMetadata({
  title: "About Us",
  description:
    "Learn about Super Star Electronics Industries, a Chitwan-based CCTV and security solutions provider serving customers across Nepal.",
  path: "/about",
  keywords: ["about CCTV company Chitwan", "security solutions provider Nepal"],
});

const businessFacts = [
  {
    title: "Owner",
    value: siteConfig.owner,
    icon: "support" as const,
  },
  {
    title: "Working Hours",
    value: `${siteConfig.hours.daysLabel} | ${siteConfig.hours.hoursLabel}`,
    icon: "clock" as const,
  },
  {
    title: "Service Area",
    value: siteConfig.serviceArea,
    icon: "map" as const,
  },
  {
    title: "Payment Methods",
    value: siteConfig.paymentMethods.join(", "),
    icon: "quote" as const,
  },
];

export default function AboutPage() {
  return (
    <section className="page-section pt-10 sm:pt-14">
      <Container>
        <div>
          <span className="section-kicker">About Super Star</span>
          <h1 className="mt-5 max-w-4xl font-heading text-3xl tracking-tight text-ink sm:text-4xl">
            A Chitwan-based business focused on practical security, dependable
            brands, and support that customers can trust.
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-8 copy-muted sm:text-lg">
            We help homes, shops, offices, institutions, and industrial clients
            choose the right surveillance and networking setup without unnecessary
            complexity.
          </p>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="surface-card p-6 sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-brand-blue">
              Business Overview
            </p>
            <div className="mt-4 space-y-4 text-base leading-8 copy-muted">
              <p>
                Super Star Electronics Industries is a trusted IT and security
                solutions provider based in Narayangarh, Chitwan. We specialize in
                CCTV surveillance systems, networking products, and complete
                installation support for customers across Nepal.
              </p>
              <p>
                Our approach is simple: recommend dependable products, install them
                professionally, and remain available for support after the sale. That
                balance is especially valuable for customers who need clear guidance
                and fast answers instead of a complicated online buying process.
              </p>
              <p>
                We work with genuine brands and tailor solutions for homes,
                businesses, schools, organizations, and industrial spaces that need
                reliable coverage and stable system performance.
              </p>
            </div>
          </div>

          <div className="grid gap-4">
            {businessFacts.map((fact) => (
              <div key={fact.title} className="surface-card p-5">
                <div className="flex items-start gap-4">
                  <IconMark name={fact.icon} />
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-blue">
                      {fact.title}
                    </p>
                    <p className="mt-2 text-base leading-7 text-ink">{fact.value}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="surface-card p-6 sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-brand-blue">
              Who We Serve
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              {siteConfig.targetCustomers.map((customer) => (
                <span
                  key={customer}
                  className="rounded-full border border-line px-4 py-2 text-sm copy-muted"
                >
                  {customer}
                </span>
              ))}
            </div>
          </div>

          <div className="surface-card p-6 sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-brand-blue">
              Why The Business Stands Out
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {whyChooseUs.map((item) => (
                <div key={item} className="rounded-[1.5rem] border border-line bg-white p-5">
                  <p className="text-sm leading-7 text-ink">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-16">
          <BrandStrip />
        </div>
      </Container>
    </section>
  );
}
