import type { MessageTemplate } from "@/types/whatsapp";

interface Ctx {
  buyerName: string;
  orderAmount: number;
}

export function urgencySequence(ctx: Ctx): MessageTemplate[] {
  return [
    {
      id: "urg_01",
      text: `${ctx.buyerName}, commande mte3ek (${ctx.orderAmount.toFixed(0)} TND) réservée mais barcha y7ebbo 7adha. Qolli mazelt habb tkhalihelek bach n'heyyiw l'expédition.`,
      delayHours: 0,
      tone: "soft_urgency",
    },
    {
      id: "urg_02",
      text: "Réservation mte3ek mazelha. Confirmi avant 24h bach t7afedh 3ala l'créneau mte3ek.",
      delayHours: 8,
      tone: "soft_urgency",
    },
    {
      id: "urg_03",
      text: "Réservation tfout lakhor nhar hedha. Confirmi tawa wla tretardiwch.",
      delayHours: 20,
      tone: "soft_urgency",
    },
  ];
}
