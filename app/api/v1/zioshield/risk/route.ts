import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const orgId = searchParams.get("orgId");
  if (!orgId) return NextResponse.json({ error: "orgId required" }, { status: 400 });

  const orders = await prisma.order.findMany({
    where: { organizationId: orgId, deletedAt: null },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const todayOrders = orders.filter((o) => o.createdAt >= todayStart);
  const highRiskOrders = orders.filter((o) => o.riskLevel === "high");

  return NextResponse.json({
    totalOrders: orders.length,
    todayOrders: todayOrders.length,
    todayRevenue: todayOrders.reduce((s, o) => s + Number(o.amount), 0),
    highRiskCount: highRiskOrders.length,
    verificationRate: orders.length > 0
      ? Math.round((orders.filter((o) => o.verificationStatus !== "none").length / orders.length) * 100)
      : 0,
    recentOrders: orders.slice(0, 10).map((o) => ({
      id: o.id,
      buyerName: o.buyerName,
      buyerPhone: o.buyerPhone,
      amount: Number(o.amount),
      riskLevel: o.riskLevel,
      trustScore: o.trustScore,
      verificationStatus: o.verificationStatus,
      status: o.status,
      createdAt: o.createdAt.toISOString(),
    })),
  });
}
