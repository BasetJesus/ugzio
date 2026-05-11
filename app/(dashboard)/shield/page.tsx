import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getOrgFromUserId } from "@/lib/billing/enforce";
import RiskBadge from "@/components/dashboard/RiskBadge";

export const dynamic = "force-dynamic";

export default async function ShieldPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/api/auth/signin");

  const orgId = await getOrgFromUserId(session.user.id);
  if (!orgId) redirect("/onboarding");

  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  const totalOrders = await prisma.order.count({ where: { organizationId: orgId, deletedAt: null } });
  const todayOrders = await prisma.order.count({ where: { organizationId: orgId, deletedAt: null, createdAt: { gte: todayStart } } });
  const highRiskOrders = await prisma.order.findMany({ where: { organizationId: orgId, deletedAt: null, riskLevel: "high" }, orderBy: { createdAt: "desc" }, take: 50 });
  const averageScore = totalOrders > 0
    ? (await prisma.order.aggregate({ where: { organizationId: orgId, deletedAt: null }, _avg: { trustScore: true } }))._avg.trustScore ?? 50
    : 50;

  const allOrders = await prisma.order.findMany({
    where: { organizationId: orgId, deletedAt: null },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-zinc-100">ZioShield Risk Dashboard</h1>

      <div className="mb-6 grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
          <p className="text-xs font-medium text-zinc-500">Avg Trust Score</p>
          <p className="text-xl font-bold text-purple-400">{Math.round(averageScore)}/100</p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
          <p className="text-xs font-medium text-zinc-500">High Risk Orders</p>
          <p className={`text-xl font-bold ${highRiskOrders.length > 0 ? "text-red-400" : "text-zinc-500"}`}>{highRiskOrders.length}</p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
          <p className="text-xs font-medium text-zinc-500">Orders Today</p>
          <p className="text-xl font-bold text-emerald-400">{todayOrders}</p>
        </div>
      </div>

      <h2 className="mb-3 text-lg font-semibold text-zinc-200">Score Breakdown</h2>
      {allOrders.length === 0 ? (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 px-6 py-12 text-center">
          <p className="text-zinc-500">No orders to score yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {allOrders.map((order) => (
            <div key={order.id} className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-zinc-200">{order.buyerName}</p>
                <p className="truncate text-xs text-zinc-500">{order.buyerPhone}</p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <RiskBadge risk={order.riskLevel as "low" | "medium" | "high"} />
                <span className="text-sm font-bold text-zinc-300">{order.trustScore}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
