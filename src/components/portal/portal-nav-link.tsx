"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PortalIcon, type PortalIconName } from "@/components/portal/portal-ui";

export function PortalNavLink({ href, label, icon, onNavigate, dark = false }: { href: string; label: string; icon: PortalIconName; onNavigate?: () => void; dark?: boolean }) {
  const pathname = usePathname();
  const active = href === "/portal/dashboard" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[0.78rem] font-semibold transition ${dark ? (active ? "bg-white text-[#173f70] shadow-[inset_3px_0_0_#c82b2b]" : "text-white/75 hover:bg-white/10 hover:text-white") : (active ? "bg-[#e9f1ff] text-[#1463d7] shadow-[inset_3px_0_0_#1463d7]" : "text-[#5d6b7e] hover:bg-[#f4f7fb] hover:text-[#1463d7]")}`}
    >
      <PortalIcon name={icon} className={`h-[1.05rem] w-[1.05rem] shrink-0 ${dark ? (active ? "text-[#173f70]" : "text-white/70 group-hover:text-white") : (active ? "text-[#1463d7]" : "text-[#7b8797] group-hover:text-[#1463d7]")}`} />
      <span className="truncate">{label}</span>
    </Link>
  );
}
