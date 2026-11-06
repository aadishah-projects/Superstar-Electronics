"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Container } from "@/components/container";
import { BrandLogo } from "@/components/brand-logo";
import { navigation, siteConfig } from "@/data/site";
import { cn } from "@/lib/cn";
import { toTelHref } from "@/lib/urls";

interface SiteHeaderProps {
  categoryMenuItems: Array<{ category: { key: string; name: string }; previewImage: string | null; previewName: string }>;
}

function ChevronDownIcon() {
  return <svg aria-hidden="true" viewBox="0 0 20 20" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="m5 7.5 5 5 5-5" /></svg>;
}

export function SiteHeader({ categoryMenuItems }: SiteHeaderProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [productsOpen, setProductsOpen] = useState(false);
  const productsRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function closeOnOutsideClick(event: PointerEvent) {
      const target = event.target as Node | null;
      if (productsRef.current && target && !productsRef.current.contains(target)) setProductsOpen(false);
    }
    window.addEventListener("pointerdown", closeOnOutsideClick);
    return () => window.removeEventListener("pointerdown", closeOnOutsideClick);
  }, []);

  const closeMenu = () => {
    setIsOpen(false);
    setProductsOpen(false);
  };

  if (pathname.startsWith("/portal")) return null;

  return (
    <header className="sticky top-0 z-50 border-b border-[#dce6f2] bg-[#f8fbff]/95 backdrop-blur-xl print:hidden">
      <div className="bg-[#173f70] text-white">
        <Container className="flex min-h-8 items-center justify-between gap-4 text-[0.58rem] font-semibold uppercase tracking-[0.16em] sm:text-[0.62rem]">
          <span className="truncate">Ganesh Market, Narayangarh, Chitwan</span>
          <span className="hidden shrink-0 sm:inline">Sunday–Friday&nbsp; | &nbsp;9:00 AM–6:00 PM</span>
        </Container>
      </div>
      <Container className="flex min-w-0 min-h-[3.6rem] items-center justify-between gap-4">
        <Link href="/" aria-label={siteConfig.name} onClick={closeMenu} className="flex min-w-0 shrink items-center gap-3">
          <BrandLogo compact />
          <span className="hidden h-7 w-px bg-[#cbd8e7] sm:block" />
          <span className="hidden max-w-[15rem] truncate text-[0.68rem] font-medium tracking-[0.02em] text-[#315887] sm:block">Better Technology. Brighter Tomorrow.</span>
        </Link>

        <div className="hidden items-center gap-4 text-[0.64rem] font-medium text-[#315887] lg:flex">
          <span>CCTV</span><span className="text-[#a9b7c8]">•</span><span>Security</span><span className="text-[#a9b7c8]">•</span><span>Networking</span><span className="text-[#a9b7c8]">•</span><span>Installation</span><span className="text-[#a9b7c8]">•</span><span>Support</span>
        </div>

        <button type="button" onClick={() => setIsOpen((current) => !current)} className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#d4e0ee] bg-white text-[#1463d7] lg:hidden" aria-expanded={isOpen} aria-controls="public-mobile-menu" aria-label="Toggle menu"><span className="flex flex-col gap-1"><span className="block h-0.5 w-4 bg-current" /><span className="block h-0.5 w-4 bg-current" /><span className="block h-0.5 w-4 bg-current" /></span></button>
      </Container>

      <div className="hidden border-t border-[#e5edf5] bg-white lg:block">
        <Container className="flex h-[3.1rem] items-center justify-between gap-6">
          <nav className="flex items-center gap-1" aria-label="Primary navigation">
            {navigation.map((item) => {
              const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
              if (item.href !== "/products") return <Link key={item.href} href={item.href} onClick={closeMenu} className={cn("rounded-md px-3 py-2 text-[0.72rem] font-semibold transition", active ? "bg-[#e9f1ff] text-[#1463d7]" : "text-[#4f6178] hover:bg-[#f3f7fb] hover:text-[#1463d7]")}>{item.label}</Link>;
              return <div key={item.href} ref={productsRef} className="relative"><div className={cn("flex items-center gap-0 rounded-md", active || productsOpen ? "bg-[#e9f1ff] text-[#1463d7]" : "text-[#4f6178]")}><Link href="/products" onClick={closeMenu} className="rounded-l-md px-3 py-2 text-[0.72rem] font-semibold">Products</Link><button type="button" onClick={() => setProductsOpen((current) => !current)} aria-expanded={productsOpen} aria-label="Toggle product categories" className="inline-flex items-center justify-center rounded-r-md px-1.5 py-2 text-[0.72rem]"><ChevronDownIcon /></button></div>{productsOpen ? <div className="absolute left-0 top-full z-50 w-[28rem] max-w-[calc(100vw-2rem)] pt-2"><div className="max-h-[calc(100vh-6rem)] overflow-y-auto rounded-xl border border-[#dce6f2] bg-white p-3 shadow-[0_18px_48px_rgba(17,39,75,0.14)]"><Link href="/products" onClick={closeMenu} className="flex items-center justify-between rounded-lg bg-[#f1f6fd] px-3 py-2.5 text-xs font-semibold text-[#1d426f]"><span>All products</span><span>{categoryMenuItems.length} categories</span></Link><div className="mt-2 grid grid-cols-2 gap-2">{categoryMenuItems.map(({ category, previewImage, previewName }) => <Link key={category.key} href={`/products#${category.key}`} onClick={closeMenu} className="flex min-w-0 items-center gap-2 rounded-lg border border-[#e3ebf4] p-2 transition hover:border-[#8cb4f7] hover:bg-[#f7faff]"><span className="relative h-9 w-9 shrink-0 overflow-hidden rounded-md bg-[#f3f7fb]">{previewImage ? <Image src={previewImage} alt={previewName} fill sizes="36px" className="object-contain p-1" unoptimized /> : null}</span><span className="truncate text-[0.68rem] font-semibold text-[#43566e]">{category.name}</span></Link>)}</div></div></div> : null}</div>;
            })}
          </nav>
          <div className="flex items-center gap-3"><Link href="/portal/login" className="text-[0.7rem] font-semibold text-[#315887] hover:text-[#1463d7]">Staff Portal</Link><a href={toTelHref(siteConfig.contact.primaryPhone)} className="inline-flex h-8 items-center rounded-md bg-[#1463d7] px-3 text-[0.68rem] font-semibold text-white">Call {siteConfig.contact.primaryPhone}</a></div>
        </Container>
      </div>

      {isOpen ? <div id="public-mobile-menu" className="absolute inset-x-3 top-[5.6rem] z-50 rounded-xl border border-[#dce6f2] bg-white p-3 shadow-[0_18px_48px_rgba(17,39,75,0.14)] lg:hidden"><nav className="grid gap-1" aria-label="Mobile navigation">{navigation.map((item) => <Link key={item.href} href={item.href} onClick={closeMenu} className="rounded-lg bg-[#f5f8fc] px-3 py-2.5 text-sm font-semibold text-[#38516f]">{item.label}</Link>)}<Link href="/portal/login" onClick={closeMenu} className="rounded-lg border border-[#dce6f2] px-3 py-2.5 text-center text-sm font-semibold text-[#1463d7]">Staff Portal Login</Link><a href={toTelHref(siteConfig.contact.primaryPhone)} onClick={closeMenu} className="action-primary w-full">Call {siteConfig.contact.primaryPhone}</a></nav></div> : null}
    </header>
  );
}
