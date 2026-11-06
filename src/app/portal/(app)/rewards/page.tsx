import Image from "next/image";
import { RedemptionForm, RewardForm } from "@/components/portal/idea3-forms";
import { PortalIcon, PortalPageHeader, PortalStatusBadge } from "@/components/portal/portal-ui";
import { requirePortalUser } from "@/lib/portal/auth";
import { getPointBalance, getRewardItems } from "@/lib/portal/queries";

export const runtime = "nodejs";

export default async function PortalRewardsPage() {
  const user = await requirePortalUser();
  const rewards = getRewardItems(user.role === "owner" || user.role === "manager" || user.role === "staff");
  const balance = user.role === "technician" ? getPointBalance(user.id) : null;

  return <div className="space-y-6">
    <PortalPageHeader eyebrow="Technician rewards" title="Rewards store" description={user.role === "technician" ? "Choose a reward with your SS Points." : "Keep the reward catalogue visual, compact, and ready for approval."} />
    {balance ? <div className="surface-card flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-brand-blue">Your balance</p><p className="mt-1 font-heading text-3xl text-ink">{balance.balance} <span className="text-lg text-brand-blue">SS Points</span></p></div><div className="rounded-xl bg-surface-strong px-4 py-3 text-right text-xs copy-muted"><span className="block font-semibold text-ink">{balance.earned} earned</span><span className="mt-1 block">{balance.redeemed} redeemed</span></div></div> : null}
    {user.role === "owner" ? <details className="surface-card overflow-hidden"><summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 sm:px-7"><span><span className="block text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-brand-blue">Catalogue management</span><span className="mt-1 block font-heading text-xl text-ink">Add reward</span></span><span className="inline-flex items-center gap-2 rounded-xl bg-brand-blue px-4 py-2.5 text-sm font-semibold text-white"><PortalIcon name="plus" className="h-4 w-4" />Add item</span></summary><div className="border-t border-line px-5 pb-6 pt-5 sm:px-7"><RewardForm /></div></details> : null}
    <section className="surface-card p-5 sm:p-7">
      <div className="flex items-end justify-between gap-4 border-b border-line pb-5"><div><p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-brand-blue">Store</p><h2 className="mt-1 font-heading text-2xl text-ink">{rewards.length} reward {rewards.length === 1 ? "item" : "items"}</h2></div><p className="text-xs copy-muted">Stock checked at approval</p></div>
      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{rewards.map((reward) => <article key={reward.id} className="overflow-hidden rounded-2xl border border-line bg-white transition hover:-translate-y-0.5 hover:border-brand-blue/40 hover:shadow-[0_14px_30px_rgba(16,45,85,0.07)]"><div className="relative h-44 bg-surface-strong"><Image src={reward.imagePath ?? "/brand/logo-icon.png"} alt={reward.name} fill sizes="(max-width: 768px) 100vw, 320px" className="object-contain p-5" unoptimized /><div className="absolute right-3 top-3"><PortalStatusBadge value={reward.active ? "active" : "inactive"} /></div></div><div className="p-4"><p className="text-[0.63rem] font-semibold uppercase tracking-[0.15em] text-brand-blue">{reward.category}</p><h3 className="mt-1 line-clamp-2 min-h-[3.25rem] font-heading text-xl leading-tight text-ink">{reward.name}</h3><div className="mt-4 flex items-end justify-between border-t border-line pt-3"><span className="font-heading text-2xl text-brand-blue">{reward.pointsCost} <span className="text-sm">pts</span></span><span className="text-xs copy-muted">{reward.stockQuantity} in stock</span></div>{user.role === "technician" && reward.active ? <RedemptionForm reward={reward} /> : null}{user.role === "owner" ? <details className="mt-4 border-t border-line pt-3"><summary className="flex cursor-pointer list-none items-center justify-between text-sm font-semibold text-ink"><span className="flex items-center gap-2"><PortalIcon name="edit" className="h-4 w-4 text-brand-blue" />Edit item</span><span className="text-brand-blue">⌄</span></summary><div className="pt-4"><RewardForm reward={reward} /></div></details> : null}</div></article>)}</div>
    </section>
  </div>;
}
