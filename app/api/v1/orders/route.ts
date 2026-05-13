import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireSession, AuthError } from "@/services/auth.service";
import { listOrders, createOrder, checkFreePlanLimit } from "@/services/order.service";

export async function GET() {
  try {
    const { orgId } = await requireSession();
    const orders = await listOrders(orgId);
    return NextResponse.json(orders);
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: e.message === "Unauthorized" ? 401 : 400 });
    }
    throw e;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { orgId } = await requireSession();

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

    const limitReached = await checkFreePlanLimit(orgId, org.subscriptionStatus, org.maxOrdersPerMonth);
    if (limitReached) {
      return NextResponse.json(
        { error: "Limite mensuelle atteinte. Passe à Croissance (129 TND/mois)." },
        { status: 403 },
      );
    }

    const order = await createOrder(orgId, { buyerName, buyerPhone, product, amount, buyerWilaya });

    return NextResponse.json({
      id: order.id,
      status: order.status,
      createdAt: order.createdAt.toISOString(),
    }, { status: 201 });
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: e.message === "Unauthorized" ? 401 : 400 });
    }
    throw e;
  }
}
