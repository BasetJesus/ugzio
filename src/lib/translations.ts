export type Lang = "ar" | "fr" | "en"

type TVal = Record<Lang, string>

export const t = {
  nav: {
    overview:    { ar: 'نظرة عامة',    fr: 'Vue d\'ensemble', en: 'Overview' } as TVal,
    orders:      { ar: 'الطلبات',       fr: 'Commandes',       en: 'Orders' } as TVal,
    confirm:     { ar: 'التأكيد',       fr: 'Confirmation',    en: 'Confirm' } as TVal,
    inbox:       { ar: 'البريد',        fr: 'Messages',        en: 'Inbox' } as TVal,
    settings:    { ar: 'الإعدادات',    fr: 'Paramètres',      en: 'Settings' } as TVal,
  },
  risk: {
    high:        { ar: 'خطر عالٍ',     fr: 'Risque élevé',    en: 'High Risk' } as TVal,
    medium:      { ar: 'خطر متوسط',    fr: 'Risque moyen',    en: 'Medium Risk' } as TVal,
    low:         { ar: 'خطر منخفض',    fr: 'Risque faible',   en: 'Low Risk' } as TVal,
    blocked:     { ar: 'محظور',         fr: 'Bloqué',          en: 'Blocked' } as TVal,
  },
  confirm: {
    question:    { ar: 'هل تؤكد استلام طلبك؟', fr: 'Confirmez-vous votre commande?', en: 'Confirm your order?' } as TVal,
    yes:         { ar: 'نعم، أؤكد',    fr: 'Oui, je confirme', en: 'Yes, confirm' } as TVal,
    reschedule:  { ar: 'وقت آخر',      fr: 'Autre moment',     en: 'Reschedule' } as TVal,
    cancel:      { ar: 'إلغاء',         fr: 'Annuler',          en: 'Cancel' } as TVal,
  },
  actions: {
    verify:      { ar: 'تحقق',          fr: 'Vérifier',         en: 'Verify' } as TVal,
    ship:        { ar: 'شحن',           fr: 'Expédier',         en: 'Ship' } as TVal,
    block:       { ar: 'حظر',           fr: 'Bloquer',          en: 'Block' } as TVal,
    contact:     { ar: 'تواصل',         fr: 'Contacter',        en: 'Contact' } as TVal,
    viewDetails: { ar: 'عرض التفاصيل', fr: 'Voir détails',     en: 'View details' } as TVal,
  },
  status: {
    created:     { ar: 'تم الإنشاء',   fr: 'Créée',            en: 'Created' } as TVal,
    confirmed:   { ar: 'مؤكد',          fr: 'Confirmée',        en: 'Confirmed' } as TVal,
    shipped:     { ar: 'تم الشحن',     fr: 'Expédiée',         en: 'Shipped' } as TVal,
    delivered:   { ar: 'تم التسليم',   fr: 'Livrée',           en: 'Delivered' } as TVal,
    refused:     { ar: 'مرفوض',         fr: 'Refusée',          en: 'Refused' } as TVal,
    cancelled:   { ar: 'ملغى',          fr: 'Annulée',          en: 'Cancelled' } as TVal,
  },
  kpi: {
    ordersToday:    { ar: 'طلبات اليوم',    fr: 'Commandes aujourd\'hui', en: 'Orders Today' } as TVal,
    highRisk:       { ar: 'خطر عالٍ',       fr: 'Risque élevé',           en: 'High Risk' } as TVal,
    revenueSaved:   { ar: 'إيرادات محفوظة', fr: 'Revenus sauvegardés',    en: 'Revenue Saved' } as TVal,
    rtsPrevented:   { ar: 'إرجاع منع',      fr: 'Retours évités',         en: 'RTS Prevented' } as TVal,
  },
  outcome: {
    delivered:   { ar: '😊 تم التسليم',  fr: '😊 Livré',      en: '😊 Delivered' } as TVal,
    refused:     { ar: '😞 مرفوض',       fr: '😞 Refusé',     en: '😞 Refused' } as TVal,
    unreachable: { ar: '📵 لا يرد',      fr: '📵 Injoignable', en: '📵 Unreachable' } as TVal,
  },
}

function lookup(obj: Record<string, unknown>, path: string): Record<Lang, string> | null {
  const parts = path.split(".")
  let current: unknown = obj
  for (const part of parts) {
    if (current && typeof current === "object" && part in current) {
      current = (current as Record<string, unknown>)[part]
    } else {
      return null
    }
  }
  if (current && typeof current === "object" && "ar" in current && "fr" in current && "en" in current) {
    return current as Record<Lang, string>
  }
  return null
}

export function translate(path: string, lang: Lang): string {
  const val = lookup(t as unknown as Record<string, unknown>, path)
  if (val) return val[lang] ?? path
  return path
}

export const LANG_FLAGS: Record<Lang, { flag: string; label: string }> = {
  ar: { flag: "🇹🇳", label: "العربية" },
  fr: { flag: "🇫🇷", label: "Français" },
  en: { flag: "🇬🇧", label: "English" },
}

