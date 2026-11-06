"use client";

import { useActionState, useState, type ChangeEvent } from "react";
import { useFormStatus } from "react-dom";
import Image from "next/image";
import {
  acceptInviteAction,
  createCustomerAction,
  createEnquiryAction,
  createInviteAction,
  createInstallationItemAction,
  createPaymentAction,
  createPaymentAdjustmentAction,
  createProductAction,
  importProductsCsvAction,
  createProjectAction,
  createQuotationAction,
  createSiteSurveyAction,
  createScheduleEventAction,
  createSupportTicketAction,
  customerTicketAccessAction,
  loginAction,
  revokePortalSessionForUser,
  setupOwnerAction,
  updatePortalUserRoleAction,
  updatePortalProfileAction,
  updateCustomerAction,
  updateEnquiryAction,
  updateProjectAction,
  updateProductAction,
  updateQuotationStatusAction,
  updateScheduleEventStatusAction,
  rescheduleEventAction,
  updateServiceTicketAction,
  uploadTicketAttachmentAction,
  type ActionState,
} from "@/lib/portal/actions";
import { PortalField, PortalIcon, PortalIconButton, PortalMessage, PortalTextArea } from "@/components/portal/portal-ui";
import type { CustomerRecord, EnquiryRecord, PortalRole, ProductRecord, ProjectRecord, QuotationRecord, ScheduleEventRecord, ServiceTicketRecord } from "@/lib/portal/types";
import { portalRoleLabels, productAvailabilities, productPriceDisplayModes, productPriceTypes, productPublicationStatuses } from "@/lib/portal/types";
import type { CatalogProduct } from "@/types/site";
import { formatNpr } from "@/lib/urls";
import { parseCsvText, productCsvHeaders, type ProductImportRow } from "@/lib/portal/product-csv";

function SubmitButton({ label, pendingLabel = "Saving..." }: { label: string; pendingLabel?: string }) {
  const { pending } = useFormStatus();
  return <button type="submit" disabled={pending} className="action-primary disabled:cursor-wait disabled:opacity-60">{pending ? pendingLabel : label}</button>;
}

export function LoginForm() {
  const [state, formAction] = useActionState<ActionState, FormData>(loginAction, {});

  return (
    <form action={formAction} className="mt-6 space-y-4">
      <PortalMessage error={state.error} />
      <PortalField label="Email" name="email" type="email" placeholder="owner@example.com" required />
      <PortalField label="Password" name="password" type="password" required />
      <SubmitButton label="Sign in" pendingLabel="Signing in..." />
    </form>
  );
}

export function SetupOwnerForm() {
  const [state, formAction] = useActionState<ActionState, FormData>(setupOwnerAction, {});

  return (
    <form action={formAction} className="mt-6 space-y-4">
      <PortalMessage error={state.error} />
      <PortalField label="Owner name" name="name" placeholder="Your name" required />
      <PortalField label="Owner email" name="email" type="email" defaultValue="suvashshah251@gmail.com" required />
      <PortalField label="WhatsApp / phone" name="phone" defaultValue="+977 9855026835" placeholder="+977 ..." required />
      <PortalField label="Bootstrap key" name="bootstrapKey" type="password" required />
      <PortalField label="Create password" name="password" type="password" placeholder="At least 12 characters" required />
      <SubmitButton label="Create owner account" pendingLabel="Creating account..." />
    </form>
  );
}

export function InviteForm() {
  const [state, formAction] = useActionState<ActionState, FormData>(createInviteAction, {});

  return (
    <form action={formAction} className="space-y-4">
      <PortalMessage error={state.error} success={state.success} />
      <PortalField label="Name" name="name" placeholder="Team member name" required />
      <PortalField label="Email" name="email" type="email" placeholder="team@example.com" required />
      <PortalField label="WhatsApp / phone" name="phone" placeholder="Optional, +977 ..." />
      <PortalField
        label="Role"
        name="role"
        required
        options={[
          { value: "owner", label: "Owner" },
          { value: "manager", label: portalRoleLabels.manager },
          { value: "staff", label: "Staff" },
          { value: "technician", label: "Technician" },
        ]}
      />
      {state.inviteUrl ? (
        <div className="rounded-xl border border-brand-blue/20 bg-brand-blue/[0.06] p-3">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-blue">One-time invite link</p>
          <input readOnly value={state.inviteUrl} className="mt-2 w-full rounded-lg border border-line bg-white px-3 py-2 text-xs text-ink" />
          <p className="mt-2 text-xs leading-5 copy-muted">This link expires in 48 hours. Share it privately and create a new invite if it is lost.</p>
        </div>
      ) : null}
      <SubmitButton label="Create invite" pendingLabel="Creating invite..." />
    </form>
  );
}

export function ProfileForm({ phone }: { phone: string | null }) {
  const [state, formAction] = useActionState<ActionState, FormData>(updatePortalProfileAction, {});

  return (
    <form action={formAction} className="space-y-4">
      <PortalMessage error={state.error} success={state.success} />
      <PortalField label="WhatsApp / phone" name="phone" defaultValue={phone ?? ""} placeholder="+977 ..." />
      <p className="text-xs leading-5 copy-muted">This lets the team open a direct WhatsApp handoff when needed. Automatic SMS/WhatsApp delivery still requires a provider.</p>
      <SubmitButton label="Save contact number" pendingLabel="Saving..." />
    </form>
  );
}

export function AcceptInviteForm({ token }: { token: string }) {
  const action = acceptInviteAction.bind(null, token);
  const [state, formAction] = useActionState<ActionState, FormData>(action, {});

  return (
    <form action={formAction} className="mt-6 space-y-4">
      <PortalMessage error={state.error} />
      <PortalField label="Create password" name="password" type="password" placeholder="At least 12 characters" required />
      <SubmitButton label="Activate account" pendingLabel="Activating..." />
    </form>
  );
}

export function CustomerForm() {
  const [state, formAction] = useActionState<ActionState, FormData>(createCustomerAction, {});

  return (
    <form action={formAction} className="space-y-4">
      <PortalMessage error={state.error} />
      <div className="grid gap-4 sm:grid-cols-2">
        <PortalField label="Customer name" name="name" required />
        <PortalField label="Customer type" name="customerType" required options={[{ value: "individual", label: "Individual" }, { value: "business", label: "Business / organization" }]} />
        <PortalField label="Business name" name="businessName" placeholder="Optional" />
        <PortalField label="Primary phone" name="phonePrimary" placeholder="+977 ..." required />
        <PortalField label="Secondary phone" name="phoneSecondary" placeholder="Optional" />
        <PortalField label="Email" name="email" type="email" placeholder="Optional" />
        <PortalField label="Area / locality" name="area" placeholder="Narayangarh" />
        <PortalField label="Address" name="address" placeholder="Optional" />
      </div>
      <PortalTextArea label="Notes" name="notes" placeholder="Contact preferences or useful context" collapsible summary="Add customer notes" />
      <SubmitButton label="Save customer" />
    </form>
  );
}

