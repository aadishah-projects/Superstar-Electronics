import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
import { FloatingContactActions } from "@/components/floating-contact-actions";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { buildMetadata } from "@/lib/metadata";
import { Analytics } from "@vercel/analytics/next";
import { getCatalogSnapshot } from "@/lib/catalog-source";

export const dynamic = "force-dynamic";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

export const metadata: Metadata = buildMetadata({
  title: "CCTV & Security Solutions in Chitwan, Nepal",
  description:
    "Super Star Electronics Industries is a CCTV shop in Narayangarh, Chitwan offering Hikvision and EZVIZ cameras, wireless surveillance, networking products, installation, and support across Nepal.",
  path: "/",
});

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const catalog = await getCatalogSnapshot();
  const categoryMenuItems = catalog.categories.map((category) => {
    const preview = catalog.products.find((product) => product.categoryKey === category.key);
    return {
      category: { key: category.key, name: category.name },
      previewImage: preview?.image ?? null,
      previewName: preview?.name ?? category.name,
    };
  });

  return (
    <html
      lang="en"
      className={`${manrope.variable} h-full antialiased`}
      data-scroll-behavior="smooth"
    >
      <body className="min-h-full bg-background text-ink">
        <div className="relative flex min-h-screen flex-col">
          <SiteHeader categoryMenuItems={categoryMenuItems} />
          <main className="flex-1">{children}</main>
          <SiteFooter />
          <FloatingContactActions />
        </div>
        <Analytics />
      </body>
    </html>
  );
}
