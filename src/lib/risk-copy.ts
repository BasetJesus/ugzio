export type Lang = "ar" | "fr" | "en"

export type RiskReason = "FIRST_TIME_BUYER" | "NO_REPLY_6H" | "HIGH_VALUE_COD" | "SUSPICIOUS_PATTERN"

export interface OrderContext {
  city: string
  hoursSinceContact: number
  amount: number
  matchedCases: number
}

interface Copy {
  title: Record<Lang, string>
  body: Record<Lang, string>
  action: Record<Lang, string>
}

const COPIES: Record<RiskReason, Copy> = {
  FIRST_TIME_BUYER: {
    title: {
      ar: 'مشترٍ لأول مرة — يُنصح بالتحقق قبل الشحن',
      fr: 'Premier achat — vérification recommandée avant envoi',
      en: 'First-time buyer — verify before shipping',
    },
    body: {
      ar: 'سجل غير موجود',
      fr: 'Aucun historique',
      en: 'No order history',
    },
    action: {
      ar: 'تحقق',
      fr: 'Vérifier',
      en: 'Verify',
    },
  },
  NO_REPLY_6H: {
    title: {
      ar: 'لا يوجد رد منذ ٦ ساعات — خطر إعادة الشحنة',
      fr: 'Aucune réponse depuis 6h — risque de retour',
      en: 'No reply in 6h — return risk',
    },
    body: {
      ar: 'آخر رسالة منذ {h} ساعات',
      fr: 'Dernier contact il y a {h}h',
      en: 'Last contact {h}h ago',
    },
    action: {
      ar: 'تواصل',
      fr: 'Contacter',
      en: 'Contact',
    },
  },
  HIGH_VALUE_COD: {
    title: {
      ar: 'طلب بقيمة عالية — يتطلب تأكيداً إلزامياً',
      fr: 'Commande haute valeur — confirmation obligatoire',
      en: 'High-value order — confirmation required',
    },
    body: {
      ar: '{amount} دينار — يتطلب ضماناً',
      fr: '{amount} TND — garantie requise',
      en: '{amount} TND — guarantee needed',
    },
    action: {
      ar: 'تحقق',
      fr: 'Vérifier',
      en: 'Verify',
    },
  },
  SUSPICIOUS_PATTERN: {
    title: {
      ar: 'نمط مشبوه — تحقق قبل الشحن فوراً',
      fr: 'Comportement suspect — vérifiez avant d\'expédier',
      en: 'Suspicious pattern — verify before shipping now',
    },
    body: {
      ar: 'نمط مطابق لـ {n} حالة إعادة شحن سابقة',
      fr: 'Correspond à {n} retours précédents',
      en: 'Matches {n} previous returns',
    },
    action: {
      ar: 'حظر',
      fr: 'Bloquer',
      en: 'Block',
    },
  },
}

function fillTemplate(template: string, context: Partial<Record<string, string | number>>): string {
  return template.replace(/\{(\w+)\}/g, (_, key) => {
    const val = context[key]
    return val != null ? String(val) : `{${key}}`
  })
}

export function getRiskAlertCopy(
  reason: RiskReason,
  context: OrderContext,
  lang: Lang,
): { title: string; body: string; action: string } {
  const copy = COPIES[reason]
  const contextMap: Record<string, string | number> = {
    h: context.hoursSinceContact,
    amount: context.amount,
    n: context.matchedCases,
    city: context.city,
  }
  return {
    title: copy.title[lang],
    body: fillTemplate(copy.body[lang], contextMap),
    action: copy.action[lang],
  }
}