export function EditCustomerForm({ customer }: { customer: CustomerRecord }) {
  const action = updateCustomerAction.bind(null, customer.id);
  const [state, formAction] = useActionState<ActionState, FormData>(action, {});

  return (
    <form action={formAction} className="space-y-4">
      <PortalMessage error={state.error} success={state.success} />
      <div className="grid gap-4 sm:grid-cols-2">
        <PortalField label="Customer name" name="name" defaultValue={customer.name} required />
        <PortalField label="Customer type" name="customerType" defaultValue={customer.customerType} required options={[{ value: "individual", label: "Individual" }, { value: "business", label: "Business / organization" }]} />
        <PortalField label="Business name" name="businessName" defaultValue={customer.businessName ?? ""} placeholder="Optional" />
        <PortalField label="Primary phone" name="phonePrimary" defaultValue={customer.phonePrimary} placeholder="+977 ..." required />
        <PortalField label="Secondary phone" name="phoneSecondary" defaultValue={customer.phoneSecondary ?? ""} placeholder="Optional" />
        <PortalField label="Email" name="email" type="email" defaultValue={customer.email ?? ""} placeholder="Optional" />
        <PortalField label="Area / locality" name="area" defaultValue={customer.area ?? ""} placeholder="Narayangarh" />
        <PortalField label="Address" name="address" defaultValue={customer.address ?? ""} placeholder="Optional" />
      </div>
      <PortalTextArea label="Notes" name="notes" defaultValue={customer.notes ?? ""} placeholder="Contact preferences or useful context" collapsible summary="Add customer notes" />
      <SubmitButton label="Update customer" />
    </form>
  );
}

export function EnquiryForm({ users }: { users: Array<{ id: string; name: string; role: PortalRole }> }) {
  const [state, formAction] = useActionState<ActionState, FormData>(createEnquiryAction, {});

  return (
    <form action={formAction} className="space-y-4">
      <PortalMessage error={state.error} />
      <div className="grid gap-4 sm:grid-cols-2">
        <PortalField label="Customer name" name="customerName" required />
        <PortalField label="Phone number" name="phonePrimary" placeholder="+977 ..." required />
        <PortalField label="Enquiry type" name="type" required options={[{ value: "new-installation", label: "New CCTV installation" }, { value: "product-purchase", label: "Product purchase" }, { value: "repair-maintenance", label: "Repair / maintenance" }, { value: "other", label: "Other" }]} />
        <PortalField label="Source" name="source" required options={[{ value: "phone", label: "Phone call" }, { value: "whatsapp", label: "WhatsApp" }, { value: "website", label: "Website" }, { value: "walk-in", label: "Walk-in" }, { value: "referral", label: "Referral" }, { value: "other", label: "Other" }]} />
        <PortalField label="Area / locality" name="area" />
        <PortalField label="Follow-up date" name="followUpAt" type="date" />
        <PortalField label="Assign to" name="assignedTo" options={[{ value: "", label: "Unassigned" }, ...users.map((user) => ({ value: user.id, label: `${user.name} (${user.role})` }))]} />
      </div>
      <input type="hidden" name="customerId" value="" />
      <PortalTextArea label="Notes" name="notes" placeholder="What does the customer need?" collapsible summary="Add enquiry notes" />
      <SubmitButton label="Save enquiry" />
    </form>
  );
}

export function EditEnquiryForm({ enquiry, users }: { enquiry: EnquiryRecord; users: Array<{ id: string; name: string; role: PortalRole }> }) {
  const action = updateEnquiryAction.bind(null, enquiry.id);
  const [state, formAction] = useActionState<ActionState, FormData>(action, {});

  return (
    <form action={formAction} className="space-y-4">
      <PortalMessage error={state.error} success={state.success} />
      <div className="grid gap-4 sm:grid-cols-2">
        <PortalField label="Enquiry type" name="type" defaultValue={enquiry.type} required options={[{ value: "new-installation", label: "New CCTV installation" }, { value: "product-purchase", label: "Product purchase" }, { value: "repair-maintenance", label: "Repair / maintenance" }, { value: "other", label: "Other" }]} />
        <PortalField label="Source" name="source" defaultValue={enquiry.source} required options={[{ value: "phone", label: "Phone call" }, { value: "whatsapp", label: "WhatsApp" }, { value: "website", label: "Website" }, { value: "walk-in", label: "Walk-in" }, { value: "referral", label: "Referral" }, { value: "other", label: "Other" }]} />
        <PortalField label="Status" name="status" defaultValue={enquiry.status} required options={[{ value: "new", label: "New" }, { value: "contacted", label: "Contacted" }, { value: "survey-required", label: "Survey required" }, { value: "quotation-in-progress", label: "Quotation in progress" }, { value: "converted", label: "Converted" }, { value: "lost", label: "Lost" }]} />
        <PortalField label="Area / locality" name="area" defaultValue={enquiry.area ?? ""} />
        <PortalField label="Follow-up date" name="followUpAt" type="date" defaultValue={enquiry.followUpAt?.slice(0, 10) ?? ""} />
        <PortalField label="Assign to" name="assignedTo" defaultValue={enquiry.assignedTo ?? ""} options={[{ value: "", label: "Unassigned" }, ...users.map((user) => ({ value: user.id, label: `${user.name} (${user.role})` }))]} />
      </div>
      <PortalTextArea label="Notes" name="notes" defaultValue={enquiry.notes ?? ""} placeholder="What does the customer need?" collapsible summary="Add enquiry notes" />
      <SubmitButton label="Update enquiry" />
    </form>
  );
}

