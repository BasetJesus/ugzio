"use client"

/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useState } from "react"
import ConfettiBurst from "@/components/shared/ConfettiBurst"

interface Props {
  sellerName: string
  open: boolean
  onComplete: () => void
}

export default function BuyerConfirmCelebration({ sellerName, open, onComplete }: Props) {
  const [phase, setPhase] = useState<"entering" | "visible" | "exiting">("entering")

  useEffect(() => {
    if (!open) return
    setPhase("entering")
    const t1 = setTimeout(() => setPhase("visible"), 100)
    const t2 = setTimeout(() => {
      setPhase("exiting")
      setTimeout(onComplete, 400)
    }, 3000)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  // onComplete intentionally omitted — its identity changes on every render but the logic is stable
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  if (!open) return null

  return (
    <>
      <ConfettiBurst active={open} />
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
        style={{
          animation: phase === "entering" ? "celebration-fade-in 0.4s ease-out forwards" :
                     phase === "exiting" ? "celebration-fade-out 0.4s ease-in forwards" : "none",
        }}
      >
        <div
          className="text-center px-6"
          style={{
            animation: phase === "visible" ? "celebration-scale-in 0.5s cubic-bezier(0.19, 1, 0.22, 1) forwards" : "none",
            opacity: 0,
            transform: "scale(0.8)",
          }}
        >
          <div className="text-6xl mb-4 animate-bounce">🎉</div>
          <h1 className="text-2xl font-bold text-white mb-2">
            Merci {sellerName} ! 🙏
          </h1>
          <p className="text-base text-white/60 leading-relaxed max-w-sm mx-auto">
            Votre commande a été confirmée avec succès. Le vendeur va préparer votre colis inchallah.
          </p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3.5 py-1.5 text-xs font-medium text-emerald-400 border border-emerald-500/25">
              ✅ Confirmé
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-indigo-500/15 px-3.5 py-1.5 text-xs font-medium text-indigo-400 border border-indigo-500/25">
              🛡️ Protégé par UGZIO
            </span>
          </div>
          <p className="mt-8 text-xs text-white/20">Redirection automatique...</p>
        </div>
      </div>

      <style>{`
        @keyframes celebration-fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes celebration-fade-out {
          from { opacity: 1; }
          to { opacity: 0; }
        }
        @keyframes celebration-scale-in {
          from { opacity: 0; transform: scale(0.8); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </>
  )
}
