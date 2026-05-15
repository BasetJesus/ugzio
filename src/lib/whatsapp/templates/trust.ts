import type { MessageTemplate } from "@/types/whatsapp";

interface Ctx {
  buyerName: string;
  orderAmount: number;
}

export function trustSequence(ctx: Ctx): MessageTemplate[] {
  return [
    {
      id: "trust_01",
      text: `Salem ${ctx.buyerName} 👋 Commande ${ctx.orderAmount.toFixed(0)} TND t3awedha. Juste bach ntestiw ligne hedhi.`,
      delayHours: 0,
      tone: "calm",
    },
    {
      id: "trust_02",
      text: `Commande mte3ek tata7ader. Le vendeur yconfirmlha 9bal livraison — mouch mouchkile.`,
      delayHours: 4,
      tone: "calm",
    },
    {
      id: "trust_03",
      text: `📦 Mise à jour livraison: votre colis yjibek bekri. N'notifiwkom 9bal l'livreur.`,
      delayHours: 24,
      tone: "calm",
    },
  ];
}
