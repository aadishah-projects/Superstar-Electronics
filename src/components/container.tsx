import type { PropsWithChildren } from "react";
import { cn } from "@/lib/cn";

export function Container({
  children,
  className,
}: PropsWithChildren<{ className?: string }>) {
  return (
    <div className={cn("mx-auto w-full max-w-[100rem] px-4 sm:px-6 lg:px-8", className)}>
      {children}
    </div>
  );
}
