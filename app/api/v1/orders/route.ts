import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const orgId = searchParams.get("orgId");
  if (!orgId) return NextResponse.json({ error: "orgId required" }, { status: 400 });

  const orders = await prisma.order.findMany({
    where: { organizationId: orgId, deletedAt: null },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return NextResponse.json(
    orders.map((o) => ({
      id: o.id,
      buyerName: o.buyerName,
      buyerPhone: o.buyerPhone,
      amount: Number(o.amount),
      riskLevel: o.riskLevel,
      trustScore: o.trustScore,
      status: o.status,
      verificationStatus: o.verificationStatus,
      createdAt: o.createdAt.toISOString(),
    })),
  );
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { orgId, buyerName, buyerPhone, amount } = body;
  if (!orgId || !buyerName || !buyerPhone || amount == null) {
    return NextResponse.json({ error: "orgId, buyerName, buyerPhone, amount required" }, { status: 400 });
  }

  const order = await prisma.order.create({
    data: {
      organizationId: orgId,
      buyerName,
      buyerPhone,
      amount: Number(amount),
    },
  });

  return NextResponse.json(order, { status: 201 });
}
