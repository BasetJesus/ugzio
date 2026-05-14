import type { PsychologyTemplateKey, Locale, WhatsAppDeepLink, PsychologyTemplate } from "@/types/whatsapp"

const TEMPLATES: PsychologyTemplate[] = [
  {
    key: "trust",
    label: "Trust",
    description: "Build confidence — calm, reliable tone",
    messages: {
      darija: "Salam {buyerName} 🫡, commande #{orderId} ({amount} TND) presque prête. Confirme bach n'envoyiw inshallah ✅",
      french: "Bonjour {buyerName} 🫡, commande #{orderId} ({amount} TND) presque prête. Confirmez pour qu'on envoie ✅",
    },
  },
  {
    key: "reminder",
    label: "Reminder",
    description: "Polite nudge — gentle operational push",
    messages: {
      darija: "Salam {buyerName} 🌙, t'senti commande #{orderId}? L'livreur yjih bekri. Confirme wlla n'retardiwch ⏰",
      french: "Bonjour {buyerName} 🌙, pensez à votre commande #{orderId}. Le livreur arrive bientôt. Confirmez pour ne pas retarder ⏰",
    },
  },
  {
    key: "urgency",
    label: "Urgency",
    description: "Time-sensitive — stock or delivery window closing",
    messages: {
      darija: "Salam {buyerName} ⚡, commande #{orderId} ({amount} TND) en danger. Si ma tconfirmich, yretssew. Confirme maintenant! 🔥",
      french: "Bonjour {buyerName} ⚡, commande #{orderId} ({amount} TND) en danger. Sans confirmation, elle sera retournée. Confirmez maintenant! 🔥",
    },
  },
  {
    key: "reassurance",
    label: "Reassurance",
    description: "Friendly check-in — reduce buyer anxiety",
    messages: {
      darija: "Salam {buyerName} 🤝, koulshi mzyan. Commande #{orderId} toujours là. Confirme bach n'waslouha mzyana inchallah 🙏",
      french: "Bonjour {buyerName} 🤝, tout va bien. Commande #{orderId} toujours disponible. Confirmez pour une livraison en douceur 🙏",
    },
  },
]

export function getPsychologyTemplates(): PsychologyTemplate[] {
  return TEMPLATES
}

export function getPsychologyTemplate(key: PsychologyTemplateKey): PsychologyTemplate | undefined {
  return TEMPLATES.find((t) => t.key === key)
}

export function generateWhatsAppLink(
  phone: string,
  templateKey: PsychologyTemplateKey,
  locale: Locale,
  context: { buyerName: string; orderId: string; amount: number }
): WhatsAppDeepLink {
  const template = getPsychologyTemplate(templateKey) ?? TEMPLATES[0]
  const raw = template.messages[locale]

  const message = raw
    .replace(/{buyerName}/g, context.buyerName)
    .replace(/{orderId}/g, context.orderId.slice(0, 8))
    .replace(/{amount}/g, context.amount.toFixed(0))

  const cleaned = phone.replace(/^\+/, "")
  const url = `https://wa.me/${cleaned}?text=${encodeURIComponent(message)}`

  return { url, message, templateKey, locale }
}

export function buildDefaultWhatsAppMessage(
  buyerName: string,
  orderId: string,
  amount: number,
  locale: Locale = "darija"
): string {
  if (locale === "french") {
    return `Bonjour ${buyerName} 👋\n\nCommande #${orderId.slice(0, 8)}\nMontant: ${amount.toFixed(0)} TND\n\nToujours intéressé(e) ? Confirme-moi stp 🙏`
  }
  return `Salam ${buyerName} 🌙\n\nCommande #${orderId.slice(0, 8)}\nMontant: ${amount.toFixed(0)} TND\n\nToujours intéressé(e) ? Confirme-moi stp 🙏`
}
