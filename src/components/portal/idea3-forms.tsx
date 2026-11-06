"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import {
  adjustPointsAction,
  approveRedemptionAction,
  assignServiceJobAction,
  broadcastServiceJobAction,
  createPointRuleAction,
  createRewardAction,
  createServiceJobAction,
  requestRedemptionAction,
  respondToServiceJobAction,
  submitJobCompletionAction,
  updateRedemptionStatusAction,
  updateRewardAction,
  updateServiceJobStatusAction,
  updatePointRuleAction,
  uploadJobAttachmentAction,
  verifyJobCompletionAction,
  type ActionState,
} from "@/lib/portal/actions";
import { PortalField, PortalMessage, PortalTextArea } from "@/components/portal/portal-ui";
import type { PointRuleRecord, RewardItemRecord, ServiceJobRecord } from "@/lib/portal/types";
import { jobCategories, jobStatuses, pointRuleTypes } from "@/lib/portal/types";

function SubmitButton({ label, pendingLabel = "Saving..." }: { label: string; pendingLabel?: string }) {
  const { pending } = useFormStatus();
  return <button type="submit" disabled={pending} className="action-primary disabled:cursor-wait disabled:opacity-60">{pending ? pendingLabel : label}</button>;
}

function JobSubmitButtons() {
  const { pending } = useFormStatus();
  return <div className="flex flex-wrap gap-2">
    <button type="submit" name="intent" value="draft" disabled={pending} className="action-secondary disabled:cursor-wait disabled:opacity-60">{pending ? "Saving..." : "Save draft"}</button>
    <button type="submit" name="intent" value="broadcast" disabled={pending} className="action-primary disabled:cursor-wait disabled:opacity-60">{pending ? "Deploying..." : "Deploy to technicians"}</button>
  </div>;
}

const categoryOptions = jobCategories.map((value) => ({ value, label: value.replaceAll("-", " ") }));
const statusOptions = jobStatuses.map((value) => ({ value, label: value.replaceAll("-", " ") }));

export function ServiceJobForm({ customers }: { customers: Array<{ id: string; name: string; phonePrimary: string }> }) {
  const [state, formAction] = useActionState<ActionState, FormData>(createServiceJobAction, {});
  return <form action={formAction} className="space-y-4">
    <PortalMessage error={state.error} />
    <div className="rounded-xl border border-[#cfe0fb] bg-[#f6f9ff] px-4 py-3 text-sm leading-6 text-[#35516f]"><span className="font-semibold text-[#173f70]">Dispatch workflow:</span> save a draft for later, or deploy immediately to all active technicians for first-acceptance-wins.</div>
    <div className="grid gap-4 sm:grid-cols-2">
      <PortalField label="Existing customer" name="customerId" options={[{ value: "", label: "Walk-in / new customer" }, ...customers.map((customer) => ({ value: customer.id, label: `${customer.name} — ${customer.phonePrimary}` }))]} />
      <PortalField label="Customer name" name="customerName" required />
      <PortalField label="Phone / WhatsApp" name="phone" required placeholder="+977 ..." />
      <PortalField label="Job category" name="category" required options={categoryOptions} />
      <PortalField label="Job title" name="title" required placeholder="Install 4 cameras at shop" />
      <PortalField label="Urgency" name="urgency" required options={[{ value: "normal", label: "Normal" }, { value: "urgent", label: "Urgent" }]} />
      <PortalField label="Site address" name="siteAddress" />
      <PortalField label="Area / locality" name="siteArea" />
      <PortalField label="Preferred start" name="preferredStart" type="datetime-local" />
      <PortalField label="Preferred end" name="preferredEnd" type="datetime-local" />
      <PortalField label="Estimated minutes" name="estimatedMinutes" type="number" min="1" step="1" placeholder="Optional" />
      <PortalField label="Acceptance deadline" name="acceptanceDeadline" type="datetime-local" />
      <PortalField label="Required skills" name="requiredSkills" placeholder="CCTV, ladder, networking" />
    </div>
    <details className="rounded-xl border border-line bg-surface-strong/45">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm font-semibold text-ink"><span className="flex items-center gap-2"><span className="text-brand-blue">⌖</span>Set exact map pin <span className="text-xs font-normal copy-muted">(optional)</span></span><span className="text-brand-blue">⌄</span></summary>
      <div className="grid gap-4 border-t border-line px-4 pb-4 pt-3 sm:grid-cols-2"><PortalField label="Latitude" name="siteLatitude" type="number" step="any" placeholder="27.7172" /><PortalField label="Longitude" name="siteLongitude" type="number" step="any" placeholder="85.3240" /><p className="text-xs leading-5 copy-muted sm:col-span-2">An address is enough for Google Maps. Add coordinates when the site is difficult to find.</p></div>
    </details>
    <PortalTextArea label="Work description" name="description" required placeholder="Describe the customer request and expected result." />
    <PortalTextArea label="Technician notes" name="technicianNotes" placeholder="Visible to technicians after broadcast." collapsible summary="Add technician notes" />
    <PortalTextArea label="Internal notes" name="internalNotes" placeholder="Owner / staff only." collapsible summary="Add internal notes" />
    <JobSubmitButtons />
  </form>;
}

