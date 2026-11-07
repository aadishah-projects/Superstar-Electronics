import { getCatalogSnapshot } from "@/lib/catalog-source";
import { services, siteConfig } from "@/data/site";
import type { CatalogProduct } from "@/types/site";

const organizationId = `${siteConfig.siteUrl}#organization`;
const localBusinessId = `${siteConfig.siteUrl}#local-business`;

const address = {
  "@type": "PostalAddress",
  streetAddress: siteConfig.address.street,
  addressLocality: siteConfig.address.locality,
  addressRegion: siteConfig.address.province,
  addressCountry: siteConfig.address.country,
};

export function getOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": organizationId,
    name: siteConfig.name,
    alternateName: siteConfig.shortName,
    description: siteConfig.description,
    url: siteConfig.siteUrl,
    logo: `${siteConfig.siteUrl}/brand/logo-horizontal.png`,
    email: siteConfig.contact.email,
    telephone: siteConfig.contact.primaryPhone,
    sameAs: siteConfig.socialProfiles,
    address,
    areaServed: siteConfig.serviceArea,
    knowsAbout: siteConfig.keywords,
    contactPoint: [
      {
        "@type": "ContactPoint",
        telephone: siteConfig.contact.primaryPhone,
        contactType: "customer service",
        areaServed: "NP",
        availableLanguage: ["en", "ne"],
      },
    ],
  };
}

export function getWebSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteConfig.siteUrl}#website`,
    url: siteConfig.siteUrl,
    name: siteConfig.name,
    alternateName: [siteConfig.shortName, "superstarelectronics.com.np"],
    publisher: { "@id": organizationId },
  };
}

export async function getLocalBusinessSchema(catalogProducts?: CatalogProduct[]) {
  const products = catalogProducts ?? (await getCatalogSnapshot()).products;
  return {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "Store"],
    "@id": localBusinessId,
    name: siteConfig.name,
    image: `${siteConfig.siteUrl}/brand/logo-horizontal.png`,
    url: siteConfig.siteUrl,
    telephone: siteConfig.contact.primaryPhone,
    email: siteConfig.contact.email,
    address,
    areaServed: "Nepal",
    hasMap: siteConfig.contact.mapsUrl,
    sameAs: siteConfig.socialProfiles,
    currenciesAccepted: "NPR",
    paymentAccepted: siteConfig.paymentMethods.join(", "),
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [
          "Sunday",
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
        ],
        opens: siteConfig.hours.opens,
        closes: siteConfig.hours.closes,
      },
    ],
    makesOffer: products.slice(0, 12).map((product) => ({
      "@type": "Offer",
      itemOffered: {
        "@type": "Product",
        name: product.name,
        description: product.categoryName,
      },
    })),
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "CCTV and security services",
      itemListElement: services.map((service) => ({
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: service.name,
          description: service.summary,
          provider: { "@id": localBusinessId },
          areaServed: "Nepal",
        },
      })),
    },
  };
}

export function getServiceListSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "CCTV and security services from Super Star Electronics Industries",
    itemListElement: services.map((service, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Service",
        name: service.name,
        description: service.summary,
        provider: { "@id": localBusinessId },
        areaServed: "Nepal",
        url: `${siteConfig.siteUrl}/services#${service.slug}`,
      },
    })),
  };
}

export function getProductSchema(product: CatalogProduct) {
  const productUrl = `${siteConfig.siteUrl}/products/${product.id}`;
  const availability =
    product.availability === "in_stock"
      ? "https://schema.org/InStock"
      : product.availability === "out_of_stock"
        ? "https://schema.org/OutOfStock"
        : undefined;

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${productUrl}#product`,
    name: product.name,
    description: `${product.name} from ${product.brand}. Ask Super Star Electronics about availability, installation, and current pricing.`,
    image: [new URL(product.image, siteConfig.siteUrl).toString()],
    brand: {
      "@type": "Brand",
      name: product.brand,
    },
    category: product.categoryName,
    url: productUrl,
    offers:
      product.price === null
        ? undefined
        : {
            "@type": "Offer",
            url: productUrl,
            priceCurrency: "NPR",
            price: product.price,
            ...(availability ? { availability } : {}),
            seller: { "@id": localBusinessId },
          },
  };
}
