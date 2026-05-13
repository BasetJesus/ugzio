import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { redirect } from "next/navigation";
import { getOrgFromUserId } from "@/lib/billing/enforce";
import { getConfirmationQueue } from "@/services/demo-orchestrator.service";
import ConfirmationPanel from "@/components/confirm/ConfirmationPanel";

export const dynamic = "force-dynamic";

export default async function ConfirmPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const orgId = await getOrgFromUserId(session.user.id);
  if (!orgId) redirect("/onboarding");

  const queue = await getConfirmationQueue(orgId);

  const highRiskItems = queue.items.filter((i) => i.riskLevel === "high");
  const revenueAtRisk = Math.round(
    highRiskItems.reduce((s, i) => s + i.amount, 0) * 0.3
  );
  const potentialLossPrevented = queue.items
    .filter((i) => i.confirmStatus === "confirmed")
    .reduce((s, i) => s + i.amount, 0);

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-zinc-100">Revenue at Risk &mdash; Live Protection Queue</h1>
        <p className="text-xs text-zinc-500 mt-0.5">
          These orders may fail delivery. Every action protects revenue.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
          <p className="text-[10px] font-medium text-red-400/70 uppercase tracking-wider">Revenue at risk</p>
          <p className="text-xl font-bold text-red-400 mt-1">{revenueAtRisk.toFixed(0)} TND</p>
        </div>
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
          <p className="text-[10px] font-medium text-amber-400/70 uppercase tracking-wider">High risk orders</p>
          <p className="text-xl font-bold text-amber-400 mt-1">{highRiskItems.length}</p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-4">
          <p className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">Pending confirmation</p>
          <p className="text-xl font-bold text-zinc-100 mt-1">{queue.pendingCount}</p>
        </div>
        <div className="rounded-xl border border-green-500/20 bg-green-500/5 p-4">
          <p className="text-[10px] font-medium text-green-400/70 uppercase tracking-wider">Loss prevented</p>
          <p className="text-xl font-bold text-green-400 mt-1">{potentialLossPrevented.toFixed(0)} TND</p>
        </div>
      </div>

      <ConfirmationPanel
        items={queue.items}
        pendingCount={queue.pendingCount}
        contactedCount={queue.contactedCount}
        total={queue.total}
      />
    </div>
  );
}
