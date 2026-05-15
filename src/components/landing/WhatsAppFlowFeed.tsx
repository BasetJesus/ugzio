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
      <div className="landing-glass rounded-2xl p-4 min-h-[180px] flex flex-col justify-center">
        <div className="flex items-center gap-2 mb-4">
          <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-status-online" />
          <span className="text-[10px] font-medium text-white/40 tracking-wider uppercase">Flux Live</span>
          <span className="text-[9px] text-green-400/40 ml-auto">en ligne</span>
        </div>
        <div className="relative min-h-[100px]">
          {steps.map((step, i) => (
            <div
              key={i}
              className={`transition-all duration-500 ease-out ${
                i === current
                  ? "opacity-100 translate-y-0 relative"
                  : "opacity-0 absolute inset-0 pointer-events-none translate-y-3"
              }`}
            >
              <div className="flex items-start gap-3">
                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm ${step.bg} animate-scale-bounce`}>
                  {step.icon}
                </span>
                <div className="min-w-0">
                  <p className={`text-sm font-semibold ${step.color}`}>{step.text}</p>
                  <p className="text-xs text-white/40 mt-0.5">{step.sub}</p>
                  {i === 0 && (
                    <div className="flex items-center gap-1 mt-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse-urgent" />
                      <span className="text-[9px] text-amber-400/60 font-medium">Action requise</span>
                    </div>
                  )}
                  {i === 4 && (
                    <div className="flex items-center gap-1 mt-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse-ring" />
                      <span className="text-[9px] text-green-400/60 font-medium">Revenue protégé</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
