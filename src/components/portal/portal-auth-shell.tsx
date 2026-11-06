import Link from "next/link";
import type { ReactNode } from "react";
import { BrandLogo } from "@/components/brand-logo";

const workspaceBenefits = [
  { number: "01", label: "See today", detail: "Jobs, enquiries, and follow-ups" },
  { number: "02", label: "Move work", detail: "Assign, accept, and update jobs" },
  { number: "03", label: "Stay close", detail: "Customers, support, and payments" },
];

export function PortalAuthShell({
  eyebrow,
  title,
  description,
  children,
  footer,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <section className="portal-auth-page relative isolate min-h-screen overflow-hidden bg-[#f3f7fc] px-4 py-5 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
      <div aria-hidden="true" className="pointer-events-none absolute -left-24 top-16 h-72 w-72 rounded-full bg-[#b9d8ff]/45 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -right-24 bottom-0 h-96 w-96 rounded-full bg-[#f6caca]/35 blur-3xl" />

      <div className="relative mx-auto grid w-full max-w-6xl overflow-hidden rounded-[2rem] border border-[#d9e4f0] bg-white shadow-[0_24px_80px_rgba(21,61,108,0.12)] lg:grid-cols-[0.82fr_1.18fr]">
        <aside className="relative hidden overflow-hidden bg-[#173f70] p-8 text-white lg:flex lg:min-h-[680px] lg:flex-col lg:justify-between xl:p-10">
          <div aria-hidden="true" className="absolute -right-28 -top-24 h-80 w-80 rounded-full border-[36px] border-white/10" />
          <div aria-hidden="true" className="absolute -bottom-32 -left-24 h-72 w-72 rounded-full border-[28px] border-[#2d79cf]/35" />
          <div className="relative">
            <BrandLogo dark />
            <div className="mt-20 max-w-sm">
              <p className="text-[0.68rem] font-bold uppercase tracking-[0.22em] text-[#b9d7ff]">Private operations workspace</p>
              <h2 className="mt-4 font-heading text-4xl font-semibold leading-[1.04] tracking-tight">Keep the work moving.</h2>
              <p className="mt-5 text-sm leading-6 text-white/70">One calm place for customer conversations, quotations, dispatch, and the people who keep every installation running.</p>
            </div>
          </div>

          <div className="relative space-y-2.5">
            {workspaceBenefits.map((benefit) => (
              <div key={benefit.number} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.07] p-3.5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 font-heading text-sm font-semibold text-[#d9eaff]">{benefit.number}</span>
                <span className="min-w-0"><span className="block text-sm font-semibold">{benefit.label}</span><span className="mt-0.5 block text-xs text-white/55">{benefit.detail}</span></span>
              </div>
            ))}
            <p className="pt-4 text-xs text-white/50">Ganesh Market · Narayangarh, Chitwan</p>
          </div>
        </aside>

        <div className="min-w-0 p-5 sm:p-8 lg:p-12 xl:p-14">
          <div className="flex items-center justify-between gap-4">
            <BrandLogo compact />
            <Link href="/" className="text-xs font-semibold text-[#315887] transition hover:text-[#1463d7]">Public website <span aria-hidden="true">↗</span></Link>
          </div>

          <div className="mt-10 sm:mt-14 lg:mt-16">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#cddded] bg-[#f4f8fd] px-3 py-1.5 text-[0.62rem] font-bold uppercase tracking-[0.18em] text-[#315887]"><span className="h-1.5 w-1.5 rounded-full bg-[#1fa36b]" />{eyebrow}</div>
            <h1 className="mt-5 max-w-xl font-heading text-3xl font-semibold leading-[1.05] tracking-tight text-[#172d4b] sm:text-5xl">{title}</h1>
            <p className="mt-4 max-w-xl text-sm leading-6 text-[#6f8197] sm:text-base">{description}</p>
          </div>

          <div className="mt-8 grid grid-cols-3 gap-2 border-y border-[#e6edf5] py-3 lg:hidden">
            {workspaceBenefits.map((benefit) => <div key={benefit.number}><p className="font-heading text-base font-semibold text-[#1463d7]">{benefit.number}</p><p className="mt-0.5 text-[0.65rem] font-semibold text-[#31516f]">{benefit.label}</p></div>)}
          </div>

          {children}
          {footer}
        </div>
      </div>
    </section>
  );
}