export function ProjectForm({ customers }: { customers: Array<{ id: string; name: string; phonePrimary: string }> }) {
  const [state, formAction] = useActionState<ActionState, FormData>(createProjectAction, {});

  return (
    <form action={formAction} className="space-y-4">
      <PortalMessage error={state.error} />
      <div className="grid gap-4 sm:grid-cols-2">
        <PortalField label="Customer" name="customerId" required options={[{ value: "", label: "Select a customer" }, ...customers.map((customer) => ({ value: customer.id, label: `${customer.name} — ${customer.phonePrimary}` }))]} />
        <PortalField label="Project title" name="title" placeholder="CCTV installation" required />
        <PortalField label="Project type" name="projectType" placeholder="Home / office / shop" required />
        <PortalField label="Project stage" name="status" required options={[{ value: "new-enquiry", label: "New enquiry" }, { value: "survey-scheduled", label: "Survey scheduled" }, { value: "survey-completed", label: "Survey completed" }, { value: "quotation-preparation", label: "Quotation preparation" }, { value: "quotation-sent", label: "Quotation sent" }, { value: "awaiting-approval", label: "Awaiting approval" }, { value: "approved", label: "Approved" }, { value: "installation-scheduled", label: "Installation scheduled" }, { value: "installation-in-progress", label: "Installation in progress" }, { value: "completed", label: "Completed" }, { value: "cancelled", label: "Cancelled" }]} />
        <PortalField label="Site address" name="siteAddress" />
        <PortalField label="Area / locality" name="area" />
        <PortalField label="Planned installation date" name="plannedInstallDate" type="date" />
        <PortalField label="Estimated amount (NPR)" name="estimatedAmount" type="number" placeholder="Optional" />
        <PortalField label="Site latitude" name="siteLatitude" type="number" placeholder="Optional" />
        <PortalField label="Site longitude" name="siteLongitude" type="number" placeholder="Optional" />
      </div>
      <PortalTextArea label="Site instructions" name="siteInstructions" placeholder="Entrance, floor, access instructions, or nearby landmark" collapsible summary="Add site instructions" />
      <PortalTextArea label="Notes" name="notes" placeholder="Survey or project context" collapsible summary="Add project notes" />
      <SubmitButton label="Save project" />
    </form>
  );
}

export function EditProjectForm({ project }: { project: ProjectRecord }) {
  const action = updateProjectAction.bind(null, project.id);
  const [state, formAction] = useActionState<ActionState, FormData>(action, {});

  return (
    <form action={formAction} className="space-y-4">
      <PortalMessage error={state.error} success={state.success} />
      <div className="grid gap-4 sm:grid-cols-2">
        <PortalField label="Project title" name="title" defaultValue={project.title} required />
        <PortalField label="Project type" name="projectType" defaultValue={project.projectType} required />
        <PortalField label="Project stage" name="status" defaultValue={project.status} required options={[{ value: "new-enquiry", label: "New enquiry" }, { value: "survey-scheduled", label: "Survey scheduled" }, { value: "survey-completed", label: "Survey completed" }, { value: "quotation-preparation", label: "Quotation preparation" }, { value: "quotation-sent", label: "Quotation sent" }, { value: "awaiting-approval", label: "Awaiting approval" }, { value: "approved", label: "Approved" }, { value: "installation-scheduled", label: "Installation scheduled" }, { value: "installation-in-progress", label: "Installation in progress" }, { value: "completed", label: "Completed" }, { value: "cancelled", label: "Cancelled" }]} />
        <PortalField label="Site address" name="siteAddress" defaultValue={project.siteAddress ?? ""} />
        <PortalField label="Area / locality" name="area" defaultValue={project.area ?? ""} />
        <PortalField label="Planned installation date" name="plannedInstallDate" type="date" defaultValue={project.plannedInstallDate?.slice(0, 10) ?? ""} />
        <PortalField label="Estimated amount (NPR)" name="estimatedAmount" type="number" defaultValue={project.estimatedAmount === null ? "" : String(project.estimatedAmount)} placeholder="Optional" />
        <PortalField label="Site latitude" name="siteLatitude" type="number" defaultValue={project.siteLatitude === null ? "" : String(project.siteLatitude)} placeholder="Optional" />
        <PortalField label="Site longitude" name="siteLongitude" type="number" defaultValue={project.siteLongitude === null ? "" : String(project.siteLongitude)} placeholder="Optional" />
        <PortalField label="Warranty start date" name="warrantyStartDate" type="date" defaultValue={project.warrantyStartDate?.slice(0, 10) ?? ""} />
      </div>
      <PortalTextArea label="Site instructions" name="siteInstructions" defaultValue={project.siteInstructions ?? ""} placeholder="Entrance, floor, access instructions, or nearby landmark" collapsible summary="Edit site instructions" />
      <p className="text-xs leading-5 copy-muted">Completed projects receive the default one-year warranty from this date. Leave it blank until handover if the installation is not complete.</p>
      <PortalTextArea label="Notes" name="notes" defaultValue={project.notes ?? ""} placeholder="Survey or project context" collapsible summary="Edit project notes" />
      <SubmitButton label="Update project" />
    </form>
  );
}

export function SiteSurveyForm({ projectId, users, today }: { projectId: string; users: Array<{ id: string; name: string; role: PortalRole }>; today: string }) {
  const action = createSiteSurveyAction.bind(null, projectId);
  const [state, formAction] = useActionState<ActionState, FormData>(action, {});

  return (
    <form action={formAction} className="space-y-4">
      <PortalMessage error={state.error} success={state.success} />
      <div className="grid gap-4 sm:grid-cols-2">
        <PortalField label="Survey date / time" name="surveyDate" type="datetime-local" defaultValue={`${today}T09:00`} required />
        <PortalField label="Surveyor" name="surveyorId" options={[{ value: "", label: "Not assigned" }, ...users.map((user) => ({ value: user.id, label: `${user.name} (${user.role})` }))]} />
        <PortalField label="Property type" name="propertyType" placeholder="Home, office, shop, factory" />
        <PortalField label="Installation area" name="installationArea" placeholder="Floors, rooms, gates, yard" />
        <PortalField label="Approx. camera count" name="cameraCount" type="number" placeholder="Optional" />
        <PortalField label="Camera type / coverage" name="cameraType" placeholder="Indoor dome, outdoor bullet, PTZ" />
        <PortalField label="Indoor / outdoor requirements" name="indoorOutdoor" placeholder="Optional" />
        <PortalField label="Approx. cable length (m)" name="cableLength" type="number" placeholder="Optional" />
      </div>
      <PortalTextArea label="Cable routes" name="cableRoutes" placeholder="Routes, conduits, ceiling access, or difficult runs" collapsible summary="Add cable route notes" />
      <div className="grid gap-4 sm:grid-cols-2">
        <PortalTextArea label="DVR / NVR and storage" name="storageRequirements" placeholder="Recorder location, retention, hard-drive requirements" collapsible summary="Add storage notes" />
        <PortalTextArea label="Networking and power" name="networkingNeeds" placeholder="PoE switch, router, power backup, internet needs" collapsible summary="Add networking notes" />
        <PortalTextArea label="Mounting / access constraints" name="mountingConstraints" placeholder="Height, ladders, permissions, safety, access" collapsible summary="Add access notes" />
        <PortalTextArea label="Customer requirements" name="customerRequirements" placeholder="What the customer specifically requested" collapsible summary="Add customer requirements" />
        <PortalTextArea label="Survey outcome" name="outcome" placeholder="Ready for quotation, needs clarification, revisit required" collapsible summary="Add survey outcome" />
        <PortalTextArea label="Next steps" name="nextSteps" placeholder="Quotation, second visit, approval, or installation plan" collapsible summary="Add next steps" />
      </div>
      <SubmitButton label="Record site survey" pendingLabel="Recording..." />
    </form>
  );
}

