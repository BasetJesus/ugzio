import Link from "next/link"
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { redirect } from "next/navigation";
import { getOrgFromUserId } from "@/lib/billing/enforce";
import { getRiskDashboard } from "@/services/risk.service";
import { getNeedsConfirmCount, getRevenueAtRisk } from "@/services/risk.service";

export const dynamic = "force-dynamic";

export default async function OverviewPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const orgId = await getOrgFromUserId(session.user.id);
  if (!orgId) redirect("/onboarding");

  const [revenueAtRisk, needsAction] = await Promise.all([
    getRevenueAtRisk(orgId),
    getNeedsConfirmCount(orgId),
  ]);

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-zinc-100">Order Risk Control</h1>
        <p className="text-xs text-zinc-500 mt-0.5">What is losing you money right now</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-5">
          <div className="flex items-start justify-between">
            <span className="text-2xl">⚠️</span>
          </div>
          <p className="mt-3 text-3xl font-bold tracking-tight text-red-400">
            {revenueAtRisk.toFixed(0)} <span className="text-sm font-medium text-red-400/70">TND</span>
          </p>
          <p className="mt-1 text-[11px] font-medium uppercase tracking-wider text-red-400/70">Revenue at risk</p>
        </div>

        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-5">
          <div className="flex items-start justify-between">
            <span className="text-2xl">📦</span>
          </div>
          <p className="mt-3 text-3xl font-bold tracking-tight text-amber-400">
            {needsAction}
          </p>
          <p className="mt-1 text-[11px] font-medium uppercase tracking-wider text-amber-400/70">Orders needing action</p>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 flex flex-col justify-center">
          <p className="text-xs text-zinc-500 mb-3">Next step</p>
          <Link
            href="/confirm"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-purple-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-purple-500"
          >
            Go to confirm queue &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
