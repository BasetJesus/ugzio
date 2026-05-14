'use client'

import { useState, useEffect, useCallback } from "react"

interface BuyerConfig {
  id: string
  name: string
  desc: string
  risk: number
  trust: number
  label: string
  labelColor: string
  whatsappSequence: string
  messages: { text: string; time: string }[]
  outcome: string
  outcomeIcon: string
  outcomeColor: string
  celebration?: boolean
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
    whatsappSequence: "T3ajil + T2akkid",
    messages: [
      { text: "Salam, 3malna analyse 3la commande mte3ek 🔍", time: "10:32" },
      { text: "Commandet 120 TND — confirmiha b OUI wala tet7at fel attente.", time: "10:32" },
      { text: "⚠️ Don't miss out! Dernier appel avant annulation.", time: "10:35" },
    ],
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
    whatsappSequence: "T2akkid + Thiqa",
    messages: [
      { text: "Salam, merci 3la commandet 85 TND 🎉", time: "10:30" },
      { text: "Plus de 200 clients satisfaits cette semaine. Vous confirmez ?", time: "10:30" },
    ],
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
    whatsappSequence: "T2akkid + Chokran",
    messages: [
      { text: "Salam Ahmed, commandet 150 TND t7adar 🚀", time: "10:28" },
      { text: "Merci 3la thiqa mte3ek! Nchoufoukom fi prochaine ✅", time: "10:28" },
    ],
    outcome: "150 TND sécurisés ✅",
    outcomeIcon: "✅",
    outcomeColor: "text-green-400",
    celebration: true,
  },
  {
    id: "risky",
    name: "Client à Risque",
    desc: "RTS précédent • Comportement suspect",
    risk: 82,
    trust: 18,
    label: "Risque Élevé",
    labelColor: "text-red-400",
    whatsappSequence: "T2akkid + T3ajil + Tadhkir",
    messages: [
      { text: "Salam, 9asit nwasslek — ma njemnach 😕", time: "10:25" },
      { text: "Commande de 200 TND en attente. Repondez OUI pour confirmer.", time: "10:26" },
    ],
    outcome: "200 TND en danger",
    outcomeIcon: "⚠️",
    outcomeColor: "text-red-400",
  },
]

