import { prisma } from "@/lib/db";
import { sendWhatsApp } from "@/lib/events/queues";

const CONFIRM_MESSAGE = "Commande mte3ek wajda 😍\nMazelt habb tconfirmi?";
const CONFIRM_BUTTONS = [
  { id: "confirm", title: "✅ Ayi Confirmi" },
  { id: "cancel", title: "❌ Batel" },
  { id: "reschedule", title: "🔄 Wa9t akher" },
];

async function ensureActivationEvent(orgId: string, eventType: string) {
  try {
    const existing = await prisma.activationEvent.findFirst({
      where: { organizationId: orgId, eventType },
    });
    if (!existing) {
      await prisma.activationEvent.create({
        data: { organizationId: orgId, eventType },
      });
    }
  } catch (e) {
    console.error("[protect.service] ensureActivationEvent failed:", e);
  }
}

export async function sendVerification(orgId: string, orderId: string) {
  try {
    const order = await prisma.order.findFirst({
      where: { id: orderId, organizationId: orgId, deletedAt: null },
    });
    if (!order) return { success: false };

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
  } catch (e) {
    console.error("[protect.service] sendVerification failed:", e);
    return { success: false };
  }
}
