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
  const googleVerification =
    process.env.GOOGLE_SITE_VERIFICATION?.trim() || undefined;

  return {
    metadataBase: new URL(siteConfig.siteUrl),
    title,
    description,
    keywords: [...siteConfig.keywords, ...keywords],
    manifest: "/site.webmanifest",
    alternates: {
      canonical: url,
    },
    verification: {
      google: googleVerification,
    },
    icons: {
      icon: [
        { url: "/favicon.ico", sizes: "any" },
        {
          url: "/favicon-48x48.png",
          type: "image/png",
          sizes: "48x48",
        },
        {
          url: "/favicon-192x192.png",
          type: "image/png",
          sizes: "192x192",
        },
      ],
      shortcut: ["/favicon.ico"],
      apple: [
        {
          url: "/apple-touch-icon.png",
          type: "image/png",
          sizes: "180x180",
        },
      ],
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
