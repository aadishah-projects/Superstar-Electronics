"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Container } from "@/components/container";
import { catalogCategories, getProductsForCategory } from "@/data/catalog";
import { navigation, siteConfig } from "@/data/site";
import { cn } from "@/lib/cn";
import { toTelHref } from "@/lib/urls";

export function SiteHeader() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [desktopProductsOpen, setDesktopProductsOpen] = useState(false);
  const [mobileProductsOpen, setMobileProductsOpen] = useState(false);
  const desktopProductsRef = useRef<HTMLDivElement | null>(null);
  const closeMenu = () => {
    setIsOpen(false);
    setDesktopProductsOpen(false);
    setMobileProductsOpen(false);
  };

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      const target = event.target as Node | null;

      if (desktopProductsRef.current && target && !desktopProductsRef.current.contains(target)) {
        setDesktopProductsOpen(false);
      }
    }

    window.addEventListener("pointerdown", handlePointerDown);
    return () => window.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-white/88 backdrop-blur-xl">
      <div className="bg-brand-blue text-white">
        <Container className="flex flex-col gap-2 py-2 text-[0.72rem] uppercase tracking-[0.22em] sm:flex-row sm:items-center sm:justify-between">
          <p>
            {siteConfig.address.street}, {siteConfig.address.locality}
          </p>
          <a
            href={toTelHref(siteConfig.contact.primaryPhone)}
            className="text-white/85 transition hover:text-white"
          >
            Sunday-Friday | 9:00 AM - 6:00 PM
          </a>
        </Container>
      </div>

      <Container className="relative flex items-center justify-between py-3">
        <Link href="/" className="shrink-0" aria-label={siteConfig.name} onClick={closeMenu}>
          <Image
            src="/brand/logo-horizontal.png"
            alt={siteConfig.name}
            width={848}
            height={276}
            priority
            className="h-auto w-[185px] sm:w-[220px]"
          />
        </Link>

        <nav className="hidden items-center gap-2 lg:flex" aria-label="Primary navigation">
          {navigation.map((item) => {
            const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

            if (item.href === "/products") {
              return (
                <div
                  key={item.href}
                  ref={desktopProductsRef}
                  className="relative"
                  onMouseEnter={() => setDesktopProductsOpen(true)}
                  onMouseLeave={() => setDesktopProductsOpen(false)}
                >
                  <div
                    className={cn(
                      "inline-flex items-center rounded-full transition",
                      isActive || desktopProductsOpen
                        ? "bg-brand-blue text-white shadow-[0_14px_32px_rgba(28,60,110,0.18)]"
                        : "text-ink hover:bg-surface",
                    )}
                  >
                    <Link
                      href={item.href}
                      onClick={closeMenu}
                      className={cn(
                        "rounded-l-full px-4 py-2 text-sm font-semibold transition",
                        isActive || desktopProductsOpen
                          ? "text-white"
                          : "hover:text-brand-blue",
                      )}
                    >
                      {item.label}
                    </Link>
                    <button
                      type="button"
                      onClick={() => setDesktopProductsOpen((current) => !current)}
                      className={cn(
                        "rounded-r-full px-3 py-2 transition",
                        isActive || desktopProductsOpen
                          ? "text-white"
                          : "hover:text-brand-blue",
                      )}
                      aria-expanded={desktopProductsOpen}
                      aria-haspopup="menu"
                      aria-label="Toggle product categories"
                    >
                      <svg
                        aria-hidden="true"
                        viewBox="0 0 20 20"
                        className={cn(
                          "h-4 w-4 transition",
                          desktopProductsOpen && "rotate-180",
                        )}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="m5 7.5 5 5 5-5" />
                      </svg>
                    </button>
                  </div>

                  {desktopProductsOpen ? (
                    <div className="absolute left-0 top-full z-50 w-[33rem] pt-3">
                      <div className="rounded-[1.75rem] border border-line bg-white p-5 shadow-[0_22px_75px_rgba(17,39,75,0.14)]">
                        <div className="rounded-[1.5rem] bg-surface-strong p-4">
                          <Link
                            href="/products"
                            onClick={closeMenu}
                            className="flex items-center justify-between rounded-[1.25rem] bg-white px-4 py-3 text-sm font-semibold text-ink transition hover:text-brand-blue"
                          >
                            <span>All Products</span>
                            <span className="text-brand-blue">{catalogCategories.length} categories</span>
                          </Link>
                        </div>

                        <div className="mt-4 grid gap-3 sm:grid-cols-2">
                          {catalogCategories.map((category) => (
                            <Link
                              key={category.key}
                              href={`/products#${category.key}`}
                              onClick={closeMenu}
                              className="rounded-[1.25rem] border border-line px-4 py-4 transition hover:border-brand-blue hover:bg-surface-strong"
                            >
                              <div className="flex items-start justify-between gap-4">
                                <div>
                                  <p className="font-semibold text-ink">{category.name}</p>
                                  <p className="mt-1 text-sm leading-6 copy-muted">
                                    {category.description}
                                  </p>
                                </div>
                                <span className="rounded-full bg-brand-blue px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-white">
                                  {getProductsForCategory(category.key).length}
                                </span>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-semibold transition",
                  isActive
                    ? "bg-brand-blue text-white shadow-[0_14px_32px_rgba(28,60,110,0.18)]"
                    : "text-ink hover:bg-surface hover:text-brand-blue",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden lg:block">
          <a href={toTelHref(siteConfig.contact.primaryPhone)} className="action-secondary">
            Call {siteConfig.contact.primaryPhone}
          </a>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen((current) => !current)}
          className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-line bg-white text-brand-blue lg:hidden"
          aria-expanded={isOpen}
          aria-controls="mobile-menu"
          aria-label="Toggle menu"
        >
          <span className="flex flex-col gap-1.5">
            <span className="block h-0.5 w-5 rounded-full bg-current" />
            <span className="block h-0.5 w-5 rounded-full bg-current" />
            <span className="block h-0.5 w-5 rounded-full bg-current" />
          </span>
        </button>

        {isOpen ? (
          <div
            id="mobile-menu"
            className="absolute inset-x-0 top-full mt-3 rounded-[1.75rem] border border-line bg-white p-4 shadow-[0_22px_75px_rgba(17,39,75,0.14)] lg:hidden"
          >
            <nav className="flex flex-col gap-2" aria-label="Mobile navigation">
              {navigation.map((item) => {
                const isActive =
                  item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

                if (item.href === "/products") {
                  return (
                    <div key={item.href} className="rounded-2xl bg-surface-strong p-2">
                      <div
                        className={cn(
                          "flex items-center rounded-2xl",
                          isActive ? "bg-brand-blue text-white" : "bg-white text-ink",
                        )}
                      >
                        <Link
                          href="/products"
                          onClick={closeMenu}
                          className={cn(
                            "flex-1 rounded-l-2xl px-4 py-3 text-sm font-semibold transition",
                            isActive ? "text-white" : "hover:text-brand-blue",
                          )}
                        >
                          {item.label}
                        </Link>
                        <button
                          type="button"
                          onClick={() => setMobileProductsOpen((current) => !current)}
                          className={cn(
                            "rounded-r-2xl px-4 py-3 transition",
                            isActive ? "text-white" : "hover:text-brand-blue",
                          )}
                          aria-expanded={mobileProductsOpen}
                          aria-label="Toggle product categories"
                        >
                          <svg
                            aria-hidden="true"
                            viewBox="0 0 20 20"
                            className={cn(
                              "h-4 w-4 transition",
                              mobileProductsOpen && "rotate-180",
                            )}
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="m5 7.5 5 5 5-5" />
                          </svg>
                        </button>
                      </div>

                      {mobileProductsOpen ? (
                        <div className="mt-2 space-y-2 px-2 pb-2">
                          <Link
                            href="/products"
                            onClick={closeMenu}
                            className="block rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-ink transition hover:text-brand-blue"
                          >
                            All Products
                          </Link>
                          {catalogCategories.map((category) => (
                            <Link
                              key={category.key}
                              href={`/products#${category.key}`}
                              onClick={closeMenu}
                              className="block rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-ink transition hover:text-brand-blue"
                            >
                              {category.name}
                            </Link>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  );
                }

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={closeMenu}
                    className={cn(
                      "rounded-2xl px-4 py-3 text-sm font-semibold transition",
                      isActive
                        ? "bg-brand-blue text-white"
                        : "bg-surface-strong text-ink hover:text-brand-blue",
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <a
              href={toTelHref(siteConfig.contact.primaryPhone)}
              onClick={closeMenu}
              className="action-secondary mt-4 w-full"
            >
              Call {siteConfig.contact.primaryPhone}
            </a>
          </div>
        ) : null}
      </Container>
    </header>
  );
}
