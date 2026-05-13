import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { redirect } from "next/navigation";
import { getOrgFromUserId } from "@/lib/billing/enforce";
import { getRevenueAtRisk, getNeedsConfirmCount } from "@/services/demo-orchestrator.service";
import KpiCard from "@/components/shared/KpiCard";

export const dynamic = "force-dynamic";

export default async function OverviewPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const orgId = await getOrgFromUserId(session.user.id);
  if (!orgId) redirect("/onboarding");

  let [revenueAtRisk, needsAction] = [0, 0];
  try {
    [revenueAtRisk, needsAction] = await Promise.all([
      getRevenueAtRisk(orgId),
      getNeedsConfirmCount(orgId),
    ]);
  } catch (e) {
    console.error("[overview] service error", e);
  }

  return (
    <div className="space-y-6" data-state="live">
      <div>
        <h1 className="text-xl font-bold text-[var(--text-primary)]">Live Revenue Stream</h1>
        <p className="text-xs text-[var(--text-secondary)] mt-0.5">What is happening now</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiCard
          label="Revenue at risk"
          value={`${revenueAtRisk.toFixed(0)} TND`}
          icon="⚠️"
          tier="high"
        />
        <KpiCard
          label="Orders needing action"
          value={needsAction}
          icon="📦"
          tier="medium"
        />
        <KpiCard
          label="Protection status"
          value={revenueAtRisk > 0 ? "Active" : "Stable"}
          icon="🛡️"
          tier={revenueAtRisk > 0 ? "low" : "low"}
        />
      </div>
    </div>
  );
}
