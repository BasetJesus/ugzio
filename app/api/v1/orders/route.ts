import { NextRequest, NextResponse } from "next/server";
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
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { orgId } = await requireSession();

    const body = await request.json();
    const { buyerName, buyerPhone, product, amount, buyerWilaya } = body;

    if (!buyerName || !buyerPhone || amount == null) {
      return NextResponse.json(
        { error: "buyerName, buyerPhone, and amount are required" },
        { status: 400 },
      );
    }

    const limitReached = await checkFreePlanLimit(orgId);
    if (limitReached) {
      return NextResponse.json(
        { error: "Limite mensuelle atteinte. Passe à Essentiel (49 TND/mois) ou Croissance (139 TND/mois)." },
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
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
