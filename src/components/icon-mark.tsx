import type { IconName } from "@/types/site";
import { cn } from "@/lib/cn";

interface IconMarkProps {
  name: IconName;
  className?: string;
}

export function IconMark({ name, className }: IconMarkProps) {
  return (
    <span
      className={cn(
        "inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-blue/[0.08] text-brand-blue",
        className,
      )}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {renderPath(name)}
      </svg>
    </span>
  );
}

function renderPath(name: IconName) {
  switch (name) {
    case "camera":
      return (
        <>
          <path d="M4 9.5 12 6l8 3.5V18a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2Z" />
          <path d="M9 13a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" />
        </>
      );
    case "shield":
      return (
        <>
          <path d="M12 3 5 6v5c0 4.3 2.8 8.2 7 10 4.2-1.8 7-5.7 7-10V6Z" />
          <path d="m9.5 12 1.8 1.8 3.4-3.6" />
        </>
      );
    case "network":
      return (
        <>
          <path d="M12 4v4" />
          <path d="M5 20v-4h14v4" />
          <path d="M4 12h16" />
          <path d="M7 8h10v4H7z" />
          <path d="M7 16a2 2 0 1 0 0.01 0" />
          <path d="M17 16a2 2 0 1 0 0.01 0" />
        </>
      );
    case "tools":
      return (
        <>
          <path d="m14.5 6.5 3 3" />
          <path d="m3 21 6.5-6.5" />
          <path d="m13 7 4 4" />
          <path d="M11 5a4 4 0 0 0-5.6 5.6L3 13l2 2 2.4-2.4A4 4 0 0 0 13 7Z" />
          <path d="m14 14 6 6" />
        </>
      );
    case "warehouse":
      return (
        <>
          <path d="m3 10 9-6 9 6" />
          <path d="M5 10v9h14v-9" />
          <path d="M9 19v-5h6v5" />
        </>
      );
    case "support":
      return (
        <>
          <path d="M6 18v-4a6 6 0 1 1 12 0v4" />
          <path d="M18 18a2 2 0 0 1-2 2h-1" />
          <path d="M8 18H6a2 2 0 0 1-2-2v-1a2 2 0 0 1 2-2h2" />
          <path d="M16 13h2a2 2 0 0 1 2 2v1" />
        </>
      );
    case "phone":
      return (
        <path d="M5 4h4l2 5-2 1.5a16 16 0 0 0 4.5 4.5L15 13l5 2v4a2 2 0 0 1-2.2 2A17 17 0 0 1 3 6.2 2 2 0 0 1 5 4Z" />
      );
    case "message":
      return (
        <>
          <path d="M5 5h14v10H8l-4 4z" />
          <path d="M8 9h8" />
          <path d="M8 12h5" />
        </>
      );
    case "mail":
      return (
        <>
          <path d="M4 6h16v12H4z" />
          <path d="m4 8 8 6 8-6" />
        </>
      );
    case "map":
      return (
        <>
          <path d="M12 21s6-5.3 6-10a6 6 0 1 0-12 0c0 4.7 6 10 6 10Z" />
          <path d="M12 13a2.5 2.5 0 1 0 0-5a2.5 2.5 0 0 0 0 5Z" />
        </>
      );
    case "clock":
      return (
        <>
          <path d="M12 21a9 9 0 1 0 0-18a9 9 0 0 0 0 18Z" />
          <path d="M12 7v5l3 2" />
        </>
      );
    case "quote":
      return (
        <>
          <path d="M8 17H5v-4c0-2.8 1.5-4.7 4-5.7" />
          <path d="M19 17h-3v-4c0-2.8 1.5-4.7 4-5.7" />
        </>
      );
    default:
      return null;
  }
}
