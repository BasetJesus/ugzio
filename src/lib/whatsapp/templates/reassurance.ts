import type { MessageTemplate } from "@/types/whatsapp";

interface Ctx {
  buyerName: string;
  orderAmount: number;
}

export function reassuranceSequence(ctx: Ctx): MessageTemplate[] {
  return [
    {
      id: "rea_01",
      text: `Salem ${ctx.buyerName} ✓ Your order is secure. No payment needed upfront — you pay when it arrives.`,
      delayHours: 0,
      tone: "reassuring",
    },
    {
      id: "rea_02",
      text: "The seller has confirmed your order. If you have questions, reply here and we'll help.",
      delayHours: 6,
      tone: "reassuring",
    },
    {
      id: "rea_03",
      text: "Delivery is fully tracked. You'll know exactly when to expect your package. Trusted service, guaranteed.",
      delayHours: 24,
      tone: "reassuring",
    },
  ];
}