export default function LiveDemoSection() {
  const [activeId, setActiveId] = useState("fake")
  const [transitioning, setTransitioning] = useState(false)
  const [showMessage, setShowMessage] = useState(false)
  const [showTyping, setShowTyping] = useState(false)
  const [celebration, setCelebration] = useState(false)
  const [visibleMessages, setVisibleMessages] = useState(0)

  const active = buyers.find((b) => b.id === activeId) ?? buyers[0]

  const switchBuyer = useCallback((id: string) => {
    if (id === activeId || transitioning) return
    setTransitioning(true)
    setShowMessage(false)
    setShowTyping(false)
    setCelebration(false)
    setVisibleMessages(0)

    setTimeout(() => {
      setActiveId(id)
      setTransitioning(false)
      setShowTyping(true)

      setTimeout(() => {
        setShowTyping(false)
        setShowMessage(true)
        const b = buyers.find((x) => x.id === id)
        if (b) {
          let i = 1
          b.messages.forEach((_, idx) => {
            setTimeout(() => setVisibleMessages(idx + 1), (idx + 1) * 600)
            i = idx + 1
          })
          setTimeout(() => {
            setVisibleMessages(i)
            if (b.celebration) {
              setCelebration(true)
              setTimeout(() => setCelebration(false), 2500)
            }
          }, i * 600 + 200)
        }
      }, 1200)
    }, 250)
  }, [activeId, transitioning])

  return (
    <section className="relative section-padding">
      <div className="landing-gradient-divider absolute top-0 left-5 right-5" />

      <div className="section-container">
        <div className="section-intro">
          <p className="section-intro-label">Live Demo</p>
          <h2 className="section-intro-title">Decouvrez UGZIO en action.</h2>

          <p className="section-intro-desc">
            Basculez entre les profils clients. Découvrez comment UGZIO analyse, décide et protège votre chiffre d&apos;affaires en temps réel.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-5">
          <div className="lg:col-span-2 flex flex-col gap-2">
            {buyers.map((b) => {
              const isActive = activeId === b.id
              return (
                <button
                  key={b.id}
                  onClick={() => switchBuyer(b.id)}
                  disabled={transitioning}
                  className={`w-full text-left rounded-xl border p-4 transition-all duration-300 touch-manipulation disabled:cursor-wait ${
                    isActive
                      ? `border-${b.id === "returning" ? "green" : b.id === "fake" || b.id === "risky" ? "red" : "amber"}-500/30 bg-white/[0.04] scale-[1.02] shadow-lg`
                      : "border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] hover:scale-[1.01]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-white">{b.name}</span>
                    <span className={`text-[10px] font-medium ${b.labelColor}`}>{b.label}</span>
                  </div>
                  <p className="text-xs text-white/40 mt-0.5">{b.desc}</p>
                </button>
              )
            })}
          </div>

          <div className="lg:col-span-3">
            <div className="landing-glass rounded-2xl p-5 sm:p-6 min-h-[400px]">
              <div className={`transition-all duration-500 ease-out ${transitioning ? "opacity-0 scale-95" : "opacity-100 scale-100"}`}>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1">Risk Score</p>
                    <div className="flex items-baseline gap-2">
                      <span className={`text-3xl font-bold transition-colors duration-500 ${
                        active.risk > 70 ? "text-red-400" : active.risk > 40 ? "text-amber-400" : "text-green-400"
                      }`}>
                        {active.risk}
                      </span>
                      <span className="text-xs text-white/30">/100</span>
                    </div>
                    <div className="mt-2 h-1.5 rounded-full bg-white/5 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ease-out ${
                          active.risk > 70 ? "bg-red-500" : active.risk > 40 ? "bg-amber-500" : "bg-green-500"
                        }`}
                        style={{ width: `${active.risk}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1">Trust Score</p>
                    <div className="flex items-baseline gap-2">
                      <span className={`text-3xl font-bold transition-colors duration-500 ${
                        active.trust > 70 ? "text-green-400" : active.trust > 40 ? "text-amber-400" : "text-red-400"
                      }`}>
                        {active.trust}
                      </span>
                      <span className="text-xs text-white/30">/100</span>
                    </div>
                    <div className="mt-2 h-1.5 rounded-full bg-white/5 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ease-out ${
                          active.trust > 70 ? "bg-green-500" : active.trust > 40 ? "bg-amber-500" : "bg-red-500"
                        }`}
                        style={{ width: `${active.trust}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-[10px] text-white/30 uppercase tracking-wider mb-2">WhatsApp Intelligence</p>
                  <div className="inline-flex items-center gap-2 rounded-lg bg-purple-500/10 border border-purple-500/20 px-3 py-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-purple-400 animate-pulse" />
                    <span className="text-[10px] font-medium text-purple-400">{active.whatsappSequence}</span>
                  </div>
                </div>

                <div className="mb-5">
                  <p className="text-[10px] text-white/30 uppercase tracking-wider mb-2">Conversation WhatsApp</p>
                  <div className="rounded-xl bg-[#1a2e2a] border border-green-900/30 p-4 min-h-[140px]">
                    <div className="flex items-center gap-2 mb-3 pb-2 border-b border-green-900/20">
                      <span className="h-5 w-5 rounded-full bg-green-600 flex items-center justify-center text-[10px] font-bold text-white">U</span>
                      <span className="text-xs font-medium text-green-300">UGZIO Bot</span>
                      <span className="text-[9px] text-green-600 ml-auto">online</span>
                    </div>

                    <div className="space-y-2">
                      {active.messages.slice(0, visibleMessages).map((msg, i) => (
                        <div
                          key={i}
                          className="animate-message-reveal"
                        >
                          <div className="inline-block rounded-2xl rounded-bl-sm bg-white/[0.07] px-3.5 py-2.5 max-w-[90%]">
                            <p className="text-xs text-white/80 leading-relaxed">{msg.text}</p>
                          </div>
                          <p className="text-[9px] text-white/20 mt-0.5 ml-1">{msg.time}</p>
                        </div>
                      ))}

                      {showTyping && (
                        <div className="flex items-center gap-1.5 px-1 py-1">
                          <span className="text-[9px] text-green-400/50">typing</span>
                          <span className="flex items-center gap-0.5">
                            <span className="h-1 w-1 rounded-full bg-green-400/60 animate-typing-dot" style={{ animationDelay: "0ms" }} />
                            <span className="h-1 w-1 rounded-full bg-green-400/60 animate-typing-dot" style={{ animationDelay: "200ms" }} />
                            <span className="h-1 w-1 rounded-full bg-green-400/60 animate-typing-dot" style={{ animationDelay: "400ms" }} />
                          </span>
                        </div>
                      )}

                      {!showMessage && !showTyping && (
                        <div className="py-6 text-center">
                          <p className="text-xs text-white/30">Switching buyer type...</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className={`rounded-xl border p-3 sm:p-4 transition-all duration-500 ${
                  celebration ? "border-green-400/40 bg-green-500/10 animate-celebration-flash" : `${active.outcomeColor.includes("red") ? "border-red-500/15 bg-red-500/5" : active.outcomeColor.includes("green") ? "border-green-500/15 bg-green-500/5" : "border-amber-500/15 bg-amber-500/5"}`
                }`}>
                  <div className="flex items-center gap-3">
                    <span className={`text-xl ${celebration ? "animate-scale-bounce" : ""}`}>
                      {celebration ? "🎉" : active.outcomeIcon}
                    </span>
                    <div>
                      <p className="text-[10px] text-white/30 uppercase tracking-wider">Revenue Outcome</p>
                      <p className={`text-base font-bold flex items-center gap-2 ${active.outcomeColor}`}>
                        {active.outcome}
                        {celebration && <span className="text-[9px] text-green-400/60 font-normal animate-pulse">Protected!</span>}
                      </p>
                    </div>
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
