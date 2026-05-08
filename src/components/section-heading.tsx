import { cn } from "@/lib/cn";

interface SectionHeadingProps {
  eyebrow: string;
  title: string;
  description: string;
  align?: "left" | "center";
  className?: string;
  headingLevel?: "h1" | "h2";
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  className,
  headingLevel = "h2",
}: SectionHeadingProps) {
  const centered = align === "center";

  return (
    <div className={cn(centered && "mx-auto text-center", className)}>
      <span className="section-kicker">{eyebrow}</span>
      {headingLevel === "h1" ? (
        <h1
          className={cn(
            "mt-5 font-heading text-3xl tracking-tight text-ink sm:text-4xl",
            centered && "mx-auto max-w-3xl",
          )}
        >
          {title}
        </h1>
      ) : (
        <h2
          className={cn(
            "mt-5 font-heading text-3xl tracking-tight text-ink sm:text-4xl",
            centered && "mx-auto max-w-3xl",
          )}
        >
          {title}
        </h2>
      )}
      <p
        className={cn(
          "mt-4 max-w-3xl text-base leading-8 copy-muted sm:text-lg",
          centered && "mx-auto",
        )}
      >
        {description}
      </p>
    </div>
  );
}
