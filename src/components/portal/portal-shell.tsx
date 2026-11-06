import Image from "next/image";
import Link from "next/link";
import { logoutAction } from "@/lib/portal/actions";
import { PortalIcon, type PortalIconName } from "@/components/portal/portal-ui";
import { PortalNavLink } from "@/components/portal/portal-nav-link";
import { portalRoleLabels, type PortalRole, type PortalUser } from "@/lib/portal/types";

interface PortalShellProps {
  user: PortalUser;
  children: React.ReactNode;
}

type NavSection = "workspace" | "sales" | "rewards" | "administration";

const navItems: Array<{ href: string; label: string; icon: PortalIconName; roles: PortalRole[]; section: NavSection }> = [
  { href: "/portal/dashboard", label: "Dashboard", icon: "home", roles: ["owner", "manager", "staff", "technician"], section: "workspace" },
  { href: "/portal/jobs", label: "Jobs & Dispatch", icon: "briefcase", roles: ["owner", "manager", "staff", "technician"], section: "workspace" },
  { href: "/portal/customers", label: "Customers", icon: "users", roles: ["owner", "manager", "staff", "technician"], section: "workspace" },
  { href: "/portal/projects", label: "Projects", icon: "folder", roles: ["owner", "manager", "staff", "technician"], section: "workspace" },
  { href: "/portal/enquiries", label: "Enquiries", icon: "inbox", roles: ["owner", "manager", "staff"], section: "workspace" },
  { href: "/portal/tickets", label: "Service Requests", icon: "headphones", roles: ["owner", "manager", "staff", "technician"], section: "workspace" },
  { href: "/portal/schedule", label: "Schedule", icon: "calendar", roles: ["owner", "manager", "staff", "technician"], section: "workspace" },
  { href: "/portal/quotations", label: "Quotations", icon: "file", roles: ["owner", "manager", "staff"], section: "sales" },
  { href: "/portal/products", label: "Products", icon: "package", roles: ["owner", "manager"], section: "sales" },
  { href: "/portal/points", label: "SS Points", icon: "gift", roles: ["owner", "manager", "staff", "technician"], section: "rewards" },
  { href: "/portal/rewards", label: "Rewards", icon: "gift", roles: ["owner", "manager", "staff", "technician"], section: "rewards" },
  { href: "/portal/redemptions", label: "Redemptions", icon: "wallet", roles: ["owner", "manager", "staff", "technician"], section: "rewards" },
  { href: "/portal/reports", label: "Reports", icon: "chart", roles: ["owner", "manager", "staff"], section: "administration" },
  { href: "/portal/team", label: "Team", icon: "tool", roles: ["owner"], section: "administration" },
];

const sectionLabels: Record<NavSection, string> = {
  workspace: "Workspace",
  sales: "Sales & catalog",
  rewards: "Rewards",
  administration: "Administration",
};

