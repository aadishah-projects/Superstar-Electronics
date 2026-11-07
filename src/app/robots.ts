import type { MetadataRoute } from "next";
import { siteConfig } from "@/data/site";

export default function robots(): MetadataRoute.Robots {
  const disallowedPaths = ["/portal", "/api", "/review", "/support/status"];

  return {
    rules: [
      { userAgent: "OAI-SearchBot", allow: "/", disallow: disallowedPaths },
      { userAgent: "Googlebot", allow: "/", disallow: disallowedPaths },
      { userAgent: "Bingbot", allow: "/", disallow: disallowedPaths },
      { userAgent: "*", allow: "/", disallow: disallowedPaths },
    ],
    sitemap: `${siteConfig.siteUrl}/sitemap.xml`,
  };
}
