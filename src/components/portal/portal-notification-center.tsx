"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { PortalIcon } from "@/components/portal/portal-ui";
import type { NotificationRecord } from "@/lib/portal/types";

function notificationHref(notification: NotificationRecord) {
  if (notification.entityType === "service-job") return `/portal/jobs/${notification.entityId}`;
  if (notification.entityType === "redemption") return "/portal/redemptions";
  if (notification.entityType === "service-ticket") return `/portal/tickets/${notification.entityId}`;
  if (notification.entityType === "enquiry") return `/portal/enquiries/${notification.entityId}`;
  if (notification.entityType === "schedule-event") return "/portal/schedule";
  return "/portal/dashboard#notifications";
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat("en-NP", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Kathmandu" }).format(new Date(value));
}

export function PortalNotificationCenter({ initialNotifications }: { initialNotifications: NotificationRecord[] }) {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [toast, setToast] = useState<NotificationRecord | null>(null);
  const [open, setOpen] = useState(false);
  const seenIds = useRef(new Set(initialNotifications.map((notification) => notification.id)));
  const centerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    function closeOnOutsideClick(event: MouseEvent) {
      if (!centerRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  useEffect(() => {
    let active = true;

    async function refresh() {
      if (document.hidden) return;
      try {
        const response = await fetch("/api/portal/notifications", { cache: "no-store" });
        if (!response.ok) return;
        const payload = await response.json() as { notifications?: NotificationRecord[] };
        if (!active || !Array.isArray(payload.notifications)) return;
        const nextNotifications = payload.notifications;
        const newest = nextNotifications.find((notification) => !seenIds.current.has(notification.id));
        nextNotifications.forEach((notification) => seenIds.current.add(notification.id));
        setNotifications(nextNotifications);
        if (newest) setToast(newest);
      } catch {
        // The dashboard inbox remains available if polling is temporarily unavailable.
      }
    }

    const interval = window.setInterval(refresh, 15000);
    refresh();
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(null), 7000);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const unreadCount = useMemo(() => notifications.filter((notification) => !notification.readAt).length, [notifications]);

  return (
    <>
      <div ref={centerRef} className="relative">
        <button type="button" onClick={() => setOpen((current) => !current)} aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ""}`} aria-expanded={open} className={`relative inline-flex h-9 w-9 items-center justify-center rounded-lg text-[#66758a] transition hover:bg-[#f4f7fb] hover:text-[#1463d7] ${toast ? "portal-notification-pulse" : ""}`}>
          <PortalIcon name="bell" className="h-[1.1rem] w-[1.1rem]" />
          {unreadCount ? <span className="absolute -right-1 -top-1 inline-flex min-h-4 min-w-4 items-center justify-center rounded-full bg-[#ef6b4a] px-1 text-[0.55rem] font-bold text-white">{unreadCount > 9 ? "9+" : unreadCount}</span> : null}
        </button>
        {open ? (
          <div role="dialog" aria-label="Notification inbox" className="fixed inset-x-3 top-[5.25rem] z-50 max-h-[calc(100dvh-6.5rem)] overflow-hidden rounded-2xl border border-[#dce6f2] bg-white shadow-[0_18px_48px_rgba(17,39,75,0.16)] sm:absolute sm:inset-x-auto sm:right-0 sm:top-12 sm:w-[min(22rem,calc(100vw-2rem))] sm:max-h-none">
            <div className="flex items-start justify-between gap-3 border-b border-[#edf1f5] px-4 py-3"><div><p className="text-[0.62rem] font-bold uppercase tracking-[0.14em] text-[#1463d7]">Inbox</p><p className="mt-1 text-sm font-semibold text-[#27364a]">Recent updates</p><p className="mt-1 text-[0.68rem] text-[#8b98aa]">Tap an update to open its record.</p></div><div className="flex items-center gap-2"><span className="text-xs text-[#8b98aa]">{unreadCount} unread</span><button type="button" onClick={() => setOpen(false)} aria-label="Close notifications" className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-[#8b98aa] hover:bg-[#f4f7fb] hover:text-[#27364a]"><PortalIcon name="close" className="h-4 w-4" /></button></div></div>
            <div className="max-h-[calc(100dvh-13rem)] overflow-y-auto p-2 sm:max-h-80">
              {notifications.length ? notifications.slice(0, 6).map((notification) => <Link key={notification.id} href={notificationHref(notification)} onClick={() => setOpen(false)} className={`block rounded-xl px-3 py-3 transition hover:bg-[#f6f9ff] ${notification.readAt ? "" : "bg-[#f6f9ff]"}`}><div className="flex items-start gap-2"><span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${notification.readAt ? "bg-[#cbd6e3]" : "bg-[#1463d7]"}`} /><div className="min-w-0"><p className="text-xs font-semibold text-[#34465c]">{notification.title}</p><p className="mt-1 line-clamp-2 text-[0.68rem] leading-5 text-[#7d899a]">{notification.message}</p><p className="mt-1 text-[0.6rem] text-[#a0aabd]">{formatTime(notification.createdAt)}</p></div></div></Link>) : <p className="px-3 py-8 text-center text-xs text-[#8b98aa]">No notifications yet.</p>}
            </div>
            <Link href="/portal/dashboard#notifications" onClick={() => setOpen(false)} className="block border-t border-[#edf1f5] px-4 py-3 text-center text-xs font-semibold text-[#1463d7] hover:bg-[#f6f9ff]">Open full inbox</Link>
          </div>
        ) : null}
      </div>
      {toast ? <div className="fixed right-4 top-[5.7rem] z-[60] w-[min(23rem,calc(100vw-2rem))] portal-notification-toast" role="status" aria-live="polite"><div className="rounded-2xl border border-[#b9d5fb] bg-white p-4 shadow-[0_18px_48px_rgba(17,39,75,0.18)]"><div className="flex items-start gap-3"><span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#e9f1ff] text-[#1463d7]"><PortalIcon name="bell" /></span><div className="min-w-0 flex-1"><p className="text-[0.6rem] font-bold uppercase tracking-[0.14em] text-[#1463d7]">New notification</p><p className="mt-1 text-sm font-semibold text-[#27364a]">{toast.title}</p><p className="mt-1 text-xs leading-5 text-[#6f8197]">{toast.message}</p><Link href={notificationHref(toast)} onClick={() => setToast(null)} className="mt-3 inline-flex text-xs font-semibold text-[#1463d7]">Open update <span className="ml-1">→</span></Link></div><button type="button" onClick={() => setToast(null)} aria-label="Dismiss notification" className="text-[#9aa5b4] hover:text-[#34465c]"><PortalIcon name="close" className="h-4 w-4" /></button></div></div></div> : null}
    </>
  );
}
