import type { MessageTemplate } from "@/types/whatsapp";

interface Ctx {
  buyerName: string;
  orderAmount: number;
}

export function reminderSequence(ctx: Ctx): MessageTemplate[] {
  return [
    {
      id: "rem_01",
      text: `Rappel ${ctx.buyerName} 🌙 — livraison programmée. Tawa9ed bli yjik l'livreur, khali wehed yest9bellek.`,
      delayHours: 0,
      tone: "operational",
    },
    {
      id: "rem_02",
      text: "Rappel: livraison 9h-18h ghodwa. N'confirmiw 1h 9bal l'arrivée.",
      delayHours: 6,
      tone: "operational",
    },
    {
      id: "rem_03",
      text: "Dernier rappel: confirmi disponibilité mte3ek l'livraison mte3 ghodwa. Rad OUI bach tconfirmi.",
      delayHours: 20,
      tone: "soft_urgency",
    },
  ];
}
