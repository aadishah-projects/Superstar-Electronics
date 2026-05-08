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
            "mt-4 font-heading text-2xl leading-tight tracking-tight text-ink sm:mt-5 sm:text-4xl",
            centered && "mx-auto max-w-3xl",
          )}
        >
          {title}
        </h1>
      ) : (
        <h2
          className={cn(
            "mt-4 font-heading text-2xl leading-tight tracking-tight text-ink sm:mt-5 sm:text-4xl",
            centered && "mx-auto max-w-3xl",
          )}
        >
          {title}
        </h2>
      )}
      <p
        className={cn(
          "mt-3 max-w-3xl text-[0.98rem] leading-7 copy-muted sm:mt-4 sm:text-lg sm:leading-8",
          centered && "mx-auto",
        )}
      >
        {description}
      </p>
    </div>
  );
}
