"use client";

import { usePathname } from "next/navigation";
import { siteConfig } from "@/data/site";
import { buildWhatsAppUrl, toTelHref } from "@/lib/urls";

export function FloatingContactActions() {
  const pathname = usePathname();
  if (pathname.startsWith("/portal")) return null;

  return (
    <div className="pointer-events-none fixed inset-x-2 bottom-2 z-40 pb-[env(safe-area-inset-bottom)] sm:inset-x-auto sm:right-6 sm:bottom-6 sm:pb-0 print:hidden">
      <div className="pointer-events-auto grid grid-cols-2 gap-1.5 rounded-2xl border border-line bg-white/94 p-1.5 shadow-[0_18px_48px_rgba(17,39,75,0.2)] backdrop-blur-xl sm:flex sm:items-center sm:gap-2 sm:rounded-[1.35rem] sm:p-2">
        <a
          href={buildWhatsAppUrl({ type: "general" })}
          target="_blank"
          rel="noreferrer"
          className="action-accent min-h-11 min-w-0 px-2.5 text-[0.75rem] sm:min-h-12 sm:min-w-[9.5rem] sm:px-3 sm:text-[0.8rem]"
        >
          WhatsApp
        </a>
        <a
          href={toTelHref(siteConfig.contact.primaryPhone)}
          className="action-secondary min-h-11 min-w-0 px-2.5 text-[0.75rem] sm:min-h-12 sm:min-w-[8rem] sm:px-3 sm:text-[0.8rem]"
        >
          Call Now
        </a>
      </div>
    </div>
  );
}
