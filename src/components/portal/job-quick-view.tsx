"use client";

import { useEffect, useState } from "react";
import { JobResponseForm } from "@/components/portal/idea3-forms";
import { formatPortalDateTime, PortalIcon, PortalStatusBadge } from "@/components/portal/portal-ui";
import { getJobLocationLabel, getJobMapUrl } from "@/lib/portal/maps";
import type { ServiceJobRecord } from "@/lib/portal/types";

const categoryLabels: Record<ServiceJobRecord["category"], string> = {
  "cctv-installation": "CCTV installation",
  "cctv-repair": "CCTV repair",
  maintenance: "Maintenance",
  networking: "Networking",
  "router-wifi": "Router / Wi-Fi",
  "access-control": "Access control",
  other: "Other",
};

export function JobQuickView({ job, canRespond }: { job: ServiceJobRecord; canRespond: boolean }) {
  const [open, setOpen] = useState(false);
  const mapUrl = getJobMapUrl(job);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="inline-flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs font-semibold text-brand-blue transition hover:bg-brand-blue/[0.07]" aria-label={`Open quick view for ${job.title}`}>
        <PortalIcon name="arrow" className="h-3.5 w-3.5" />
        Quick view
      </button>
      {open ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/35 p-3 sm:items-center sm:p-6" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false); }}>
          <section role="dialog" aria-modal="true" aria-labelledby={`job-title-${job.id}`} className="max-h-[min(760px,calc(100vh-1.5rem))] w-full max-w-2xl overflow-y-auto rounded-3xl border border-line bg-white p-5 shadow-2xl sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-brand-blue">{job.reference}</p>
                <h2 id={`job-title-${job.id}`} className="mt-2 font-heading text-2xl leading-tight text-ink sm:text-3xl">{job.title}</h2>
              </div>
              <button type="button" onClick={() => setOpen(false)} className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line text-ink transition hover:bg-surface" aria-label="Close quick view" title="Close quick view"><PortalIcon name="close" /></button>
            </div>

            <div className="mt-4 flex flex-wrap gap-2"><PortalStatusBadge value={job.status} /><PortalStatusBadge value={job.urgency} /><span className="rounded-full border border-line bg-surface-strong px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.13em] text-brand-blue">{categoryLabels[job.category]}</span></div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-surface p-4"><p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-brand-blue">Customer</p><p className="mt-2 font-semibold text-ink">{job.customerName}</p><p className="mt-1 text-sm copy-muted">{job.phone}</p></div>
              <div className="rounded-2xl bg-surface p-4"><p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-brand-blue">Visit</p><p className="mt-2 font-semibold text-ink">{job.preferredStart ? formatPortalDateTime(job.preferredStart) : "Time not set"}</p><p className="mt-1 text-sm copy-muted">{job.estimatedMinutes ? `${job.estimatedMinutes} minutes` : "Duration not set"}</p></div>
            </div>

            <div className="mt-3 flex flex-col gap-3 rounded-2xl border border-line bg-white p-4 sm:flex-row sm:items-center sm:justify-between"><div className="flex min-w-0 items-start gap-3"><span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-blue/[0.08] text-brand-blue"><PortalIcon name="pin" /></span><div className="min-w-0"><p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-brand-blue">Location</p><p className="mt-1 truncate text-sm font-semibold text-ink">{getJobLocationLabel(job)}</p></div></div>{mapUrl ? <a href={mapUrl} target="_blank" rel="noreferrer" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-brand-blue px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-blue/90"><PortalIcon name="pin" className="h-4 w-4" />Open Google Maps</a> : null}</div>

            <div className="mt-5 rounded-2xl border border-line bg-surface-strong/50 p-4"><p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-brand-blue">Work brief</p><p className="mt-2 text-sm leading-6 text-ink">{job.description}</p>{job.requiredSkills ? <p className="mt-3 text-xs copy-muted"><span className="font-semibold text-ink">Skills:</span> {job.requiredSkills}</p> : null}{job.assignedTechnicianName ? <p className="mt-2 text-xs copy-muted"><span className="font-semibold text-ink">Assigned to:</span> {job.assignedTechnicianName}</p> : null}</div>

            {canRespond && job.status === "open" ? <div className="mt-5 rounded-2xl border border-brand-blue/20 bg-brand-blue/[0.05] p-4"><div className="mb-3"><p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-brand-blue">Your response</p><p className="mt-1 text-sm font-semibold text-ink">Claim this job if you can take it.</p></div><JobResponseForm jobId={job.id} /></div> : null}
          </section>
        </div>
      ) : null}
    </>
  );
}
