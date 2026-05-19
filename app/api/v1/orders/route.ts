import { NextRequest, NextResponse } from "next/server";
import { requireSession, AuthError } from "@/services/auth.service";
import { listOrders, createOrder, checkFreePlanLimit } from "@/services/order.service";
import { createOrderSchema, formatZodErrors } from "@/lib/validation";

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
    const parsed = createOrderSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: formatZodErrors(parsed.error) }, { status: 400 });
    }
    const { buyerName, buyerPhone, product, amount, buyerWilaya } = parsed.data;

    const limitReached = await checkFreePlanLimit(orgId);
    if (limitReached) {
      return NextResponse.json(
        { error: "Limite mensuelle atteinte. Passe à ZioGrow (29 TND/mois) ou ZioPro (79 TND/mois)." },
        { status: 403 },
      );
    }

    const order = await createOrder(orgId, { buyerName, buyerPhone, product, amount, buyerWilaya });
    if (!order) {
      return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
    }

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
