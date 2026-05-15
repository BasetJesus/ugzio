import { prisma } from "@/lib/db";
import { sendWhatsApp } from "@/lib/events/queues";

const CONFIRM_MESSAGE = "Commande mte3ek wajda 😍\nMazelt habb tconfirmi?";
const CONFIRM_BUTTONS = [
  { id: "confirm", title: "✅ Ayi Confirmi" },
  { id: "cancel", title: "❌ Batel" },
  { id: "reschedule", title: "🔄 Wa9t akher" },
];

async function ensureActivationEvent(orgId: string, eventType: string) {
  const existing = await prisma.activationEvent.findFirst({
    where: { organizationId: orgId, eventType },
  });
  if (!existing) {
    await prisma.activationEvent.create({
      data: { organizationId: orgId, eventType },
    });
  }
}

export async function sendVerification(orgId: string, orderId: string) {
  const order = await prisma.order.findFirst({
    where: { id: orderId, organizationId: orgId, deletedAt: null },
  });
  if (!order) return null;

  await prisma.order.update({
    where: { id: orderId },
    data: { status: "PRE_SHIPPING_CONFIRM_SENT" },
  });

  await sendWhatsApp({
    orgId,
    to: order.buyerPhone,
    type: "interactive",
    content: { body: CONFIRM_MESSAGE, buttons: CONFIRM_BUTTONS },
  });

  await ensureActivationEvent(orgId, "FIRST_VERIFICATION_SENT");

  return { success: true };
}
