'use client'

import { useState } from "react"

interface BuyerConfig {
  id: string
  name: string
  desc: string
  risk: number
  trust: number
  label: string
  labelColor: string
  bgColor: string
  borderColor: string
  whatsappSequence: string
  message: string
  outcome: string
  outcomeIcon: string
  outcomeColor: string
}

const buyers: BuyerConfig[] = [
  {
    id: "fake",
    name: "Faux Client",
    desc: "Numéro suspect • 0 historique",
    risk: 94,
    trust: 8,
    label: "Risque Critique",
    labelColor: "text-red-400",
    bgColor: "bg-red-500/5",
    borderColor: "border-red-500/20",
    whatsappSequence: "Urgence + Vérification d'identité",
    message: "Salam, on a détecté une activité suspecte. Veuillez confirmer cette commande de 120 TND en répondant OUI.",
    outcome: "120 TND évités",
    outcomeIcon: "🛡️",
    outcomeColor: "text-red-400",
  },
  {
    id: "first",
    name: "Nouveau Client",
    desc: "Premier achat • WhatsApp inactif",
    risk: 68,
    trust: 32,
    label: "Risque Moyen",
    labelColor: "text-amber-400",
    bgColor: "bg-amber-500/5",
    borderColor: "border-amber-500/20",
    whatsappSequence: "Réassurance + Preuve sociale",
    message: "Salam, merci pour votre commande de 85 TND! Plus de 200 clients satisfaits cette semaine. On vous confirme ?",
    outcome: "85 TND en attente",
    outcomeIcon: "⏳",
    outcomeColor: "text-amber-400",
  },
  {
    id: "returning",
    name: "Client Fidèle",
    desc: "3ème commande • Déjà confirmé",
    risk: 8,
    trust: 94,
    label: "Client Sûr",
    labelColor: "text-green-400",
    bgColor: "bg-green-500/5",
    borderColor: "border-green-500/20",
    whatsappSequence: "Confirmation simple + Remerciement",
    message: "Salam Ahmed, votre commande de 150 TND est en préparation. Merci pour votre confiance!",
    outcome: "150 TND sécurisés",
    outcomeIcon: "✅",
    outcomeColor: "text-green-400",
  },
  {
    id: "risky",
    name: "Client à Risque",
    desc: "RTS précédent • Comportement suspect",
    risk: 82,
    trust: 18,
    label: "Risque Élevé",
    labelColor: "text-red-400",
    bgColor: "bg-red-500/5",
    borderColor: "border-red-500/20",
    whatsappSequence: "Réassurance + Urgence + Relance",
    message: "Salam, on a essayé de vous joindre sans succès. Votre commande de 200 TND vous attend. Répondez OUI pour confirmer.",
    outcome: "200 TND en danger",
    outcomeIcon: "⚠️",
    outcomeColor: "text-red-400",
  },
]

export default function LiveDemoSection() {
  const [activeId, setActiveId] = useState("fake")
  const active = buyers.find((b) => b.id === activeId) ?? buyers[0]

  return (
    <section className="relative px-5 py-20 sm:py-28">
      <div className="landing-gradient-divider absolute top-0 left-5 right-5" />

      <div className="mx-auto max-w-6xl">
        <div className="max-w-xl mb-12">
          <p className="text-[11px] font-semibold tracking-widest text-white/30 uppercase mb-4">
            Live Demo
          </p>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight">
            Chouf kifesh UGZIO y5adem live.
          </h2>
          <p className="mt-4 text-sm text-white/40 leading-relaxed">
            Switch entre les types de clients. Regarde comment UGZIO analyse, décide, et protège ton revenue.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-5">
          <div className="lg:col-span-2 flex flex-col gap-2">
            {buyers.map((b) => (
              <button
                key={b.id}
                onClick={() => setActiveId(b.id)}
                className={`w-full text-left rounded-xl border p-4 transition-all duration-200 touch-manipulation ${
                  activeId === b.id
                    ? `${b.borderColor} ${b.bgColor} scale-[1.02]`
                    : "border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-white">{b.name}</span>
                  <span className={`text-[10px] font-medium ${b.labelColor}`}>{b.label}</span>
                </div>
                <p className="text-xs text-white/40 mt-0.5">{b.desc}</p>
              </button>
            ))}
          </div>

          <div className="lg:col-span-3">
            <div className="landing-glass rounded-2xl p-5 sm:p-6 min-h-[320px]">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1">Risk Score</p>
                  <div className="flex items-baseline gap-2">
                    <span className={`text-3xl font-bold ${active.risk > 70 ? "text-red-400" : active.risk > 40 ? "text-amber-400" : "text-green-400"}`}>
                      {active.risk}
                    </span>
                    <span className="text-xs text-white/30">/100</span>
                  </div>
                  <div className="mt-2 h-1.5 rounded-full bg-white/5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        active.risk > 70 ? "bg-red-500" : active.risk > 40 ? "bg-amber-500" : "bg-green-500"
                      }`}
                      style={{ width: `${active.risk}%` }}
                    />
                  </div>
                </div>
                <div>
                  <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1">Trust Score</p>
                  <div className="flex items-baseline gap-2">
                    <span className={`text-3xl font-bold ${active.trust > 70 ? "text-green-400" : active.trust > 40 ? "text-amber-400" : "text-red-400"}`}>
                      {active.trust}
                    </span>
                    <span className="text-xs text-white/30">/100</span>
                  </div>
                  <div className="mt-2 h-1.5 rounded-full bg-white/5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        active.trust > 70 ? "bg-green-500" : active.trust > 40 ? "bg-amber-500" : "bg-red-500"
                      }`}
                      style={{ width: `${active.trust}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="mb-5">
                <p className="text-[10px] text-white/30 uppercase tracking-wider mb-2">WhatsApp Sequence</p>
                <div className="inline-flex items-center gap-2 rounded-lg bg-purple-500/10 border border-purple-500/20 px-3 py-1.5">
                  <span className="text-[10px] font-medium text-purple-400">{active.whatsappSequence}</span>
                </div>
              </div>

              <div className="mb-5">
                <p className="text-[10px] text-white/30 uppercase tracking-wider mb-2">Message Envoyé</p>
                <div className="rounded-xl bg-green-500/5 border border-green-500/10 p-3 sm:p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-green-400 text-xs">📱 UGZIO Bot</span>
                    <span className="text-[10px] text-white/20">via WhatsApp</span>
                  </div>
                  <p className="text-sm text-white/70 leading-relaxed">{active.message}</p>
                </div>
              </div>

              <div className={`rounded-xl border ${active.borderColor} ${active.bgColor} p-3 sm:p-4`}>
                <div className="flex items-center gap-3">
                  <span className="text-xl">{active.outcomeIcon}</span>
                  <div>
                    <p className="text-[10px] text-white/30 uppercase tracking-wider">Revenue Outcome</p>
                    <p className={`text-base font-bold ${active.outcomeColor}`}>{active.outcome}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
