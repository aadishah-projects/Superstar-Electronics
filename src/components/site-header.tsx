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
  const categoryMenuItems = catalogCategories.map((category) => {
    const products = getProductsForCategory(category.key);

    return {
      category,
      previewImage: products[0]?.image ?? null,
      previewName: products[0]?.name ?? category.name,
    };
  });

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
        <Container className="flex flex-col gap-1 py-1.5 text-[0.62rem] uppercase tracking-[0.16em] sm:flex-row sm:items-center sm:justify-between sm:gap-2 sm:py-2 sm:text-[0.72rem] sm:tracking-[0.22em]">
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

      <Container className="relative flex items-center justify-between py-2 sm:py-3">
        <Link href="/" className="shrink-0" aria-label={siteConfig.name} onClick={closeMenu}>
          <Image
            src="/brand/logo-horizontal.png"
            alt={siteConfig.name}
            width={848}
            height={276}
            priority
            className="h-auto w-[150px] sm:w-[220px]"
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
                    <div className="absolute left-0 top-full z-50 w-[28rem] pt-3">
                      <div className="max-h-[calc(100vh-7rem)] overflow-y-auto rounded-[1.75rem] border border-line bg-white p-5 shadow-[0_22px_75px_rgba(17,39,75,0.14)]">
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

                        <div className="mt-4 grid gap-2 sm:grid-cols-2">
                          {categoryMenuItems.map(({ category, previewImage, previewName }) => (
                            <Link
                              key={category.key}
                              href={`/products#${category.key}`}
                              onClick={closeMenu}
                              className="rounded-[1.15rem] border border-line px-3 py-3 transition hover:border-brand-blue hover:bg-surface-strong"
                            >
                              <div className="flex items-center gap-3">
                                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-[0.95rem] bg-surface-strong">
                                  {previewImage ? (
                                    <Image
                                      src={previewImage}
                                      alt={previewName}
                                      fill
                                      sizes="48px"
                                      className="object-contain p-1.5"
                                      unoptimized
                                    />
                                  ) : null}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="truncate font-semibold text-ink">{category.name}</p>
                                </div>
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
          className="inline-flex h-10 w-10 items-center justify-center rounded-[1rem] border border-line bg-white text-brand-blue lg:hidden"
          aria-expanded={isOpen}
          aria-controls="mobile-menu"
          aria-label="Toggle menu"
        >
          <span className="flex flex-col gap-1.25">
            <span className="block h-0.5 w-4.5 rounded-full bg-current" />
            <span className="block h-0.5 w-4.5 rounded-full bg-current" />
            <span className="block h-0.5 w-4.5 rounded-full bg-current" />
          </span>
        </button>

        {isOpen ? (
          <div
            id="mobile-menu"
            className="absolute inset-x-0 top-full mt-2 rounded-[1.35rem] border border-line bg-white p-3 shadow-[0_22px_75px_rgba(17,39,75,0.14)] lg:hidden"
          >
            <nav className="flex flex-col gap-1.5" aria-label="Mobile navigation">
              {navigation.map((item) => {
                const isActive =
                  item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

                if (item.href === "/products") {
                  return (
                    <div key={item.href} className="rounded-[1rem] bg-surface-strong p-1.5">
                      <div
                        className={cn(
                          "flex items-center rounded-[0.95rem]",
                          isActive ? "bg-brand-blue text-white" : "bg-white text-ink",
                        )}
                      >
                        <Link
                          href="/products"
                          onClick={closeMenu}
                          className={cn(
                            "flex-1 rounded-l-[0.95rem] px-3 py-2.5 text-sm font-semibold transition",
                            isActive ? "text-white" : "hover:text-brand-blue",
                          )}
                        >
                          {item.label}
                        </Link>
                        <button
                          type="button"
                          onClick={() => setMobileProductsOpen((current) => !current)}
                          className={cn(
                            "rounded-r-[0.95rem] px-3 py-2.5 transition",
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
                        <div className="mt-2 space-y-1.5 px-1.5 pb-1.5">
                          <Link
                            href="/products"
                            onClick={closeMenu}
                            className="block rounded-[0.95rem] bg-white px-3 py-2.5 text-sm font-semibold text-ink transition hover:text-brand-blue"
                          >
                            All Products
                          </Link>
                          {catalogCategories.map((category) => (
                            <Link
                              key={category.key}
                              href={`/products#${category.key}`}
                              onClick={closeMenu}
                              className="block rounded-[0.95rem] bg-white px-3 py-2.5 text-sm font-semibold text-ink transition hover:text-brand-blue"
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
                      "rounded-[0.95rem] px-3 py-2.5 text-sm font-semibold transition",
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
              className="action-secondary mt-3 w-full"
            >
              Call {siteConfig.contact.primaryPhone}
            </a>
          </div>
        ) : null}
      </Container>
    </header>
  );
}