export function JobBroadcastForm({ job }: { job: ServiceJobRecord }) {
  const action = broadcastServiceJobAction.bind(null, job.id);
  const [state, formAction] = useActionState<ActionState, FormData>(action, {});
  return <form action={formAction} className="space-y-3"><PortalMessage error={state.error} /><PortalField label="Acceptance deadline" name="acceptanceDeadline" type="datetime-local" defaultValue={job.acceptanceDeadline?.slice(0, 16) ?? ""} /><SubmitButton label="Broadcast to technicians" pendingLabel="Broadcasting..." /></form>;
}

export function JobResponseForm({ jobId }: { jobId: string }) {
  const action = respondToServiceJobAction.bind(null, jobId);
  const [state, formAction] = useActionState<ActionState, FormData>(action, {});
  return <form action={formAction} className="space-y-3"><PortalMessage error={state.error} /><PortalTextArea label="Optional note" name="reason" placeholder="Availability, travel note, or reason for declining" collapsible summary="Add a response note" /><div className="flex flex-wrap gap-2"><button name="status" value="accepted" className="action-primary" type="submit">Accept job</button><button name="status" value="declined" className="action-secondary" type="submit">Decline</button></div></form>;
}

export function JobAssignmentForm({ jobId, technicians }: { jobId: string; technicians: Array<{ id: string; name: string }> }) {
  const action = assignServiceJobAction.bind(null, jobId);
  const [state, formAction] = useActionState<ActionState, FormData>(action, {});
  return <form action={formAction} className="space-y-3"><PortalMessage error={state.error} /><PortalField label="Technician" name="technicianId" required options={[{ value: "", label: "Select technician" }, ...technicians.map((technician) => ({ value: technician.id, label: technician.name }))]} /><PortalTextArea label="Assignment note" name="reason" placeholder="Why this technician is being assigned" collapsible summary="Add assignment note" /><SubmitButton label="Assign technician" pendingLabel="Assigning..." /></form>;
}

export function JobStatusForm({ job, technicianOnly = false }: { job: ServiceJobRecord; technicianOnly?: boolean }) {
  const action = updateServiceJobStatusAction.bind(null, job.id);
  const [state, formAction] = useActionState<ActionState, FormData>(action, {});
  const options = technicianOnly ? statusOptions.filter((option) => option.value === "in-progress") : statusOptions;
  return <form action={formAction} className="space-y-3"><PortalMessage error={state.error} /><PortalField label="Status" name="status" defaultValue={job.status} options={options} /><PortalTextArea label="Status note" name="reason" placeholder="Optional context" collapsible summary="Add a status note" /><SubmitButton label="Update status" /></form>;
}

