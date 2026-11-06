import type { PropsWithChildren } from "react";
import { cn } from "@/lib/cn";

export function Container({
  children,
  className,
  fullBleed = false,
}: PropsWithChildren<{ className?: string; fullBleed?: boolean }>) {
  return (
    <div className={cn(fullBleed ? "w-full max-w-none px-0" : "mx-auto w-full max-w-[100rem] px-4 sm:px-6 lg:px-8", className)}>
      {children}
    </div>
  );
}
