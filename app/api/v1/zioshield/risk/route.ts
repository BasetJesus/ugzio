import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/db";
import { getOrgFromUserId } from "@/lib/billing/enforce";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const orgId = await getOrgFromUserId(session.user.id);
  if (!orgId) {
    return NextResponse.json({ error: "No organization" }, { status: 400 });
  }

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
