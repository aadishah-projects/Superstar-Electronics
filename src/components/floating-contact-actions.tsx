import { siteConfig } from "@/data/site";
import { buildWhatsAppUrl, toTelHref } from "@/lib/urls";

export function FloatingContactActions() {
  return (
    <div className="pointer-events-none fixed inset-x-3 bottom-3 z-40 pb-[env(safe-area-inset-bottom)] sm:inset-x-auto sm:right-6 sm:bottom-6 sm:pb-0">
      <div className="pointer-events-auto grid grid-cols-2 gap-2 rounded-[1.35rem] border border-line bg-white/94 p-2 shadow-[0_18px_48px_rgba(17,39,75,0.2)] backdrop-blur-xl sm:flex sm:items-center">
        <a
          href={buildWhatsAppUrl({ type: "general" })}
          target="_blank"
          rel="noreferrer"
          className="action-accent min-h-12 min-w-0 px-3 sm:min-w-[9.5rem]"
        >
          WhatsApp
        </a>
        <a
          href={toTelHref(siteConfig.contact.primaryPhone)}
          className="action-secondary min-h-12 min-w-0 px-3 sm:min-w-[8rem]"
        >
          Call Now
        </a>
      </div>
    </div>
  );
}