export function JobCompletionForm({ jobId, cameraRequired }: { jobId: string; cameraRequired: boolean }) {
  const action = submitJobCompletionAction.bind(null, jobId);
  const [state, formAction] = useActionState<ActionState, FormData>(action, {});
  return <form action={formAction} className="space-y-3"><PortalMessage error={state.error} /><PortalField label={cameraRequired ? "Cameras completed for this customer" : "Cameras completed (optional)"} name="cameraCount" type="number" min="1" step="1" required={cameraRequired} placeholder={cameraRequired ? "For example, 4" : "Only for camera work"} /><PortalTextArea label="Completion summary" name="summary" required placeholder="What was fixed, installed, or tested?" /><PortalTextArea label="Work notes" name="workNotes" placeholder="Measurements, test results, customer handover notes" collapsible summary="Add work notes" /><PortalTextArea label="Materials used" name="materials" placeholder="Optional materials or equipment used" collapsible summary="Add materials" /><SubmitButton label="Submit for verification" pendingLabel="Submitting..." /></form>;
}

export function JobAttachmentForm({ jobId }: { jobId: string }) {
  const action = uploadJobAttachmentAction.bind(null, jobId);
  const [state, formAction] = useActionState<ActionState, FormData>(action, {});
  return <form action={formAction} className="space-y-3"><PortalMessage error={state.error} /><input name="attachment" type="file" accept="image/jpeg,image/png,image/webp,application/pdf,video/mp4" required className="block w-full rounded-xl border border-line bg-white px-3 py-3 text-sm text-ink" /><p className="text-xs copy-muted">JPG, PNG, WebP, PDF, or MP4 up to 25 MB. Files stay private inside the portal.</p><SubmitButton label="Add evidence" pendingLabel="Uploading..." /></form>;
}

export function JobVerificationForm({ jobId }: { jobId: string }) {
  const action = verifyJobCompletionAction.bind(null, jobId);
  const [state, formAction] = useActionState<ActionState, FormData>(action, {});
  return <form action={formAction} className="space-y-3"><PortalMessage error={state.error} /><PortalTextArea label="Review note" name="reason" placeholder="Required when returning or useful for the technician" collapsible summary="Add review note" /><div className="flex flex-wrap gap-2"><button name="decision" value="approve" className="action-primary" type="submit">Verify and award points</button><button name="decision" value="return" className="action-secondary" type="submit">Return for correction</button></div></form>;
}

function pointRuleFields(rule?: PointRuleRecord) {
  return <div className="grid gap-4 sm:grid-cols-2"><PortalField label="Rule name" name="name" defaultValue={rule?.name ?? ""} required /><PortalField label="Rule type" name="type" defaultValue={rule?.type ?? "verified-completion"} required options={pointRuleTypes.map((value) => ({ value, label: value.replaceAll("-", " ") }))} /><PortalField label="Points" name="points" type="number" min="1" step="1" defaultValue={rule ? String(rule.points) : "50"} required /><PortalField label="Category (optional)" name="category" defaultValue={rule?.category ?? ""} options={[{ value: "", label: "All categories" }, ...categoryOptions]} /><PortalField label="Sample / policy label" name="sampleLabel" defaultValue={rule?.sampleLabel ?? ""} placeholder="Confirm final value with management" /><input type="hidden" name="enabled" value={rule?.enabled === false ? "false" : "true"} /></div>;
}

export function PointRuleForm({ rule }: { rule?: PointRuleRecord }) {
  const action = rule ? updatePointRuleAction.bind(null, rule.id) : createPointRuleAction;
  const [state, formAction] = useActionState<ActionState, FormData>(action, {});
  return <form action={formAction} className="space-y-4"><PortalMessage error={state.error} />{pointRuleFields(rule)}<SubmitButton label={rule ? "Update rule" : "Add points rule"} /></form>;
}

