import type { MessageTemplate } from "@/types/whatsapp";

interface Ctx {
  buyerName: string;
  orderAmount: number;
}

export function trustSequence(ctx: Ctx): MessageTemplate[] {
  return [
    {
      id: "trust_01",
      text: `Salem ${ctx.buyerName} 👋 Order ${ctx.orderAmount.toFixed(0)} TND is confirmed. Just making sure this number works to reach you.`,
      delayHours: 0,
      tone: "calm",
    },
    {
      id: "trust_02",
      text: `Your order is being prepared. The seller will confirm everything before delivery — no rush.`,
      delayHours: 4,
      tone: "calm",
    },
    {
      id: "trust_03",
      text: `📦 Delivery update: your package will arrive soon. We'll let you know before the driver comes.`,
      delayHours: 24,
      tone: "calm",
    },
  ];
}
