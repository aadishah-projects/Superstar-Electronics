import Link from "next/link";
import type { ChangeEventHandler } from "react";
import type { ActivityRecord } from "@/lib/portal/types";

export type PortalIconName =
  | "plus"
  | "trash"
  | "search"
  | "save"
  | "edit"
  | "pin"
  | "close"
  | "arrow"
  | "home"
  | "briefcase"
  | "users"
  | "folder"
  | "file"
  | "wallet"
  | "package"
  | "headphones"
  | "tool"
  | "gift"
  | "chart"
  | "settings"
  | "bell"
  | "calendar"
  | "inbox"
  | "chevron"
  | "menu"
  | "logout"
  | "more"
  | "check"
  | "clock";

export function PortalIcon({ name, className = "h-4 w-4" }: { name: PortalIconName; className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {name === "plus" ? <><path d="M12 5v14" /><path d="M5 12h14" /></> : null}
      {name === "trash" ? <><path d="M5 7h14" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="m9 7 .7-2h4.6l.7 2" /><path d="M7 7l1 13h8l1-13" /></> : null}
      {name === "search" ? <><circle cx="10.8" cy="10.8" r="5.8" /><path d="m15.2 15.2 4.3 4.3" /></> : null}
      {name === "save" ? <><path d="M5 4h12l2 2v14H5z" /><path d="M8 4v6h8V4" /><path d="M8 20v-6h8v6" /></> : null}
      {name === "edit" ? <><path d="m5 16-.8 4 4-.8L19 8.4a2.1 2.1 0 0 0-3-3Z" /><path d="m14.5 6.5 3 3" /></> : null}
      {name === "pin" ? <><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></> : null}
      {name === "close" ? <><path d="m6 6 12 12" /><path d="M18 6 6 18" /></> : null}
      {name === "arrow" ? <><path d="M5 12h13" /><path d="m13 6 6 6-6 6" /></> : null}
      {name === "home" ? <><path d="m3.5 10.5 8.5-7 8.5 7" /><path d="M5.5 9.5V20h13V9.5" /><path d="M9.5 20v-6h5v6" /></> : null}
      {name === "briefcase" ? <><rect x="3" y="6.5" width="18" height="13" rx="2" /><path d="M8 6.5V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v1.5" /><path d="M3 11h18" /><path d="M10 11v2h4v-2" /></> : null}
      {name === "users" ? <><circle cx="9" cy="8" r="3" /><path d="M3.5 19c.3-3.2 2.1-5 5.5-5s5.2 1.8 5.5 5" /><path d="M15.5 5.5a3 3 0 0 1 0 5.8" /><path d="M17 14c2 .5 3.2 2.1 3.5 5" /></> : null}
      {name === "folder" ? <><path d="M3.5 6.5h6l2 2h9v9.5a2 2 0 0 1-2 2h-15z" /><path d="M3.5 6.5v-1h6l2 2" /></> : null}
      {name === "file" ? <><path d="M6 3.5h8l4 4V20H6z" /><path d="M14 3.5V8h4" /><path d="M9 12h6M9 16h6" /></> : null}
      {name === "wallet" ? <><path d="M4 6.5h14a2 2 0 0 1 2 2v9H4a2 2 0 0 1-2-2V6.5a2 2 0 0 1 2-2h12" /><path d="M15 13h5" /><circle cx="15" cy="13" r=".7" fill="currentColor" /></> : null}
      {name === "package" ? <><path d="m4 7 8-4 8 4v10l-8 4-8-4z" /><path d="m4 7 8 4 8-4M12 11v10" /></> : null}
      {name === "headphones" ? <><path d="M4 13v-1a8 8 0 0 1 16 0v1" /><path d="M4 13h3v6H5a1 1 0 0 1-1-1zM20 13h-3v6h2a1 1 0 0 0 1-1z" /></> : null}
      {name === "tool" ? <><path d="m14.5 5.5 4-2 .5 4-2 1.2-7.7 7.7a2 2 0 0 1-2.8 0l-.4-.4a2 2 0 0 1 0-2.8l7.7-7.7z" /><path d="m5 19-2 2" /></> : null}
      {name === "gift" ? <><rect x="3.5" y="8" width="17" height="12" rx="1.5" /><path d="M12 8v12M3.5 12h17" /><path d="M12 8H8.5a2.5 2.5 0 1 1 2.2-3.7L12 8ZM12 8h3.5a2.5 2.5 0 1 0-2.2-3.7L12 8Z" /></> : null}
      {name === "chart" ? <><path d="M4 19V5M4 19h17" /><path d="m7 15 3-4 3 2 5-7" /></> : null}
      {name === "settings" ? <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-1.7 1.7-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5v.2h-2.4v-.2a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1L8 17l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H6.7v-2.4h.2a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.9L8 8.6l1.7-1.7.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.5v-.2h2.4v.2a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1 1.7 1.7-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.5 1h.2V14h-.2a1.7 1.7 0 0 0-1.5 1Z" /></> : null}
      {name === "bell" ? <><path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" /><path d="M10 21h4" /></> : null}
      {name === "calendar" ? <><rect x="3.5" y="5" width="17" height="16" rx="2" /><path d="M7 3v4M17 3v4M3.5 10h17" /><path d="M8 14h.01M12 14h.01M16 14h.01M8 17h.01M12 17h.01" /></> : null}
      {name === "inbox" ? <><path d="M4 5h16l2 10v3a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-3z" /><path d="M2 15h5l1.5 2h7L17 15h5" /></> : null}
      {name === "chevron" ? <path d="m7 10 5 5 5-5" /> : null}
      {name === "menu" ? <><path d="M4 7h16M4 12h16M4 17h16" /></> : null}
      {name === "logout" ? <><path d="M10 5H5v14h5" /><path d="M14 8l4 4-4 4M18 12H8" /></> : null}
      {name === "more" ? <><circle cx="5" cy="12" r="1" fill="currentColor" /><circle cx="12" cy="12" r="1" fill="currentColor" /><circle cx="19" cy="12" r="1" fill="currentColor" /></> : null}
      {name === "check" ? <path d="m5 12 4 4L19 6" /> : null}
      {name === "clock" ? <><circle cx="12" cy="12" r="8.5" /><path d="M12 7v5l3 2" /></> : null}
    </svg>
  );
}

export function PortalIconButton({ label, icon, type = "button", className = "", onClick, disabled = false }: { label: string; icon: PortalIconName; type?: "button" | "submit"; className?: string; onClick?: () => void; disabled?: boolean }) {
  return (
    <button type={type} aria-label={label} title={label} onClick={onClick} disabled={disabled} className={`inline-flex h-10 w-10 items-center justify-center rounded-lg text-brand-red transition hover:bg-brand-red/[0.06] ${className}`}>
      <PortalIcon name={icon} />
    </button>
  );
}

export function PortalPageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 border-b border-[#e4eaf2] pb-5 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-[0.68rem] font-medium text-[#8b98aa]">Home <span className="px-1">/</span> {eyebrow}</p>
        <h1 className="mt-2 font-heading text-3xl font-semibold leading-tight tracking-tight text-[#1d2b3e]">{title}</h1>
        <p className="mt-2 max-w-3xl text-[0.76rem] leading-6 text-[#7d899a]">{description}</p>
      </div>
      {action}
    </div>
  );
}

export function PortalStatusBadge({ value }: { value: string }) {
  const normalized = value.toLowerCase();
  const tone = normalized === "open" || normalized === "accepted" ? "border-[#b9d5fb] bg-[#eef5ff] text-[#1463d7]" : normalized === "urgent" || normalized === "awaiting-verification" || normalized === "reassignment-required" ? "border-[#f4c6bb] bg-[#fff0ec] text-[#c24b33]" : normalized === "assigned" || normalized === "in-progress" ? "border-[#b9e2cd] bg-[#eaf8f0] text-[#198754]" : normalized === "completed" || normalized === "approved" || normalized === "collected" ? "border-[#b9e2cd] bg-[#eaf8f0] text-[#198754]" : normalized === "declined" || normalized === "cancelled" || normalized === "expired" ? "border-[#e4c5c5] bg-[#fff5f5] text-[#a53b3b]" : "border-line bg-surface-strong text-brand-blue";
  return (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.13em] ${tone}`}>
      {value.replaceAll("-", " ")}
    </span>
  );
}

export function PortalMessage({ error, success }: { error?: string; success?: string }) {
  if (!error && !success) return null;

  return (
    <p className={`mt-4 rounded-xl border px-4 py-3 text-sm leading-6 ${error ? "border-brand-red/30 bg-brand-red/[0.06] text-brand-red" : "border-brand-blue/20 bg-brand-blue/[0.06] text-brand-blue"}`}>
      {error ?? success}
    </p>
  );
}

export function PortalStatCard({ label, value, href }: { label: string; value: number; href: string }) {
  return (
    <Link href={href} className="surface-card block p-5 transition hover:-translate-y-0.5 hover:border-brand-blue sm:p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-blue">{label}</p>
      <p className="mt-3 font-heading text-4xl tracking-tight text-ink">{value}</p>
      <p className="mt-2 text-sm copy-muted">Open list</p>
    </Link>
  );
}

export function PortalField({
  label,
  name,
  type = "text",
  placeholder,
  required,
  defaultValue,
  value,
  onChange,
  min,
  step,
  options,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  defaultValue?: string;
  value?: string;
  onChange?: ChangeEventHandler<HTMLInputElement>;
  min?: string;
  step?: string;
  options?: Array<{ value: string; label: string }>;
}) {
  const className = "mt-2 h-11 w-full rounded-xl border border-line bg-white px-3 text-sm text-ink outline-none transition placeholder:text-gray-400 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/10";

  return (
    <label className="block text-sm font-semibold text-ink">
      {label}{required ? <span className="ml-1 text-brand-red">*</span> : null}
      {options ? (
        <select name={name} required={required} defaultValue={defaultValue} className={className}>
          {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>
      ) : (
        <input name={name} type={type} placeholder={placeholder} required={required} defaultValue={defaultValue} value={value} onChange={onChange} min={min} step={step} className={className} />
      )}
    </label>
  );
}

export function PortalTextArea({ label, name, placeholder, required, defaultValue, collapsible = false, summary = "Add notes or details" }: { label: string; name: string; placeholder?: string; required?: boolean; defaultValue?: string; collapsible?: boolean; summary?: string }) {
  const field = (
    <label className="block text-sm font-semibold text-ink">
      {label}{required ? <span className="ml-1 text-brand-red">*</span> : null}
      <textarea name={name} placeholder={placeholder} required={required} defaultValue={defaultValue} rows={3} className="mt-2 w-full rounded-xl border border-line bg-white px-3 py-3 text-sm leading-6 text-ink outline-none transition placeholder:text-gray-400 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/10" />
    </label>
  );

  if (!collapsible) return field;

  return (
    <details open={Boolean(defaultValue?.trim())} className="group rounded-xl border border-line bg-surface-strong/45">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm font-semibold text-ink">
        <span className="flex items-center gap-2"><PortalIcon name="edit" className="h-4 w-4 text-brand-blue" />{summary}</span>
        <span aria-hidden="true" className="text-brand-blue transition group-open:rotate-180">⌄</span>
      </summary>
      <div className="border-t border-line px-4 pb-4 pt-3">{field}</div>
    </details>
  );
}

export function PortalActivityList({ activities }: { activities: ActivityRecord[] }) {
  return activities.length ? (
    <div className="space-y-3">
      {activities.map((activity, index) => (
        <div key={`${activity.createdAt}-${activity.action}-${index}`} className="border-l-2 border-brand-blue/20 pl-4">
          <p className="text-sm font-semibold text-ink">{activity.action.replaceAll("_", " ")}</p>
          <p className="mt-1 text-xs copy-muted">{activity.actorName} · {formatPortalDateTime(activity.createdAt)}</p>
        </div>
      ))}
    </div>
  ) : <p className="text-sm copy-muted">No activity recorded yet.</p>;
}

export function formatPortalDate(value: string | null) {
  if (!value) return "Not set";
  return new Intl.DateTimeFormat("en-NP", { dateStyle: "medium", timeZone: "Asia/Kathmandu" }).format(new Date(value.includes("T") ? value : `${value}T00:00:00+05:45`));
}

export function formatPortalDateTime(value: string | null) {
  if (!value) return "Not set";
  return new Intl.DateTimeFormat("en-NP", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Kathmandu" }).format(new Date(value));
}

export function formatPortalNpr(value: number | null) {
  if (value === null) return "Not set";
  return `NPR ${value.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}