export function PointAdjustmentForm({ technicians }: { technicians: Array<{ id: string; name: string }> }) {
  const [state, formAction] = useActionState<ActionState, FormData>(adjustPointsAction, {});
  return <form action={formAction} className="space-y-4"><PortalMessage error={state.error} /><PortalField label="Technician" name="technicianId" required options={[{ value: "", label: "Select technician" }, ...technicians.map((technician) => ({ value: technician.id, label: technician.name }))]} /><PortalField label="Points adjustment" name="points" type="number" step="1" placeholder="50 or -20" required /><PortalTextArea label="Reason" name="reason" required placeholder="Correction, milestone, or approved manual adjustment" /><SubmitButton label="Post adjustment" /></form>;
}

export function RewardForm({ reward }: { reward?: RewardItemRecord }) {
  const action = reward ? updateRewardAction.bind(null, reward.id) : createRewardAction;
  const [state, formAction] = useActionState<ActionState, FormData>(action, {});
  return <form action={formAction} className="space-y-4"><PortalMessage error={state.error} /><div className="grid gap-4 sm:grid-cols-2"><PortalField label="Reward name" name="name" defaultValue={reward?.name ?? ""} required /><PortalField label="Category" name="category" defaultValue={reward?.category ?? "Gift"} required /><PortalField label="Points cost" name="pointsCost" type="number" min="1" step="1" defaultValue={reward ? String(reward.pointsCost) : "100"} required /><PortalField label="Stock quantity" name="stockQuantity" type="number" min="0" step="1" defaultValue={reward ? String(reward.stockQuantity) : "1"} required /><PortalField label="Image path (optional)" name="imagePath" defaultValue={reward?.imagePath ?? ""} placeholder="/product-assets-managed/..." /></div><PortalTextArea label="Description" name="description" defaultValue={reward?.description ?? ""} placeholder="What the technician receives" collapsible summary="Add reward description" /><input type="hidden" name="active" value={reward?.active === false ? "false" : "true"} /><SubmitButton label={reward ? "Update reward" : "Add reward"} /></form>;
}

export function RedemptionForm({ reward }: { reward: RewardItemRecord }) {
  const action = requestRedemptionAction.bind(null, reward.id);
  const [state, formAction] = useActionState<ActionState, FormData>(action, {});
  return <form action={formAction} className="mt-4 space-y-3"><PortalMessage error={state.error} /><PortalField label="Quantity" name="quantity" type="number" min="1" step="1" defaultValue="1" required /><PortalTextArea label="Note" name="notes" placeholder="Optional collection note" collapsible summary="Add collection note" /><SubmitButton label="Request reward" pendingLabel="Requesting..." /></form>;
}

export function RedemptionApprovalForm({ redemptionId }: { redemptionId: string }) {
  const action = approveRedemptionAction.bind(null, redemptionId);
  const [state, formAction] = useActionState<ActionState, FormData>(action, {});
  return <form action={formAction} className="mt-3 space-y-2"><PortalMessage error={state.error} /><PortalField label="Review note" name="reason" placeholder="Optional" /><div className="flex gap-2"><button name="decision" value="approve" className="action-primary" type="submit">Approve</button><button name="decision" value="reject" className="action-secondary" type="submit">Reject</button></div></form>;
}

export function RedemptionStatusForm({ redemptionId, currentStatus }: { redemptionId: string; currentStatus: string }) {
  const action = updateRedemptionStatusAction.bind(null, redemptionId);
  const [state, formAction] = useActionState<ActionState, FormData>(action, {});
  return <form action={formAction} className="mt-3 flex flex-wrap items-end gap-2"><PortalMessage error={state.error} /><div className="min-w-44 flex-1"><PortalField label="Next status" name="status" defaultValue={currentStatus === "approved" ? "ready" : "collected"} options={[{ value: "ready", label: "Ready for collection" }, { value: "collected", label: "Collected" }, { value: "cancelled", label: "Cancelled" }]} /></div><div className="min-w-44 flex-1"><PortalField label="Note" name="reason" /></div><SubmitButton label="Update" /></form>;
}
