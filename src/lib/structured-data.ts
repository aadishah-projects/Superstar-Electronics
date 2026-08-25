import { catalogProducts } from "@/data/catalog";
import { siteConfig } from "@/data/site";

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
    name: siteConfig.name,
    alternateName: siteConfig.shortName,
    description: siteConfig.description,
    url: siteConfig.siteUrl,
    logo: `${siteConfig.siteUrl}/brand/logo-horizontal.png`,
    email: siteConfig.contact.email,
    telephone: siteConfig.contact.primaryPhone,
    sameAs: [siteConfig.contact.mapsUrl],
    address,
    areaServed: siteConfig.serviceArea,
    knowsAbout: siteConfig.keywords,
  };
}

export function getWebSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    url: siteConfig.siteUrl,
    name: siteConfig.name,
    alternateName: [siteConfig.shortName, "superstarelectronics.com.np"],
  };
}

export function getLocalBusinessSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: siteConfig.name,
    image: `${siteConfig.siteUrl}/brand/logo-horizontal.png`,
    url: siteConfig.siteUrl,
    telephone: siteConfig.contact.primaryPhone,
    email: siteConfig.contact.email,
    address,
    areaServed: "Nepal",
    hasMap: siteConfig.contact.mapsUrl,
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
    makesOffer: catalogProducts.slice(0, 12).map((product) => ({
      "@type": "Offer",
      itemOffered: {
        "@type": "Product",
        name: product.name,
        description: product.categoryName,
      },
    })),
  };
}