export function ScheduleEventForm({ projects, tickets, users, today }: { projects: Array<{ id: string; reference: string; title: string }>; tickets: Array<{ id: string; reference: string; customerName: string }>; users: Array<{ id: string; name: string; role: PortalRole }>; today: string }) {
  const [state, formAction] = useActionState<ActionState, FormData>(createScheduleEventAction, {});

  return (
    <form action={formAction} className="space-y-4">
      <PortalMessage error={state.error} success={state.success} />
      <div className="grid gap-4 sm:grid-cols-2">
        <PortalField label="Work type" name="eventType" required options={[{ value: "survey", label: "Site survey" }, { value: "installation", label: "Installation" }, { value: "service-visit", label: "Service visit" }]} />
        <PortalField label="Title" name="title" placeholder="CCTV site survey" required />
        <PortalField label="Starts" name="scheduledStart" type="datetime-local" defaultValue={`${today}T09:00`} required />
        <PortalField label="Ends" name="scheduledEnd" type="datetime-local" defaultValue={`${today}T10:00`} required />
        <PortalField label="Project" name="projectId" options={[{ value: "", label: "No project linked" }, ...projects.map((project) => ({ value: project.id, label: `${project.reference} — ${project.title}` }))]} />
        <PortalField label="Support ticket" name="ticketId" options={[{ value: "", label: "No ticket linked" }, ...tickets.map((ticket) => ({ value: ticket.id, label: `${ticket.reference} — ${ticket.customerName}` }))]} />
        <PortalField label="Assign to" name="assignedTo" options={[{ value: "", label: "Unassigned" }, ...users.map((user) => ({ value: user.id, label: `${user.name} (${user.role})` }))]} />
      </div>
      <PortalTextArea label="Notes" name="notes" placeholder="Visit details, access instructions, or preparation notes" collapsible summary="Add visit notes" />
      <label className="flex items-start gap-2 text-xs leading-5 copy-muted"><input type="checkbox" name="allowConflict" className="mt-1" /> Allow an overlapping assignment after reviewing the conflict.</label>
      <SubmitButton label="Schedule work" pendingLabel="Scheduling..." />
    </form>
  );
}

export function ScheduleEventStatusForm({ event }: { event: ScheduleEventRecord }) {
  const action = updateScheduleEventStatusAction.bind(null, event.id);
  const [state, formAction] = useActionState<ActionState, FormData>(action, {});

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-3">
      <div className="min-w-48 flex-1"><PortalField label="Status" name="status" defaultValue={event.status} required options={[{ value: "scheduled", label: "Scheduled" }, { value: "in-progress", label: "In progress" }, { value: "completed", label: "Completed" }, { value: "cancelled", label: "Cancelled" }, { value: "rescheduled", label: "Rescheduled" }]} /></div>
      <SubmitButton label="Save status" pendingLabel="Saving..." />
      {state.error ? <p className="basis-full text-xs text-brand-red">{state.error}</p> : null}
    </form>
  );
}

export function ScheduleEventRescheduleForm({ event }: { event: ScheduleEventRecord }) {
  const action = rescheduleEventAction.bind(null, event.id);
  const [state, formAction] = useActionState<ActionState, FormData>(action, {});

  return (
    <form action={formAction} className="mt-3 rounded-xl border border-line bg-surface-strong/40 p-3">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-blue">Reschedule</p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <PortalField label="New start" name="scheduledStart" type="datetime-local" defaultValue={event.scheduledStart.slice(0, 16)} required />
        <PortalField label="New end" name="scheduledEnd" type="datetime-local" defaultValue={event.scheduledEnd.slice(0, 16)} required />
      </div>
      <div className="mt-3"><PortalTextArea label="Reason / updated notes" name="notes" defaultValue={event.notes ?? ""} placeholder="Why the time changed or what the team should know" collapsible summary="Add a reschedule note" /></div>
      <label className="mt-3 flex items-center gap-2 text-xs font-semibold text-ink"><input type="checkbox" name="allowConflict" value="on" className="h-4 w-4 rounded border-line" /> Override an overlapping assignment</label>
      <div className="mt-3 flex items-center gap-3"><SubmitButton label="Save new time" pendingLabel="Rescheduling..." />{state.error ? <p className="text-xs text-brand-red">{state.error}</p> : null}</div>
    </form>
  );
}

type QuoteLine = { description: string; quantity: number; unitPrice: number };
type QuotationCatalogProduct = Pick<CatalogProduct, "id" | "name" | "brand" | "model" | "categoryName" | "price" | "priceType" | "image">;

const quoteInputClass = "h-10 w-full rounded-lg border border-line bg-white px-3 text-sm text-ink outline-none transition placeholder:text-gray-400 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/10";

