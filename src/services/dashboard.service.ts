import { prisma } from "@/lib/db";
import { todayStart, percentage } from "@/lib/utils";
import { getNeedsConfirmCount, getRevenueAtRisk, getHighRiskCreatedOrders } from "@/services/risk.service";
import type { Order } from "@prisma/client";

type OrderFields = Pick<Order, "id" | "buyerName" | "buyerPhone" | "amount" | "riskLevel" | "trustScore" | "status" | "product" | "organizationId" | "createdAt">;

export interface DashboardData {
  ordersToday: number;
  needsConfirm: number;
  pendingConfirm: number;
  inboxCount: number;
  ugcCount: number;
  totalOrders: number;
  rtsPrevented: number;
  revenueSavedAmount: number;
  deliveredRate: number;
  riskAlerts: OrderFields[];
  recentOrders: OrderFields[];
  chartData: Array<{ day: string; rate: number }>;
}

export async function getDashboardData(orgId: string): Promise<DashboardData> {
  const dayStart = todayStart();

  const [
    ordersTodayVal,
    needsConfirmVal,
    pendingConfirm,
    inboxCount,
    ugcCount,
    totalOrdersVal,
    refusedOrders,
    revenueSavedVal,
    deliveredOrders,
    highRiskAlerts,
    recentOrders,
  ] = await Promise.all([
    prisma.order.count({ where: { organizationId: orgId, deletedAt: null, createdAt: { gte: dayStart } } }),
    getNeedsConfirmCount(orgId),
    prisma.order.count({ where: { organizationId: orgId, deletedAt: null, status: "PRE_SHIPPING_CONFIRM_SENT" } }),
    prisma.conversation.count({ where: { organizationId: orgId } }),
    prisma.ugcItem.count({ where: { order: { organizationId: orgId }, status: "received" } }),
    prisma.order.count({ where: { organizationId: orgId, deletedAt: null } }),
    prisma.order.count({ where: { organizationId: orgId, deletedAt: null, status: "REFUSED" } }),
    getRevenueAtRisk(orgId),
    prisma.order.count({ where: { organizationId: orgId, deletedAt: null, status: "DELIVERED" } }),
    getHighRiskCreatedOrders(orgId, 5),
    prisma.order.findMany({
      where: { organizationId: orgId, deletedAt: null },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  const rtsRate = totalOrdersVal > 0 ? percentage(refusedOrders, totalOrdersVal) : 0;
  const deliveredRateCalc = totalOrdersVal > 0 ? percentage(deliveredOrders, totalOrdersVal) : 0;
  const revenueSavedAmount = revenueSavedVal;

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

  return {
    ordersToday: ordersTodayVal,
    needsConfirm: needsConfirmVal,
    pendingConfirm,
    inboxCount,
    ugcCount,
    totalOrders: totalOrdersVal,
    rtsPrevented: 100 - rtsRate,
    revenueSavedAmount,
    deliveredRate: deliveredRateCalc,
    riskAlerts: highRiskAlerts,
    recentOrders: recentOrders.map(o => ({
      id: o.id, buyerName: o.buyerName, buyerPhone: o.buyerPhone,
      amount: Number(o.amount), riskLevel: o.riskLevel, trustScore: o.trustScore,
      status: o.status, product: o.product, organizationId: o.organizationId, createdAt: o.createdAt,
    })),
    chartData,
  };
}
