import Image from "next/image";

export function BrandLogo({ dark = false, compact = false }: { dark?: boolean; compact?: boolean }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${dark ? "text-white" : "text-[#123b75]"}`}>
      <Image src="/brand/logo-icon.png" alt="" width={42} height={42} className={`h-9 w-9 object-contain ${dark ? "brightness-0 invert" : ""}`} />
      <span className="leading-[1.05]">
        <span className={`block font-heading font-semibold ${compact ? "text-[0.75rem]" : "text-[0.9rem]"}`}>Super Star</span>
        <span className={`block font-heading font-semibold ${compact ? "text-[0.75rem]" : "text-[0.9rem]"}`}>Electronics</span>
      </span>
    </span>
  );
}
