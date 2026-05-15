import type { MessageTemplate } from "@/types/whatsapp";

interface Ctx {
  buyerName: string;
  orderAmount: number;
}

export function reassuranceSequence(ctx: Ctx): MessageTemplate[] {
  return [
    {
      id: "rea_01",
      text: `Salem ${ctx.buyerName} ✓ Commande sécurisée. Mouch payement mousbak — tkhales ki touslek.`,
      delayHours: 0,
      tone: "reassuring",
    },
    {
      id: "rea_02",
      text: "Le vendeur confirmi commande mte3ek. 3andek question? Radd houne w n'jewbek.",
      delayHours: 6,
      tone: "reassuring",
    },
    {
      id: "rea_03",
      text: "Livraison suivie. Twa9a3 f sa3tha — service fiable, garanti.",
      delayHours: 24,
      tone: "reassuring",
    },
  ];
}
