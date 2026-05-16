export const COPY = {
  // ── Empty States ──
  "empty.orders.title": "Aucune commande",
  "empty.orders.desc": "Importe ta première commande pour commencer.",
  "empty.ugc.title": "Aucun UGC pour l'instant",
  "empty.ugc.desc": "Les demandes apparaîtront ici quand les acheteurs répondront.",

  // ── CTAs ──
  "cta.secure": "Sécuriser",
  "cta.recontact": "Re-contacter",
  "cta.approve": "Approuver",
  "cta.reject": "Rejeter",
  "cta.remove": "Retirer",
  "common.cancel": "Annuler",

  // ── Confirm Dialogs ──
  "confirm.delete.title": "Confirmer la suppression",
  "confirm.delete.desc": "Cette action est irréversible.",

  // ── Labels ──
  "label.failure": "échec",
  "label.trust-score": "Confiance",
  "label.trust": "Confiance",
  "label.paiement": "Paiement",
  "label.livraison": "Livraison",
  "label.if-do-nothing": "Si tu ne fais rien",
  "label.estimated-loss": "Perte estimée",
  "label.confirm-empty": "Tout est sous contrôle",
  "label.confirm-empty-desc": "Aucune commande en risque actuellement.",
  "label.all": "Toutes",
  "label.pending": "En attente",
  "label.contacted": "Contacté",
  "label.delivery-pending": "Livraison en attente",
  "label.produit-inconnu": "produit inconnu",
  "label.filter-all": "Tout",
  "label.filter-received": "Reçus",
  "label.filter-approved": "Approuvés",
  "label.filter-rejected": "Rejetés",
  "label.ugc-status-pending": "en attente",
  "label.ugc-status-approved": "approuvé",
  "label.ugc-status-rejected": "rejeté",
  "label.ugc-total": "Total UGC",
  "label.ugc-approved": "Approuvé",
  "label.ugc-approval-rate": "Taux d'approbation",
  "label.ugc-download": "Télécharger ↗",
  "label.outcome-delivered": "✅ Livré",
  "label.outcome-refused": "🗑️ Refusé",

  // ── Toast Messages (risk-contextual with amounts) ──
  "toast.confirm": "{amount} TND sécurisés 🛡️",
  "toast.retry": "{amount} TND re-contacté — réponse en attente",
  "toast.cancel": "{amount} TND — perte évitée 🛡️",
  "toast.delivered": "✅ {amount} TND livré",
  "toast.refused": "🗑️ {amount} TND refusé",
} as const

export type CopyKey = keyof typeof COPY

const INTERPOLATE_RE = /\{(\w+)\}/g

export function copy(key: CopyKey, params?: Record<string, string | number>): string {
  const text: string = COPY[key] ?? key
  if (!params) return text
  return text.replace(INTERPOLATE_RE, (_, name: string) => {
    const val = params[name]
    return val !== undefined ? String(val) : `{${name}}`
  })
}

export const t = copy

export function copySafe(key: string, fallback?: string, params?: Record<string, string | number>): string {
  if (key in COPY) {
    return copy(key as CopyKey, params)
  }
  return fallback ?? key
}

export function hasCopy(key: string): key is CopyKey {
  return key in COPY
}
