import { IconMark } from "@/components/icon-mark";
import { buildWhatsAppUrl } from "@/lib/urls";
import type { ServiceItem } from "@/types/site";

interface ServiceCardProps {
  service: ServiceItem;
}

export function ServiceCard({ service }: ServiceCardProps) {
  return (
    <article className="surface-card h-full p-5 sm:p-7">
      <div className="flex items-center gap-3 sm:gap-4">
        <IconMark name={service.icon} />
        <div>
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-brand-blue sm:text-sm sm:tracking-[0.18em]">
            Service
          </p>
          <h3 className="mt-1 font-heading text-xl tracking-tight text-ink sm:text-2xl">
            {service.name}
          </h3>
        </div>
      </div>

      <p className="mt-4 text-sm leading-6 copy-muted sm:mt-5 sm:text-base sm:leading-7">
        {service.summary}
      </p>

      <div className="mt-4 flex flex-wrap gap-2 sm:mt-5">
        {service.highlights.map((highlight) => (
          <span
            key={highlight}
            className="rounded-full bg-surface px-2.5 py-1 text-[0.82rem] text-brand-blue sm:px-3 sm:text-sm"
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
        className="action-secondary mt-6 sm:mt-8"
      >
        Ask About This Service
      </a>
    </article>
  );
}
