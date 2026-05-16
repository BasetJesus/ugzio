import { prisma } from "@/lib/db";
import { scheduleMessage, sendWhatsApp } from "@/lib/events/queues";
import { alertSeller, cancelAlert } from "@/lib/alerts/seller";
import { recordJourneyEvent } from "@/services/buyer-journey.service";
import { JOURNEY_EVENT_TYPES } from "@/types/journey";
import { renderTemplate } from "@/services/ugc-template.service";
import { METADATA_BASE_URL } from "@/lib/constants";
import { transitionOrderStatus } from "@/services/order.service";

const CONFIRM_WINDOW_H = 20;

function ms(hours: number) {
  return hours * 60 * 60 * 1000;
}

export async function schedulePsychologicalSequence(orderId: string) {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) return;

  const now = Date.now();

  const events = [
    { type: "ANTICIPATION" as const, delayMs: ms(2) },
    { type: "SOCIAL_PROOF" as const, delayMs: ms(12) },
    { type: "VISUAL_OWNERSHIP" as const, delayMs: ms(24) },
  ];

  for (const event of events) {
    const scheduledFor = new Date(now + event.delayMs);

    await prisma.messageTimelineEntry.create({
      data: {
        orderId,
        eventType: event.type,
        scheduledFor,
        status: "scheduled",
      },
    });

    await scheduleMessage(event.type, { orderId }, event.delayMs);
  }
}

export async function schedulePreDeliveryConfirm(orderId: string, estimatedDeliveryDate: Date) {
  const deliveryMs = estimatedDeliveryDate.getTime();
  const confirmTime = new Date(deliveryMs - ms(CONFIRM_WINDOW_H));

  await prisma.messageTimelineEntry.create({
    data: {
      orderId,
      eventType: "pre_delivery_confirm",
      scheduledFor: confirmTime,
      status: "scheduled",
    },
  });

  const delayMs = Math.max(0, confirmTime.getTime() - Date.now());
  await scheduleMessage("PRE_DELIVERY_CONFIRM", { orderId }, delayMs);
}

export async function scheduleD3UgcAsk(orderId: string, templateId?: string) {
  const now = Date.now();
  const d3 = new Date(now + ms(72));

  await prisma.messageTimelineEntry.create({
    data: {
      orderId,
      eventType: "d3_ugc_ask",
      scheduledFor: d3,
      status: "scheduled",
    },
  });

  const payload: Record<string, unknown> = { orderId };
  if (templateId) payload.templateId = templateId;
  await scheduleMessage("D3_UGC_ASK", payload, ms(72));
}

// ─── Message content ───

const BASE = METADATA_BASE_URL

function orderLink(orderId: string): string {
  return `${BASE}/order/${orderId}`
}

const MESSAGES: Record<string, (buyerName?: string, orderId?: string) => string> = {
  ANTICIPATION: (name, id) =>
    `Taw ki touslek taw t7ebha barcha 😭✨\nSuis ta commande ici: ${id ? orderLink(id) : ""}`,
  SOCIAL_PROOF: (_, id) =>
    `👀 Hedhi men akther les commandes eli talbinha tawa\n${id ? orderLink(id) : ""}`,
  VISUAL_OWNERSHIP: (name, id) =>
    `El couleur hedhi barcha habbouha ✨\nTaw tasta3melha w tferrah ${name ?? "fama"}\n${id ? orderLink(id) : ""}`,
  D3_UGC_ASK: () =>
    "T'as eu le temps d'essayer? 📦\nEnvoie-moi une photo et je te crédite 15 TND sur ta prochaine commande 🎁",
};

const CONFIRM_MESSAGE = "Commande mte3ek wajda 😍\nMazelt habb tconfirmi?";
const CONFIRM_BUTTONS = [
  { id: "confirm", title: "✅ Ayi Confirmi" },
  { id: "cancel", title: "❌ Batel" },
  { id: "reschedule", title: "🔄 Wa9t akher" },
];

// ─── Execution ───

export async function executeTimelineMessage(eventType: string, orderId: string, payload?: Record<string, unknown>) {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) return;

  if (eventType === "PRE_DELIVERY_CONFIRM") {
    await prisma.order.update({
      where: { id: orderId },
      data: { status: "PRE_SHIPPING_CONFIRM_SENT" },
    });

    const confirmWithLink = `${CONFIRM_MESSAGE}\n\n${orderLink(order.id)}`;
    await sendWhatsApp({
      orgId: order.organizationId,
      to: order.buyerPhone,
      type: "interactive",
      content: { body: confirmWithLink, buttons: CONFIRM_BUTTONS },
    });

    await prisma.messageTimelineEntry.updateMany({
      where: { orderId, eventType: "pre_delivery_confirm" },
      data: { sentAt: new Date(), status: "sent" },
    });
    return;
  }

  if (eventType === "D3_UGC_ASK") {
    await prisma.order.update({
      where: { id: orderId },
      data: { status: "UGC_REQUESTED" },
    });
  }

  let text = MESSAGES[eventType]?.(order.buyerName, order.id);

  if (eventType === "D3_UGC_ASK") {
    const templateId = payload?.templateId as string | undefined;
    let template = templateId
      ? await prisma.ugcRequestTemplate.findFirst({
          where: { id: templateId, organizationId: order.organizationId },
        })
      : null;

    if (!template) {
      template = await prisma.ugcRequestTemplate.findFirst({
        where: { organizationId: order.organizationId, isActive: true },
        orderBy: { createdAt: "asc" },
      });
    }

    if (template) {
      text = renderTemplate(template.messageBody, {
        buyerName: order.buyerName,
        product: order.product ?? undefined,
        orderAmount: String(order.amount),
        incentive: template.incentive || undefined,
      });
    }
  }

  if (!text) return;

  await sendWhatsApp({
    orgId: order.organizationId,
    to: order.buyerPhone,
    type: "text",
    content: { body: text },
  });

  await prisma.messageTimelineEntry.updateMany({
    where: { orderId, eventType },
    data: { sentAt: new Date(), status: "sent" },
  });
}

// ─── Button reply handling ───

export async function handleConfirmButton(orderId: string, buttonId: string) {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) return;

  const reply = async (text: string) => {
    await sendWhatsApp({
      orgId: order.organizationId,
      to: order.buyerPhone,
      type: "text",
      content: { body: text },
    });
  };

  switch (buttonId) {
    case "confirm":
      await transitionOrderStatus(order.organizationId, orderId, "BUYER_CONFIRMED");
      await reply("Merci! Ta commande est confirmée ✅");
      await recordJourneyEvent(order.organizationId, orderId, JOURNEY_EVENT_TYPES.BUYER_CONFIRMED, {
        channel: "whatsapp",
        source: "button_reply",
      });
      break;

    case "cancel":
      await transitionOrderStatus(order.organizationId, orderId, "INTELLIGENT_CANCEL");
      await reply("Pas de problème. Commande annulée.");
      await alertSeller(order.organizationId, cancelAlert(order.buyerName, order.product ?? "produit"));
      await recordJourneyEvent(order.organizationId, orderId, JOURNEY_EVENT_TYPES.ORDER_CANCELLED, {
        channel: "whatsapp",
        source: "button_reply",
      });
      break;

    case "reschedule":
      await transitionOrderStatus(order.organizationId, orderId, "PENDING_RESCHEDULE");
      await reply("Pas de souci! On te renvoie un message plus tard.");
      await recordJourneyEvent(order.organizationId, orderId, JOURNEY_EVENT_TYPES.BUYER_REQUESTED_DELAY, {
        channel: "whatsapp",
        source: "button_reply",
      });
      break;
  }
}
