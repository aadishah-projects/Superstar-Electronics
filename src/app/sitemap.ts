import type { MetadataRoute } from "next";
import { siteConfig } from "@/data/site";
import { getCatalogSnapshot } from "@/lib/catalog-source";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { products } = await getCatalogSnapshot();
  const routes = [
    { path: "", changeFrequency: "weekly" as const, priority: 1 },
    { path: "/products", changeFrequency: "weekly" as const, priority: 0.9 },
    { path: "/services", changeFrequency: "monthly" as const, priority: 0.8 },
    { path: "/about", changeFrequency: "monthly" as const, priority: 0.7 },
    { path: "/contact", changeFrequency: "monthly" as const, priority: 0.8 },
    { path: "/support", changeFrequency: "monthly" as const, priority: 0.5 },
    { path: "/cctv-installation-chitwan", changeFrequency: "monthly" as const, priority: 0.85 },
    { path: "/cctv-repair-maintenance-chitwan", changeFrequency: "monthly" as const, priority: 0.75 },
    { path: "/security-systems-bharatpur", changeFrequency: "monthly" as const, priority: 0.85 },
  ];

  const catalogRoutes = products.map((product) => ({
    url: `${siteConfig.siteUrl}/products/${product.id}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [
    ...routes.map((route) => ({
      url: `${siteConfig.siteUrl}${route.path}`,
      lastModified: new Date(),
      changeFrequency: route.changeFrequency,
      priority: route.priority,
    })),
    ...catalogRoutes,
  ];
}
