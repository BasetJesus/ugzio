import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getOrgFromUserId } from "@/lib/billing/enforce";

export const dynamic = "force-dynamic";

export default async function DashboardHome() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/api/auth/signin");

  const orgId = await getOrgFromUserId(session.user.id);
  if (!orgId) redirect("/onboarding");

  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  const totalOrders = await prisma.order.count({
    where: { organizationId: orgId, deletedAt: null },
  });
  const todayOrders = await prisma.order.count({
    where: { organizationId: orgId, deletedAt: null, createdAt: { gte: todayStart } },
  });
  const todayRevenue = await prisma.order.aggregate({
    where: { organizationId: orgId, deletedAt: null, createdAt: { gte: todayStart } },
    _sum: { amount: true },
  });
  const highRiskCount = await prisma.order.count({
    where: { organizationId: orgId, deletedAt: null, riskLevel: "high" },
  });
  const verifiedCount = await prisma.order.count({
    where: { organizationId: orgId, deletedAt: null, verificationStatus: { not: "none" } },
  });
  const verificationRate = totalOrders > 0 ? Math.round((verifiedCount / totalOrders) * 100) : 0;

  const recentOrders = await prisma.order.findMany({
    where: { organizationId: orgId, deletedAt: null },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-zinc-100">Dashboard</h1>

      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Orders Today", value: todayOrders, color: "text-purple-400" },
          { label: "Revenue Today", value: `${Number(todayRevenue._sum.amount ?? 0).toFixed(3)} TND`, color: "text-emerald-400" },
          { label: "High Risk", value: highRiskCount, color: highRiskCount > 0 ? "text-red-400" : "text-zinc-500" },
          { label: "Verification Rate", value: `${verificationRate}%`, color: "text-sky-400" },
        ].map((card) => (
          <div key={card.label} className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
            <p className="mb-1 text-xs font-medium text-zinc-500">{card.label}</p>
            <p className={`text-xl font-bold tracking-tight ${card.color}`}>{card.value}</p>
          </div>
        ))}
      </div>

      <h2 className="mb-3 text-lg font-semibold text-zinc-200">Recent Orders</h2>
      {recentOrders.length === 0 ? (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 px-6 py-12 text-center">
          <p className="text-zinc-500">No orders yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {recentOrders.map((order) => (
            <div key={order.id} className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
              <div>
                <p className="font-medium text-zinc-200">{order.buyerName}</p>
                <p className="text-sm text-zinc-500">{order.buyerPhone}</p>
              </div>
              <div className="text-right">
                <p className="font-medium text-purple-300">{Number(order.amount).toFixed(3)} TND</p>
                <span className={`text-xs font-semibold ${
                  order.riskLevel === "high" ? "text-red-400" : order.riskLevel === "medium" ? "text-orange-400" : "text-green-400"
                }`}>
                  {order.riskLevel.toUpperCase()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