function initials(name: string) {
  return name.split(/\s+/).map((part) => part[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();
}

function PortalBrand({ compact = false, dark = false }: { compact?: boolean; dark?: boolean }) {
  return (
    <Link href="/portal/dashboard" className={`flex items-center gap-2.5 ${compact ? "min-w-0" : ""}`}>
      <Image src="/brand/logo-icon.png" alt="Super Star Electronics" width={38} height={38} className="h-9 w-9 object-contain" />
      <span className="min-w-0 leading-tight">
        <span className={`block font-heading text-[0.8rem] font-semibold ${dark ? "text-white" : "text-[#123b75]"}`}>Super Star</span>
        <span className={`block font-heading text-[0.8rem] font-semibold ${dark ? "text-white" : "text-[#123b75]"}`}>Electronics</span>
      </span>
    </Link>
  );
}

function PortalNav({ user, onNavigate, dark = false }: { user: PortalUser; onNavigate?: () => void; dark?: boolean }) {
  const visibleItems = navItems.filter((item) => item.roles.includes(user.role));
  return (
    <nav className="grid gap-1" aria-label="Portal navigation">
      {visibleItems.map((item, index) => {
        const previous = visibleItems[index - 1];
        const startsSection = previous?.section !== item.section;
        return (
          <div key={item.href} className={startsSection && index > 0 ? "mt-3 border-t border-[#edf0f5] pt-3" : ""}>
            {startsSection ? <p className={`mb-1 px-3 text-[0.58rem] font-bold uppercase tracking-[0.16em] ${dark ? "text-white/45" : "text-[#9aa5b4]"}`}>{sectionLabels[item.section]}</p> : null}
            <PortalNavLink href={item.href} label={item.label} icon={item.icon} onNavigate={onNavigate} dark={dark} />
          </div>
        );
      })}
    </nav>
  );
}

export function PortalShell({ user, children }: PortalShellProps) {
  const canCreate = user.role !== "technician";
  return (
    <div className="portal-page min-h-screen bg-[#f5f7fb] text-ink">
      <div className="w-full">
        <div className="bg-[#173f70] text-white print:hidden">
          <div className="flex min-h-8 items-center justify-between gap-4 px-4 text-[0.58rem] font-semibold uppercase tracking-[0.16em] sm:px-6 lg:px-8">
            <span className="truncate">Ganesh Market, Narayangarh, Chitwan</span>
            <span className="hidden shrink-0 sm:inline">Sunday–Friday&nbsp; | &nbsp;9:00 AM–6:00 PM</span>
          </div>
        </div>
      </div>
      <div className="flex min-h-[calc(100vh-2rem)] w-full">
        <aside className="hidden w-[224px] shrink-0 flex-col border-r border-[#0f315a] bg-[#173f70] px-3 py-5 text-white lg:flex">
          <div className="px-3 pb-5"><PortalBrand dark /></div>
          <div className="mb-3 border-t border-white/10" />
          <div className="min-h-0 flex-1 overflow-y-auto pr-1"><PortalNav user={user} dark /></div>
          <div className="mt-5 border-t border-white/10 pt-4">
            <div className="flex items-center gap-2.5 px-2">
              <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/15 text-[0.68rem] font-bold text-white">{initials(user.name)}</span>
              <div className="min-w-0 flex-1"><p className="truncate text-[0.76rem] font-semibold text-white">{user.name}</p><p className="truncate text-[0.65rem] text-white/60">{portalRoleLabels[user.role]}</p></div>
              <form action={logoutAction}><button type="submit" aria-label="Sign out" title="Sign out" className="rounded-lg p-1.5 text-white/60 transition hover:bg-white/10 hover:text-white"><PortalIcon name="logout" className="h-4 w-4" /></button></form>
            </div>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-30 border-b border-[#e6ebf2] border-t-4 border-t-[#173f70] bg-white/95 backdrop-blur-xl print:hidden">
            <div className="flex h-[4.4rem] items-center gap-3 px-4 sm:px-6 lg:px-8">
              <div className="lg:hidden"><PortalBrand compact /></div>
              <form action="/portal/customers" method="get" className="relative hidden min-w-0 flex-1 sm:block sm:max-w-[25rem]">
                <PortalIcon name="search" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#a0aabd]" />
                <input name="search" aria-label="Search portal records" placeholder="Search jobs, customers, products..." className="h-10 w-full rounded-lg border border-[#e1e7ef] bg-[#f8fafc] pl-9 pr-3 text-[0.72rem] text-ink outline-none transition placeholder:text-[#a0aabd] focus:border-[#8cb4f7] focus:bg-white focus:ring-2 focus:ring-[#1463d7]/10" />
              </form>
              <div className="ml-auto flex items-center gap-2 sm:gap-3">
                {canCreate ? <Link href="/portal/jobs#quick-create" className="hidden h-9 items-center gap-1.5 rounded-lg bg-[#1463d7] px-3.5 text-[0.72rem] font-semibold text-white shadow-[0_7px_16px_rgba(20,99,215,0.18)] transition hover:bg-[#0f55bb] sm:inline-flex"><PortalIcon name="plus" className="h-3.5 w-3.5" />Quick Create</Link> : null}
                <Link href="/portal/dashboard#notifications" aria-label="Open notifications" title="Notifications" className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg text-[#66758a] transition hover:bg-[#f4f7fb] hover:text-[#1463d7]"><PortalIcon name="bell" className="h-[1.1rem] w-[1.1rem]" /><span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-[#ef6b4a]" /></Link>
                <Link href="/portal/dashboard#profile" className="flex items-center gap-2 rounded-lg p-1 transition hover:bg-[#f4f7fb]" aria-label="Open profile">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#dbeafe] text-[0.68rem] font-bold text-[#1463d7]">{initials(user.name)}</span>
                  <span className="hidden max-w-28 truncate text-[0.72rem] font-semibold text-[#27364a] md:block">{user.name}</span>
                  <PortalIcon name="chevron" className="hidden h-3.5 w-3.5 text-[#8792a2] md:block" />
                </Link>
              </div>
            </div>
          </header>

          <div className="border-b border-[#e6ebf2] bg-white px-4 py-3 lg:hidden">
            <details className="group">
              <summary className="flex cursor-pointer list-none items-center justify-between text-[0.76rem] font-semibold text-[#27364a]"><span className="flex items-center gap-2"><PortalIcon name="menu" className="h-4 w-4 text-[#1463d7]" />Portal navigation</span><PortalIcon name="chevron" className="h-4 w-4 text-[#8792a2] transition group-open:rotate-180" /></summary>
              <div className="mt-3 border-t border-[#edf0f5] pt-3"><PortalNav user={user} /></div>
            </details>
          </div>

          <main className="min-w-0 px-5 py-7 sm:px-8 lg:px-10 lg:py-9 xl:px-12">{children}</main>
        </div>
      </div>
    </div>
  );
}
