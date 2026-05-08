import { siteConfig } from "@/data/site";
import { buildWhatsAppUrl, toTelHref } from "@/lib/urls";

export function FloatingContactActions() {
  return (
    <div className="pointer-events-none fixed inset-x-4 bottom-4 z-40 sm:inset-x-auto sm:right-6 sm:bottom-6">
      <div className="pointer-events-auto flex items-center gap-2 rounded-2xl border border-line bg-white/92 p-2 shadow-[0_16px_40px_rgba(17,39,75,0.16)] backdrop-blur-xl">
        <a
          href={buildWhatsAppUrl({ type: "general" })}
          target="_blank"
          rel="noreferrer"
          className="action-accent min-w-[9.5rem]"
        >
          WhatsApp Us
        </a>
        <a
          href={toTelHref(siteConfig.contact.primaryPhone)}
          className="action-secondary min-w-[8rem]"
        >
          Call Now
        </a>
      </div>
    </div>
  );
}
