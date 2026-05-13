import type { MessageTemplate } from "@/types/whatsapp";

interface Ctx {
  buyerName: string;
  orderAmount: number;
}

export function reminderSequence(ctx: Ctx): MessageTemplate[] {
  return [
    {
      id: "rem_01",
      text: `Rappel ${ctx.buyerName} — delivery planned. Please make sure someone can receive the package.`,
      delayHours: 0,
      tone: "operational",
    },
    {
      id: "rem_02",
      text: "Heads up: delivery between 9h-18h tomorrow. We'll confirm 1 hour before arrival.",
      delayHours: 6,
      tone: "operational",
    },
    {
      id: "rem_03",
      text: "Dernier rappel: confirm your availability for tomorrow's delivery. Reply OUI to confirm.",
      delayHours: 20,
      tone: "soft_urgency",
    },
  ];
}