export function QuotationForm({ customers, projects, products, vatRate, validityDays }: { customers: Array<{ id: string; name: string; phonePrimary: string }>; projects: Array<{ id: string; customerId: string; reference: string; title: string }>; products: QuotationCatalogProduct[]; vatRate: number; validityDays: number }) {
  const [state, formAction] = useActionState<ActionState, FormData>(createQuotationAction, {});
  const [items, setItems] = useState<QuoteLine[]>([{ description: "", quantity: 1, unitPrice: 0 }]);
  const [productSearch, setProductSearch] = useState("");
  const normalizedProductSearch = productSearch.trim().toLowerCase();
  const hasProductSearch = normalizedProductSearch.length > 0;

  const visibleProducts = products
    .filter((product) => {
      if (!hasProductSearch) return false;
      return [product.name, product.brand, product.model ?? "", product.categoryName].join(" ").toLowerCase().includes(normalizedProductSearch);
    })
    .slice(0, 12);

  function updateItem(index: number, key: keyof QuoteLine, value: string) {
    setItems((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, [key]: key === "description" ? value : Number(value) } : item));
  }

  function addCatalogProduct(product: QuotationCatalogProduct) {
    const price = product.price;
    if (price === null) return;
    const description = `${product.brand} ${product.name}${product.model ? ` (${product.model})` : ""}`;
    setItems((current) => {
      const emptyLineIndex = current.findIndex((item) => !item.description.trim());
      const nextItem = { description, quantity: 1, unitPrice: price };
      if (emptyLineIndex === -1) return [...current, nextItem];
      return current.map((item, index) => index === emptyLineIndex ? nextItem : item);
    });
  }

  return (
    <form action={formAction} className="space-y-5">
      <PortalMessage error={state.error} success={state.success} />
      <div className="grid gap-4 sm:grid-cols-2">
        <PortalField label="Customer" name="customerId" required options={[{ value: "", label: "Select a customer" }, ...customers.map((customer) => ({ value: customer.id, label: `${customer.name} — ${customer.phonePrimary}` }))]} />
        <PortalField label="Related project" name="projectId" options={[{ value: "", label: "No project linked" }, ...projects.map((project) => ({ value: project.id, label: `${project.reference} — ${project.title}` }))]} />
        <PortalField label="VAT rate (%)" name="vatRate" type="number" defaultValue={String(vatRate)} required />
        <PortalField label="Valid for (days)" name="validDays" type="number" defaultValue={String(validityDays)} required />
      </div>

      <div>
        <div className="flex items-end justify-between gap-3">
          <div><p className="text-sm font-semibold text-ink">Quote items</p><p className="mt-1 text-xs copy-muted">Choose a catalog item or add a custom service line. Prices remain editable before VAT.</p></div>
          <button type="button" className="action-secondary inline-flex items-center gap-1.5 text-xs" onClick={() => setItems((current) => [...current, { description: "", quantity: 1, unitPrice: 0 }])}><PortalIcon name="plus" className="h-3.5 w-3.5" />Add item</button>
        </div>

        {products.length ? (
          <div className="mt-3 rounded-xl border border-brand-blue/20 bg-brand-blue/[0.04] p-3 sm:p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-blue">Visual product picker</p>
                <p className="mt-1 text-xs copy-muted">Search by product, brand, model, or category, then add it to the quote.</p>
              </div>
              <div className="relative w-full sm:max-w-xs">
                <PortalIcon name="search" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-blue" />
                <input autoFocus value={productSearch} onChange={(event) => setProductSearch(event.target.value)} placeholder="Start typing to search" className={`${quoteInputClass} pl-8`} aria-label="Search catalog products" />
              </div>
            </div>
            {hasProductSearch ? (
              <>
                <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {visibleProducts.map((product) => (
                    <button key={product.id} type="button" onClick={() => addCatalogProduct(product)} disabled={product.price === null} className="group min-w-0 rounded-xl border border-line bg-white p-3 text-left transition hover:border-brand-blue hover:bg-brand-blue/[0.03] disabled:cursor-not-allowed disabled:opacity-65">
                      <span className="relative block h-32 w-full overflow-hidden rounded-lg bg-surface-strong">
                        <Image src={product.image} alt={product.name} fill sizes="(max-width: 640px) 100vw, 260px" className="object-contain p-3" unoptimized />
                      </span>
                      <span className="mt-3 block"><span className="block text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-brand-blue">{product.brand} · {product.categoryName}</span><span className="mt-1 block min-h-[2.75rem] text-sm font-semibold leading-5 text-ink group-hover:text-brand-blue">{product.name}</span>{product.model ? <span className="mt-1 block truncate text-xs copy-muted">Model: {product.model}</span> : null}<span className="mt-3 flex items-center justify-between gap-2 border-t border-line pt-3"><span className="text-sm font-semibold text-ink">{product.price === null ? "Contact for price" : formatNpr(product.price)}</span><span className="text-xs font-semibold text-brand-blue">{product.price === null ? "Unavailable" : "Add +"}</span></span></span>
                    </button>
                  ))}
                </div>
                {!visibleProducts.length ? <p className="mt-3 text-xs copy-muted">No catalog product matches that search.</p> : null}
                {visibleProducts.length === 12 ? <p className="mt-3 text-[0.68rem] copy-muted">Showing the first 12 matches. Add more search words to narrow the list.</p> : null}
              </>
            ) : (
              <div className="mt-4 flex items-center gap-3 rounded-xl border border-dashed border-brand-blue/30 bg-white/70 px-4 py-5 text-sm text-ink">
                <span aria-hidden="true" className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-blue/[0.08] text-brand-blue"><PortalIcon name="search" /></span>
                <span><strong className="font-semibold">Search the catalog to begin.</strong><span className="mt-1 block text-xs copy-muted">Type a product, brand, model, or category. The full catalog stays hidden until you search.</span></span>
              </div>
            )}
          </div>
        ) : null}

        <div className="mt-3 space-y-3">
          {items.map((item, index) => (
            <div key={index} className="grid gap-2 rounded-xl border border-line bg-white p-3 sm:grid-cols-[1fr_7rem_9rem_auto] sm:items-end">
              <label className="text-xs font-semibold text-ink">Description<input className={`${quoteInputClass} mt-1`} value={item.description} onChange={(event) => updateItem(index, "description", event.target.value)} required /></label>
              <label className="text-xs font-semibold text-ink">Qty<input className={`${quoteInputClass} mt-1`} type="number" min="0.01" step="0.01" value={item.quantity} onChange={(event) => updateItem(index, "quantity", event.target.value)} required /></label>
              <label className="text-xs font-semibold text-ink">Unit price<input className={`${quoteInputClass} mt-1`} type="number" min="0" step="0.01" value={item.unitPrice} onChange={(event) => updateItem(index, "unitPrice", event.target.value)} required /></label>
              <PortalIconButton label={`Remove quote item ${index + 1}`} icon="trash" onClick={() => setItems((current) => current.filter((_, itemIndex) => itemIndex !== index))} disabled={items.length === 1} className="disabled:opacity-40" />
            </div>
          ))}
        </div>
        <input type="hidden" name="items" value={JSON.stringify(items)} readOnly />
      </div>

      <PortalTextArea label="Notes" name="notes" placeholder="Terms, installation notes, or customer context" collapsible summary="Add quotation notes" />
      <SubmitButton label="Create quotation" pendingLabel="Creating quotation..." />
    </form>
  );
}

