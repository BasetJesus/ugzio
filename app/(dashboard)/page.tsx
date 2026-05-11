import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getOrgFromUserId } from "@/lib/billing/enforce";
import Link from "next/link";
import KPISection from "@/components/dashboard/KPISection";
import RiskAlerts from "@/components/dashboard/RiskAlerts";
import OrdersTable from "@/components/dashboard/OrdersTable";
import RTSChart from "@/components/dashboard/RTSChart";

export const dynamic = "force-dynamic";

export default async function DashboardHome() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/api/auth/signin");

  const orgId = await getOrgFromUserId(session.user.id);
  if (!orgId) redirect("/onboarding");

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const ordersToday = await prisma.order.count({
    where: { organizationId: orgId, deletedAt: null, createdAt: { gte: todayStart } },
  });

  const highRiskCount = await prisma.order.count({
    where: { organizationId: orgId, deletedAt: null, riskLevel: "high", status: { notIn: ["REFUSED", "INTELLIGENT_CANCEL", "DELIVERED", "UGC_RECEIVED"] } },
  });

  const totalOrders = await prisma.order.count({ where: { organizationId: orgId, deletedAt: null } });
  const refusedOrders = await prisma.order.count({ where: { organizationId: orgId, deletedAt: null, status: "REFUSED" } });
  const rtsPrevented = totalOrders > 0 ? Math.round(((totalOrders - refusedOrders) / totalOrders) * 100) : 0;

  const revenueSaved = await prisma.order.aggregate({
    where: { organizationId: orgId, deletedAt: null, riskLevel: "high" },
    _sum: { amount: true },
  });
  const revenueSavedAmount = Math.round(Number(revenueSaved._sum.amount ?? 0) * 0.3);

  const riskAlerts = await prisma.order.findMany({
    where: { organizationId: orgId, deletedAt: null, riskLevel: "high", status: "CREATED" },
    orderBy: { trustScore: "asc" },
    take: 5,
  });

  const recentOrders = await prisma.order.findMany({
    where: { organizationId: orgId, deletedAt: null },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  const days = 7;
  const chartData: { day: string; rate: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const dayStart = new Date(now);
    dayStart.setDate(now.getDate() - i);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayStart.getDate() + 1);

    const dayOrders = await prisma.order.count({
      where: { organizationId: orgId, deletedAt: null, createdAt: { gte: dayStart, lt: dayEnd } },
    });
    const dayRts = await prisma.order.count({
      where: { organizationId: orgId, deletedAt: null, status: "REFUSED", createdAt: { gte: dayStart, lt: dayEnd } },
    });
    const rate = dayOrders > 0 ? Math.round((dayRts / dayOrders) * 100) : 0;
    chartData.push({ day: dayStart.toLocaleDateString("en-US", { weekday: "short" }), rate });
  }

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">UGZIO Operations</h1>
          <p className="text-sm text-zinc-400">Monitor trust, orders, and RTS risk.</p>
        </div>
        <Link
          href="/orders/new"
          className="rounded-xl bg-purple-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-purple-500"
        >
          + New Order
        </Link>
      </div>

      <KPISection
        ordersToday={ordersToday}
        highRiskCount={highRiskCount}
        rtsPrevented={rtsPrevented}
        revenueSaved={revenueSavedAmount}
      />

      <RiskAlerts orders={riskAlerts.map(o => ({
        ...o,
        amount: Number(o.amount),
      }))} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <OrdersTable orders={recentOrders.map(o => ({
          ...o,
          amount: Number(o.amount),
        }))} />
        <RTSChart data={chartData} />
      </div>
    </div>
  );
}
