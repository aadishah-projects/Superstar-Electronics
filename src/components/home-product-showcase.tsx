"use client";

import Link from "next/link";
import { useState } from "react";
import { CatalogProductCard } from "@/components/catalog-product-card";
import { cn } from "@/lib/cn";
import type { CatalogProduct } from "@/types/site";

interface ShowcaseSection {
  key: string;
  label: string;
  title: string;
  description: string;
  href: string;
  products: CatalogProduct[];
}

interface HomeProductShowcaseProps {
  sections: ShowcaseSection[];
}

export function HomeProductShowcase({ sections }: HomeProductShowcaseProps) {
  const [activeKey, setActiveKey] = useState(sections[0]?.key ?? "");
  const activeSection =
    sections.find((section) => section.key === activeKey) ?? sections[0] ?? null;

  if (!activeSection) {
    return null;
  }

  return (
    <div className="surface-card-strong p-6 sm:p-8 lg:p-10">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <span className="section-kicker">Featured Products</span>
          <h2 className="mt-5 font-heading text-3xl tracking-tight text-ink sm:text-4xl">
            Start with the product groups customers ask for most.
          </h2>
          <p className="mt-4 max-w-3xl text-base leading-7 copy-muted">
            Switch categories, compare real models, and jump straight to WhatsApp.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {sections.map((section) => (
            <button
              key={section.key}
              type="button"
              onClick={() => setActiveKey(section.key)}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-semibold transition",
                section.key === activeSection.key
                  ? "bg-brand-blue text-white shadow-[0_14px_32px_rgba(28,60,110,0.18)]"
                  : "bg-white text-ink hover:bg-surface hover:text-brand-blue",
              )}
            >
              {section.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-blue">
            {activeSection.label}
          </p>
          <h3 className="mt-2 font-heading text-2xl tracking-tight text-ink sm:text-3xl">
            {activeSection.title}
          </h3>
          <p className="mt-3 max-w-3xl text-base leading-7 copy-muted">
            {activeSection.description}
          </p>
        </div>

        <Link href={activeSection.href} className="action-secondary">
          View Full Collection
        </Link>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {activeSection.products.map((product) => (
          <CatalogProductCard key={`${activeSection.key}-${product.id}`} product={product} />
        ))}
      </div>
    </div>
  );
}