export function QuotationStatusForm({ quotation }: { quotation: QuotationRecord }) {
  const action = updateQuotationStatusAction.bind(null, quotation.id);
  const [state, formAction] = useActionState<ActionState, FormData>(action, {});

  return (
    <form action={formAction} className="space-y-3">
      <PortalMessage error={state.error} success={state.success} />
      <PortalField label="Quotation status" name="status" defaultValue={quotation.status} required options={[{ value: "draft", label: "Draft" }, { value: "sent", label: "Sent" }, { value: "accepted", label: "Accepted" }, { value: "rejected", label: "Rejected" }, { value: "expired", label: "Expired" }, { value: "cancelled", label: "Cancelled" }]} />
      <SubmitButton label="Update status" pendingLabel="Updating..." />
    </form>
  );
}

export function ProductForm({ product, categories }: { product?: ProductRecord; categories: Array<{ key: string; name: string }> }) {
  const action = product ? updateProductAction.bind(null, product.id) : createProductAction;
  const [state, formAction] = useActionState<ActionState, FormData>(action, {});
  const [categoryKey, setCategoryKey] = useState(product?.categoryKey ?? categories[0]?.key ?? "");
  const categoryName = categories.find((category) => category.key === categoryKey)?.name ?? product?.categoryName ?? "";

  return (
    <form action={formAction} className="space-y-5">
      <PortalMessage error={state.error} success={state.success} />
      <div className="grid gap-4 sm:grid-cols-2">
        <PortalField label="Product name" name="name" defaultValue={product?.name} required />
        <PortalField label="Brand" name="brand" defaultValue={product?.brand} required />
        <PortalField label="Model / SKU" name="model" defaultValue={product?.model ?? ""} />
        <PortalField label="Legacy catalog ID" name="legacyId" defaultValue={product?.legacyId ?? ""} />
        <label className="block text-sm font-semibold text-ink">Category<span className="ml-1 text-brand-red">*</span><select name="categoryKey" value={categoryKey} onChange={(event) => setCategoryKey(event.target.value)} required className={quoteInputClass + " mt-2 h-11 rounded-xl"}>{categories.map((category) => <option key={category.key} value={category.key}>{category.name}</option>)}</select></label>
        <input type="hidden" name="categoryName" value={categoryName} readOnly />
        <PortalField label="Unit" name="unit" defaultValue={product?.unit ?? "piece"} required />
        <PortalField label="Warranty (months)" name="warrantyMonths" type="number" min="0" defaultValue={product?.warrantyMonths === null || product?.warrantyMonths === undefined ? "" : String(product.warrantyMonths)} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <PortalField label="Current selling price (NPR)" name="currentPrice" type="number" min="0" step="0.01" defaultValue={product?.currentPrice === null || product?.currentPrice === undefined ? "" : String(product.currentPrice)} />
        <PortalField label="Reference / list price (NPR)" name="referencePrice" type="number" min="0" step="0.01" defaultValue={product?.referencePrice === null || product?.referencePrice === undefined ? "" : String(product.referencePrice)} />
        <PortalField label="Price display" name="priceDisplayMode" required options={productPriceDisplayModes.map((value) => ({ value, label: value === "show_price" ? "Show price" : "Contact for price" }))} defaultValue={product?.priceDisplayMode ?? "show_price"} />
        <PortalField label="Price type" name="priceType" required options={productPriceTypes.map((value) => ({ value, label: value === "mrp" ? "MRP" : "Market reference" }))} defaultValue={product?.priceType ?? "market"} />
        <PortalField label="Availability" name="availability" required options={productAvailabilities.map((value) => ({ value, label: value === "not_tracked" ? "Not tracked" : value.replaceAll("_", " ") }))} defaultValue={product?.availability ?? "not_tracked"} />
        <PortalField label="Publication status" name="publicationStatus" required options={productPublicationStatuses.map((value) => ({ value, label: value[0].toUpperCase() + value.slice(1) }))} defaultValue={product?.publicationStatus ?? "draft"} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <PortalField label="Image path or URL" name="imagePath" defaultValue={product?.imagePath ?? ""} placeholder="/product-assets-managed/example.png" />
        <PortalField label="Image alt text" name="imageAlt" defaultValue={product?.imageAlt ?? product?.name ?? ""} />
        <PortalField label="Source URL" name="sourceUrl" defaultValue={product?.sourceUrl ?? ""} placeholder="https://..." />
        <PortalField label="Source category" name="sourceCategory" defaultValue={product?.sourceCategory ?? ""} />
      </div>

      <label className="block text-sm font-semibold text-ink">Upload a new product image<input type="file" name="imageFile" accept="image/jpeg,image/png,image/webp,image/gif" className="mt-2 block w-full rounded-xl border border-line bg-white px-3 py-2 text-sm" /><span className="mt-1 block text-xs font-normal copy-muted">Optional. JPG, PNG, WebP, or GIF up to 5 MB. A new upload replaces the path above.</span></label>

      <PortalTextArea label="Description" name="description" defaultValue={product?.description ?? ""} placeholder="Short public description" collapsible summary="Add public description" />
      <PortalTextArea label="Specifications" name="specifications" defaultValue={product?.specifications ?? ""} placeholder="Key specifications or features" collapsible summary="Add specifications" />
      {product ? <PortalTextArea label="Price change reason" name="priceChangeReason" placeholder="Required for a useful price audit trail" collapsible summary="Explain this price change" /> : null}
      <p className="rounded-xl border border-line bg-surface-strong px-4 py-3 text-xs leading-5 copy-muted">Existing quotations and installation records keep their own historical snapshots. Changing this catalog record will not rewrite those business records.</p>
      <SubmitButton label={product ? "Save product changes" : "Add product"} pendingLabel={product ? "Saving..." : "Adding..."} />
    </form>
  );
}

