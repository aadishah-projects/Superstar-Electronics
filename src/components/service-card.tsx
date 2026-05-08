import { IconMark } from "@/components/icon-mark";
import { buildWhatsAppUrl } from "@/lib/urls";
import type { ServiceItem } from "@/types/site";

interface ServiceCardProps {
  service: ServiceItem;
}

export function ServiceCard({ service }: ServiceCardProps) {
  return (
    <article className="surface-card h-full p-6 sm:p-7">
      <div className="flex items-center gap-4">
        <IconMark name={service.icon} />
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-blue">
            Service
          </p>
          <h3 className="mt-1 font-heading text-2xl tracking-tight text-ink">
            {service.name}
          </h3>
        </div>
      </div>

      <p className="mt-5 text-sm leading-7 copy-muted sm:text-base">
        {service.summary}
      </p>

      <div className="mt-5 flex flex-wrap gap-2">
        {service.highlights.map((highlight) => (
          <span
            key={highlight}
            className="rounded-full bg-surface px-3 py-1 text-sm text-brand-blue"
          >
            {highlight}
          </span>
        ))}
      </div>

      <a
        href={buildWhatsAppUrl({
          type: "service",
          subject: service.inquiryLabel,
        })}
        target="_blank"
        rel="noreferrer"
        className="action-secondary mt-8"
      >
        Ask About This Service
      </a>
    </article>
  );
}
