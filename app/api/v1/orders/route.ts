import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/db";
import { getOrgFromUserId } from "@/lib/billing/enforce";
import { schedulePsychologicalSequence, schedulePreDeliveryConfirm } from "@/lib/zioconfirm/service";
import { computeAndAlert } from "@/lib/zioshield/scoring";
import { emitCritical } from "@/lib/events/queues";

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
    take: 50,
  });

  return NextResponse.json(
    orders.map((o) => ({
      id: o.id,
      buyerName: o.buyerName,
      buyerPhone: o.buyerPhone,
      product: o.product,
      amount: Number(o.amount),
      riskLevel: o.riskLevel,
      trustScore: o.trustScore,
      status: o.status,
      createdAt: o.createdAt.toISOString(),
    })),
  );
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const orgId = await getOrgFromUserId(session.user.id);
  if (!orgId) {
    return NextResponse.json({ error: "No organization" }, { status: 400 });
  }

  const org = await prisma.organization.findUnique({ where: { id: orgId } });
  if (!org) {
    return NextResponse.json({ error: "Organization not found" }, { status: 404 });
  }

  const body = await request.json();
  const { buyerName, buyerPhone, product, amount, buyerWilaya } = body;

  if (!buyerName || !buyerPhone || amount == null) {
    return NextResponse.json(
      { error: "buyerName, buyerPhone, and amount are required" },
      { status: 400 },
    );
  }

  if (org.subscriptionStatus === "free") {
    const monthlyCount = await prisma.order.count({
      where: {
        organizationId: orgId,
        createdAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      },
    });
    if (monthlyCount >= org.maxOrdersPerMonth) {
      return NextResponse.json(
        { error: "Limite mensuelle atteinte. Passe à Croissance (129 TND/mois)." },
        { status: 403 },
      );
    }
  }

  const order = await prisma.order.create({
    data: {
      organizationId: orgId,
      buyerName,
      buyerPhone,
      product: product ?? null,
      buyerWilaya: buyerWilaya ?? null,
      amount: Number(amount),
      status: "CREATED",
    },
  });

  await computeAndAlert(buyerPhone, orgId, buyerName, order.id);

  await schedulePsychologicalSequence(order.id);

  const estimatedDelivery = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
  await schedulePreDeliveryConfirm(order.id, estimatedDelivery);

  await emitCritical("ORDER_CREATED", { orderId: order.id, orgId });

  const existingEvent = await prisma.activationEvent.findFirst({
    where: { organizationId: orgId, eventType: "FIRST_ORDER_CREATED" },
  });
  if (!existingEvent) {
    await prisma.activationEvent.create({
      data: { organizationId: orgId, eventType: "FIRST_ORDER_CREATED" },
    });
  }

  return NextResponse.json({
    id: order.id,
    status: order.status,
    createdAt: order.createdAt.toISOString(),
  }, { status: 201 });
}