export function ProductImportForm() {
  const [state, formAction] = useActionState<ActionState, FormData>(importProductsCsvAction, {});
  const [preview, setPreview] = useState<{ rows: ProductImportRow[]; error?: string }>({ rows: [] });

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const parsed = parseCsvText(await file.text());
      const header = (parsed[0] ?? []).map((value, index) => index === 0 ? value.replace(/^\uFEFF/, "") : value);
      const missing = productCsvHeaders.filter((name) => !header.includes(name));
      if (missing.length) {
        setPreview({ rows: [], error: `Missing required columns: ${missing.join(", ")}` });
        return;
      }
      const rows = parsed.slice(1).map((values) => Object.fromEntries(productCsvHeaders.map((name) => [name, values[header.indexOf(name)] ?? ""])) as ProductImportRow);
      setPreview({ rows });
    } catch (error) {
      setPreview({ rows: [], error: error instanceof Error ? error.message : "Unable to read this CSV file." });
    }
  }

  return (
    <form action={formAction} className="space-y-4">
      <PortalMessage error={state.error} success={state.success} />
      <label className="block text-sm font-semibold text-ink">CSV file<input type="file" accept=".csv,text/csv" onChange={handleFileChange} className="mt-2 block w-full rounded-xl border border-line bg-white px-3 py-2 text-sm" /></label>
      <p className="text-xs leading-5 copy-muted">The preview is generated in your browser. The server validates every row again and applies the complete import in one transaction.</p>
      {preview.error ? <p className="rounded-xl border border-brand-red/30 bg-brand-red/[0.06] px-4 py-3 text-sm text-brand-red">{preview.error}</p> : null}
      {preview.rows.length ? <div className="rounded-xl border border-line bg-surface-strong p-4"><p className="text-sm font-semibold text-ink">{preview.rows.length} rows ready</p><p className="mt-1 text-xs copy-muted">Preview: {preview.rows.slice(0, 3).map((row) => row.name).join(" · ")}{preview.rows.length > 3 ? " · …" : ""}</p></div> : null}
      <input type="hidden" name="rows" value={JSON.stringify(preview.rows)} readOnly />
      <label className="flex items-start gap-2 text-xs leading-5 text-ink"><input type="checkbox" name="confirmImport" value="on" className="mt-0.5 h-4 w-4 rounded border-line" disabled={!preview.rows.length} />I reviewed the preview and want to apply these create/update changes.</label>
      <SubmitButton label="Apply validated import" pendingLabel="Applying import..." />
    </form>
  );
}

export function PaymentForm({ projectId, quotations, today }: { projectId: string; quotations: Array<{ id: string; reference: string }>; today: string }) {
  const action = createPaymentAction.bind(null, projectId);
  const [state, formAction] = useActionState<ActionState, FormData>(action, {});

  return (
    <form action={formAction} className="space-y-4">
      <PortalMessage error={state.error} success={state.success} />
      <div className="grid gap-4 sm:grid-cols-2">
        <PortalField label="Payment method" name="method" required options={[{ value: "fonepay", label: "Fonepay QR" }, { value: "esewa", label: "eSewa" }, { value: "cash", label: "Cash" }]} />
        <PortalField label="Amount (NPR)" name="amount" type="number" placeholder="0" required />
        <PortalField label="Payment date" name="paidAt" type="date" defaultValue={today} required />
        <PortalField label="Related quotation" name="quotationId" options={[{ value: "", label: "No quotation linked" }, ...quotations.map((quotation) => ({ value: quotation.id, label: quotation.reference }))]} />
        <PortalField label="Reference / receipt no." name="reference" placeholder="Optional" />
      </div>
      <PortalTextArea label="Notes" name="notes" placeholder="Payment confirmation or collection notes" collapsible summary="Add payment notes" />
      <SubmitButton label="Record payment" pendingLabel="Recording..." />
    </form>
  );
}

export function PaymentAdjustmentForm({ projectId, payments }: { projectId: string; payments: Array<{ id: string; label: string }> }) {
  const action = createPaymentAdjustmentAction.bind(null, projectId);
  const [state, formAction] = useActionState<ActionState, FormData>(action, {});

  return (
    <form action={formAction} className="space-y-4">
      <PortalMessage error={state.error} success={state.success} />
      <div className="grid gap-4 sm:grid-cols-2">
        <PortalField label="Original payment" name="paymentId" required options={[{ value: "", label: "Select payment" }, ...payments.map((payment) => ({ value: payment.id, label: payment.label }))]} />
        <PortalField label="Correction type" name="type" required options={[{ value: "refund", label: "Refund" }, { value: "reversal", label: "Reversal / correction" }]} />
        <PortalField label="Amount (NPR)" name="amount" type="number" placeholder="0" required />
      </div>
      <PortalTextArea label="Reason" name="reason" placeholder="Explain the correction for the audit history" required />
      <SubmitButton label="Record correction" pendingLabel="Recording..." />
    </form>
  );
}

export function InstallationItemForm({ projectId }: { projectId: string }) {
  const action = createInstallationItemAction.bind(null, projectId);
  const [state, formAction] = useActionState<ActionState, FormData>(action, {});

  return (
    <form action={formAction} className="space-y-4">
      <PortalMessage error={state.error} success={state.success} />
      <div className="grid gap-4 sm:grid-cols-2">
        <PortalField label="Item / equipment" name="description" placeholder="e.g. 4MP Hikvision camera" required />
        <PortalField label="Quoted quantity" name="quotedQuantity" type="number" placeholder="Optional" />
        <PortalField label="Installed quantity" name="installedQuantity" type="number" placeholder="e.g. 4" required />
        <PortalField label="Serial / asset number" name="serialNumber" placeholder="Optional" />
      </div>
      <PortalTextArea label="Installation notes" name="notes" placeholder="Location, handover notes, or warranty context" collapsible summary="Add installation notes" />
      <SubmitButton label="Record installed item" pendingLabel="Recording..." />
    </form>
  );
}

