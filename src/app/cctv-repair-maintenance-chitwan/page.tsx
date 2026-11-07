import type { Metadata } from "next";
import { LocalServicePage } from "@/components/local-service-page";
import { getRequiredLocalServicePage } from "@/data/local-service-pages";
import { buildMetadata } from "@/lib/metadata";

const page = getRequiredLocalServicePage("/cctv-repair-maintenance-chitwan");

export const metadata: Metadata = buildMetadata({
  title: page.title,
  description: page.description,
  path: page.path,
  keywords: page.keywords,
});

export default function CctvRepairMaintenanceChitwanPage() {
  return <LocalServicePage page={page} />;
}
