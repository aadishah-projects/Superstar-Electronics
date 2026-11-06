import type { ServiceJobRecord } from "@/lib/portal/types";

export function getJobMapUrl(job: Pick<ServiceJobRecord, "siteAddress" | "siteArea" | "siteLatitude" | "siteLongitude">) {
  const query = job.siteLatitude !== null && job.siteLongitude !== null
    ? `${job.siteLatitude},${job.siteLongitude}`
    : [job.siteAddress, job.siteArea].filter(Boolean).join(", ");

  return query ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}` : null;
}

export function getJobLocationLabel(job: Pick<ServiceJobRecord, "siteAddress" | "siteArea" | "siteLatitude" | "siteLongitude">) {
  if (job.siteAddress || job.siteArea) return [job.siteAddress, job.siteArea].filter(Boolean).join(" · ");
  if (job.siteLatitude !== null && job.siteLongitude !== null) return `${job.siteLatitude}, ${job.siteLongitude}`;
  return "Location not added";
}
