'use client'

import { useState, useEffect } from "react"

interface FlowStep {
  icon: string
  text: string
  sub: string
  color: string
  bg: string
}

const steps: FlowStep[] = [
  { icon: "📦", text: "Nouvelle commande #4821", sub: "85 TND • Premier achat", color: "text-blue-400", bg: "bg-blue-500/10" },
  { icon: "🧠", text: "UGZIO analyse le risque...", sub: "Trust score: 23/100", color: "text-purple-400", bg: "bg-purple-500/10" },
  { icon: "📱", text: "Envoi WhatsApp réassurance", sub: "Séquence psychologique adaptée", color: "text-green-400", bg: "bg-green-500/10" },
  { icon: "✅", text: "Client a confirmé ✓", sub: "Commande sécurisée", color: "text-emerald-400", bg: "bg-emerald-500/10" },
  { icon: "🛡️", text: "+85 TND protégés", sub: "RTS évité • Marge préservée", color: "text-green-400", bg: "bg-green-500/10" },
]

export default function WhatsAppFlowFeed() {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % steps.length)
    }, 2800)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="relative">
      <div className="landing-glass rounded-2xl p-4 min-h-[160px] flex flex-col justify-center">
        <div className="flex items-center gap-2 mb-3">
          <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
          <span className="text-[10px] font-medium text-white/40 tracking-wider uppercase">Live Feed</span>
        </div>
        {steps.map((step, i) => (
          <div
            key={i}
            className={`flex items-start gap-3 transition-all duration-500 ${
              i === current ? "opacity-100 translate-y-0" : "opacity-0 absolute -translate-y-2"
            } ${i === current ? "relative" : ""}`}
            style={{ display: i === current ? "flex" : "none" }}
          >
            <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm ${step.bg}`}>
              {step.icon}
            </span>
            <div className="min-w-0">
              <p className={`text-sm font-semibold ${step.color}`}>{step.text}</p>
              <p className="text-xs text-white/40 mt-0.5">{step.sub}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
