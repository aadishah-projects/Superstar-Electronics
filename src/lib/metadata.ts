import type { Metadata } from "next";
import { siteConfig } from "@/data/site";

interface MetadataInput {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
}

export function buildMetadata({
  title,
  description,
  path,
  keywords = [],
}: MetadataInput): Metadata {
  const url = new URL(path, siteConfig.siteUrl).toString();

  return {
    metadataBase: new URL(siteConfig.siteUrl),
    title,
    description,
    keywords: [...siteConfig.keywords, ...keywords],
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: `${title} | ${siteConfig.name}`,
      description,
      url,
      siteName: siteConfig.name,
      type: "website",
      locale: "en_US",
      images: [
        {
          url: "/brand/logo-horizontal.png",
          width: 848,
          height: 276,
          alt: siteConfig.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${siteConfig.name}`,
      description,
      images: ["/brand/logo-horizontal.png"],
    },
  };
}
