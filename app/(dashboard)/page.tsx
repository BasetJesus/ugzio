import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getOrgFromUserId } from "@/lib/billing/enforce";
import DashboardContent from "@/components/dashboard/DashboardContent";

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
  const needsConfirm = await prisma.order.count({
    where: { organizationId: orgId, deletedAt: null, status: "CREATED", riskLevel: "high" },
  });
  const pendingConfirm = await prisma.order.count({
    where: { organizationId: orgId, deletedAt: null, status: "PRE_SHIPPING_CONFIRM_SENT" },
  });

  const inboxCount = await prisma.conversation.count({
    where: { organizationId: orgId },
  });
  const ugcCount = await prisma.ugcItem.count({
    where: { order: { organizationId: orgId }, status: "received" },
  });

  const totalOrders = await prisma.order.count({ where: { organizationId: orgId, deletedAt: null } });
  const refusedOrders = await prisma.order.count({ where: { organizationId: orgId, deletedAt: null, status: "REFUSED" } });
  const rtsRate = totalOrders > 0 ? Math.round((refusedOrders / totalOrders) * 100) : 0;
  const rtsPrevented = 100 - rtsRate;

  const revenueSaved = await prisma.order.aggregate({
    where: { organizationId: orgId, deletedAt: null, riskLevel: "high" },
    _sum: { amount: true },
  });
  const revenueSavedAmount = Math.round(Number(revenueSaved._sum.amount ?? 0) * 0.3);

  const deliveredOrders = await prisma.order.count({
    where: { organizationId: orgId, deletedAt: null, status: "DELIVERED" },
  });
  const deliveredRate = totalOrders > 0 ? Math.round((deliveredOrders / totalOrders) * 100) : 0;

  const riskAlerts = await prisma.order.findMany({
    where: { organizationId: orgId, deletedAt: null, riskLevel: "high", status: "CREATED" },
    orderBy: { trustScore: "asc" },
    take: 5,
  });

  const chartData = (await prisma.$queryRawUnsafe<
    { day: string; total: bigint; refused: bigint }[]
  >(
    `SELECT
      TO_CHAR(d.date, 'Dy') AS day,
      COALESCE(SUM(CASE WHEN o.id IS NOT NULL THEN 1 ELSE 0 END), 0) AS total,
      COALESCE(SUM(CASE WHEN o.status = 'REFUSED' THEN 1 ELSE 0 END), 0) AS refused
    FROM (
      SELECT DATE(now() - INTERVAL '6 days' + INTERVAL '1 day' * g) AS date
      FROM generate_series(0, 6) AS g
    ) d
    LEFT JOIN "Order" o
      ON o."organizationId" = $1
      AND o."deletedAt" IS NULL
      AND DATE(o."createdAt") = d.date
    GROUP BY d.date
    ORDER BY d.date ASC`,
    orgId,
  )).map((r) => {
    const total = Number(r.total);
    const refused = Number(r.refused);
    return {
      day: r.day,
      rate: total > 0 ? Math.round((refused / total) * 100) : 0,
    };
  });

  const recentOrders = await prisma.order.findMany({
    where: { organizationId: orgId, deletedAt: null },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  return (
    <DashboardContent
      ordersToday={ordersToday}
      needsConfirm={needsConfirm}
      pendingConfirm={pendingConfirm}
      inboxCount={inboxCount}
      ugcCount={ugcCount}
      totalOrders={totalOrders}
      rtsPrevented={rtsPrevented}
      revenueSavedAmount={revenueSavedAmount}
      deliveredRate={deliveredRate}
      riskAlerts={riskAlerts.map(o => ({ ...o, amount: Number(o.amount) }))}
      recentOrders={recentOrders.map(o => ({ ...o, amount: Number(o.amount), createdAt: o.createdAt }))}
      chartData={chartData}
    />
  );
}
