"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface Phase {
  id: string
  label: string
  emotion: string
  description: string
  color: string
  gradient: string
}

const phases: Phase[] = [
  {
    id: "trust",
    label: "Pré-confiance",
    emotion: "😰 → 🤔",
    description: "Le client hésite. C'est son premier achat COD. Il a peur de se faire arnaquer.",
    color: "text-amber-400",
    gradient: "from-amber-500/10 to-transparent",
  },
  {
    id: "confirm",
    label: "Confirmation",
    emotion: "🤔 → ✅",
    description: "UGZIO envoie une sequence WhatsApp psychologique. Le client se sent rassuré et confirme.",
    color: "text-purple-400",
    gradient: "from-purple-500/10 to-transparent",
  },
  {
    id: "anticipate",
    label: "Anticipation",
    emotion: "✅ → 📦",
    description: "Le client suit sa commande. Chaque etape est visible. Zero doute.",
    color: "text-blue-400",
    gradient: "from-blue-500/10 to-transparent",
  },
  {
    id: "deliver",
    label: "Livraison",
    emotion: "📦 → 🎉",
    description: "Le colis arrive. Le client etait prepare. Pas de refus, pas de surprise.",
    color: "text-emerald-400",
    gradient: "from-emerald-500/10 to-transparent",
  },
  {
    id: "advocate",
    label: "Advocacy",
    emotion: "🎉 → 🤝",
    description: "Client satisfait. Il partage son experience. Nouveaux acheteurs arrivent.",
    color: "text-green-400",
    gradient: "from-green-500/10 to-transparent",
  },
]

export default function PsychFlowSection() {
  const [active, setActive] = useState(0)

  return (
    <section className="section-padding">
      <div className="section-container">
        <motion.div
          className="text-center max-w-2xl mx-auto mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-[10px] font-semibold text-white/30 uppercase tracking-[0.12em] mb-4">
            Psychologie acheteur
          </p>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight">
            Du doute à la{" "}
            <span className="gradient-brand-text">fidelite</span>
          </h2>
          <p className="text-sm text-white/40 mt-4 max-w-lg mx-auto">
            Chaque phase est conçue pour transformer l&apos;anxiété COD en confiance. Pas de dashboard. Pas de jargon. Juste une expérience humaine.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-5 gap-3 max-w-5xl mx-auto">
          {phases.map((phase, i) => (
            <motion.button
              key={phase.id}
              className={`relative rounded-xl border p-4 text-left transition-all duration-300 ${
                i === active
                  ? `border-purple-500/30 bg-gradient-to-b ${phase.gradient}`
                  : "border-white/5 bg-white/[0.02] hover:bg-white/[0.04]"
              }`}
              onClick={() => setActive(i)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center gap-2 mb-3">
                <span className={`text-lg ${i === active ? "opacity-100" : "opacity-40"}`}>{phase.emotion.split(" ")[0]}</span>
                <span className={`text-[9px] font-medium px-2 py-0.5 rounded-full ${
                  i === active ? "bg-purple-500/20 text-purple-300" : "bg-white/5 text-white/30"
                }`}>
                  Phase {i + 1}
                </span>
              </div>
              <p className={`text-sm font-semibold mb-1 ${i === active ? "text-white" : "text-white/60"}`}>
                {phase.label}
              </p>
              <p className={`text-[10px] ${i === active ? "text-white/40" : "text-white/20"}`}>
                {phase.emotion}
              </p>
              <div className={`h-px w-full mt-3 transition-opacity ${
                i === active ? "opacity-100" : "opacity-0"
              }`}
                style={{ background: "linear-gradient(90deg, rgba(124,58,237,0.3), transparent)" }}
              />
            </motion.button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            className="max-w-2xl mx-auto mt-8 rounded-xl border border-white/5 bg-white/[0.02] p-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">{phases[active].emotion}</span>
              <div>
                <p className={`text-sm font-semibold ${phases[active].color}`}>
                  {phases[active].label}
                </p>
              </div>
            </div>
            <p className="text-sm text-white/60 leading-relaxed">
              {phases[active].description}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  )
}
