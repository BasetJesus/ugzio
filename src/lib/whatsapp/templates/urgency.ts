import type { MessageTemplate } from "@/types/whatsapp";

interface Ctx {
  buyerName: string;
  orderAmount: number;
}

export function urgencySequence(ctx: Ctx): MessageTemplate[] {
  return [
    {
      id: "urg_01",
      text: `${ctx.buyerName}, your order (${ctx.orderAmount.toFixed(0)} TND) is reserved but in high demand. Let us know if you still want it so we can prepare shipping.`,
      delayHours: 0,
      tone: "soft_urgency",
    },
    {
      id: "urg_02",
      text: "We're holding your delivery slot. Confirm within 24 hours to secure your window.",
      delayHours: 8,
      tone: "soft_urgency",
    },
    {
      id: "urg_03",
      text: "Reservation expires at the end of today. Confirm now to avoid any delays.",
      delayHours: 20,
      tone: "soft_urgency",
    },
  ];
}