export function SupportTicketForm() {
  const [state, formAction] = useActionState<ActionState, FormData>(createSupportTicketAction, {});

  return (
    <form action={formAction} className="space-y-4">
      <PortalMessage error={state.error} />
      <div className="grid gap-4 sm:grid-cols-2">
        <PortalField label="Your name" name="customerName" required />
        <PortalField label="Phone number" name="phone" placeholder="+977 ..." required />
        <PortalField label="Email" name="email" type="email" placeholder="Optional" />
        <PortalField label="Project reference" name="projectReference" placeholder="Optional, e.g. SSE-PROJ-00001" />
        <PortalField label="Issue category" name="category" required options={[
          { value: "camera-offline", label: "Camera offline" },
          { value: "app-remote-viewing", label: "App / remote viewing" },
          { value: "recording-storage", label: "Recording / storage" },
          { value: "physical-damage", label: "Physical damage" },
          { value: "routine-maintenance", label: "Routine maintenance" },
          { value: "other", label: "Other" },
        ]} />
        <PortalField label="Priority" name="priority" required options={[{ value: "normal", label: "Normal" }, { value: "urgent", label: "Urgent" }]} />
        <PortalField label="Preferred contact time / method" name="preferredContact" placeholder="Optional" />
      </div>
      <PortalTextArea label="Describe the issue" name="description" placeholder="Tell us what happened and what help you need." required />
      <label className="block text-sm font-semibold text-ink">
        Photo or short video (optional)
        <input name="attachment" type="file" accept="image/jpeg,image/png,image/webp,video/mp4" className="mt-2 block w-full rounded-xl border border-line bg-white px-3 py-3 text-sm text-ink file:mr-3 file:rounded-lg file:border-0 file:bg-surface file:px-3 file:py-2 file:text-xs file:font-semibold" />
        <span className="mt-2 block text-xs font-normal leading-5 copy-muted">JPG, PNG, WebP, or MP4 up to 25 MB. Files are kept private for the support team.</span>
      </label>
      <SubmitButton label="Submit support request" pendingLabel="Submitting..." />
    </form>
  );
}

export function CustomerTicketAccessForm() {
  const [state, formAction] = useActionState<ActionState, FormData>(customerTicketAccessAction, {});

  return (
    <form action={formAction} className="space-y-4">
      <PortalMessage error={state.error} />
      <PortalField label="Ticket reference" name="reference" placeholder="e.g. SSE-TKT-00002" required />
      <PortalField label="Phone used for the request" name="phone" placeholder="+977 ..." required />
      <p className="text-xs leading-5 copy-muted">For privacy, you must provide both the ticket reference and the same phone number used when submitting the request. Access links expire after 30 minutes.</p>
      <SubmitButton label="View ticket status" pendingLabel="Verifying..." />
    </form>
  );
}

export function TicketUpdateForm({ ticket, technicians, canAssign }: { ticket: ServiceTicketRecord; technicians: Array<{ id: string; name: string }>; canAssign: boolean }) {
  const action = updateServiceTicketAction.bind(null, ticket.id);
  const [state, formAction] = useActionState<ActionState, FormData>(action, {});

  return (
    <form action={formAction} className="space-y-4">
      <PortalMessage error={state.error} success={state.success} />
      <div className="grid gap-4 sm:grid-cols-2">
        <PortalField label="Status" name="status" defaultValue={ticket.status} required options={[
          { value: "open", label: "Open" },
          { value: "reviewed", label: "Reviewed" },
          { value: "assigned", label: "Assigned" },
          { value: "scheduled", label: "Scheduled" },
          { value: "in-progress", label: "In progress" },
          { value: "waiting-customer", label: "Waiting for customer" },
          { value: "resolved", label: "Resolved" },
          { value: "closed", label: "Closed" },
          { value: "reopened", label: "Reopened" },
        ]} />
        {canAssign ? <PortalField label="Assign technician" name="assignedTo" defaultValue={ticket.assignedTo ?? ""} options={[{ value: "", label: "Unassigned" }, ...technicians.map((technician) => ({ value: technician.id, label: technician.name }))]} /> : <input type="hidden" name="assignedTo" value={ticket.assignedTo ?? ""} />}
      </div>
      <PortalTextArea label="Internal notes" name="internalNotes" defaultValue={ticket.internalNotes ?? ""} placeholder="Private notes for the team" collapsible summary="Add private team notes" />
      <PortalTextArea label="Customer-visible update" name="customerUpdate" defaultValue={ticket.customerUpdate ?? ""} placeholder="A short progress update the customer can see" collapsible summary="Add customer update" />
      <PortalTextArea label="Resolution summary" name="resolutionSummary" defaultValue={ticket.resolutionSummary ?? ""} placeholder="What was done to resolve the issue" collapsible summary="Add resolution details" />
      <SubmitButton label="Save ticket update" pendingLabel="Saving..." />
    </form>
  );
}

export function TicketAttachmentForm({ ticketId }: { ticketId: string }) {
  const action = uploadTicketAttachmentAction.bind(null, ticketId);
  const [state, formAction] = useActionState<ActionState, FormData>(action, {});

  return (
    <form action={formAction} className="space-y-3">
      <PortalMessage error={state.error} success={state.success} />
      <input name="attachment" type="file" accept="image/jpeg,image/png,image/webp,application/pdf,video/mp4" className="block w-full rounded-xl border border-line bg-white px-3 py-3 text-sm text-ink file:mr-3 file:rounded-lg file:border-0 file:bg-surface file:px-3 file:py-2 file:text-xs file:font-semibold" required />
      <p className="text-xs leading-5 copy-muted">JPG, PNG, WebP, PDF, or MP4 up to 25 MB. Files are kept in private local storage and served only to authorized portal users.</p>
      <SubmitButton label="Attach file" pendingLabel="Uploading..." />
    </form>
  );
}

export function DeactivateAccountButton({ userId }: { userId: string }) {
  const action = revokePortalSessionForUser.bind(null, userId);
  const [state, formAction] = useActionState<ActionState, FormData>(async () => action(), {});

  return (
    <form action={formAction}>
      {state.error ? <p className="mb-2 text-xs text-brand-red">{state.error}</p> : null}
      <button type="submit" disabled={Boolean(state.success)} className="text-xs font-semibold text-brand-red hover:underline disabled:opacity-50">
        {state.success ? "Deactivated" : "Deactivate"}
      </button>
    </form>
  );
}

export function UpdateRoleForm({ userId, role }: { userId: string; role: PortalRole }) {
  const [state, formAction] = useActionState<ActionState, FormData>(updatePortalUserRoleAction, {});

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-2">
      <input type="hidden" name="userId" value={userId} />
      <div className="min-w-40 flex-1">
        <PortalField
          label="Access role"
          name="role"
          defaultValue={role}
          options={[
            { value: "owner", label: portalRoleLabels.owner },
            { value: "manager", label: portalRoleLabels.manager },
            { value: "staff", label: portalRoleLabels.staff },
            { value: "technician", label: portalRoleLabels.technician },
          ]}
        />
      </div>
      <button type="submit" className="action-secondary text-xs">Save role</button>
      {state.error ? <p className="basis-full text-xs text-brand-red">{state.error}</p> : null}
      {state.success ? <p className="basis-full text-xs text-brand-blue">{state.success}</p> : null}
    </form>
  );
}
