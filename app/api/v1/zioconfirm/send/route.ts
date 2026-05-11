import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/db";
import { getOrgFromUserId } from "@/lib/billing/enforce";
import { sendButtons } from "@/lib/whatsapp/client";

const CONFIRM_MESSAGE = "Commande mte3ek wajda 😍\nMazelt habb tconfirmi?";
const CONFIRM_BUTTONS = [
  { id: "confirm", title: "✅ Ayi Confirmi" },
  { id: "cancel", title: "❌ Batel" },
  { id: "reschedule", title: "🔄 Wa9t akher" },
];

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const orgId = await getOrgFromUserId(session.user.id);
  if (!orgId) {
    return NextResponse.json({ error: "No organization" }, { status: 400 });
  }

  const { orderId } = await request.json();
  if (!orderId) {
    return NextResponse.json({ error: "orderId required" }, { status: 400 });
  }

  const order = await prisma.order.findFirst({
    where: { id: orderId, organizationId: orgId, deletedAt: null },
  });
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  await prisma.order.update({
    where: { id: orderId },
    data: { status: "PRE_SHIPPING_CONFIRM_SENT" },
  });

  await sendButtons(order.buyerPhone, CONFIRM_MESSAGE, CONFIRM_BUTTONS);

  const existing = await prisma.activationEvent.findFirst({
    where: { organizationId: orgId, eventType: "FIRST_VERIFICATION_SENT" },
  });
  if (!existing) {
    await prisma.activationEvent.create({
      data: { organizationId: orgId, eventType: "FIRST_VERIFICATION_SENT" },
    });
  }

  return NextResponse.json({ success: true });
}
