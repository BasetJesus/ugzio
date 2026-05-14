"use client"

import { motion } from "framer-motion"
import AnimatedCounter from "./AnimatedCounter"
import GlowBorder from "./GlowBorder"

const metrics = [
  { to: 94, suffix: "%", label: "Taux de confirmation", color: "text-purple-400", delay: 0 },
  { to: 60, suffix: "%", label: "Moins d'annulations", color: "text-green-400", delay: 0.3 },
  { to: 85, suffix: " TND", prefix: "+", label: "Protegés par commande", color: "text-emerald-400", delay: 0.6 },
  { to: 500, suffix: "+", label: "Vendeurs actifs", color: "text-blue-400", delay: 0.9 },
]

export default function TrustMetricsSection() {
  return (
    <section className="section-padding">
      <div className="landing-gradient-divider absolute top-0 left-5 right-5" />

      <div className="section-container">
        <motion.div
          className="text-center max-w-2xl mx-auto mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-[10px] font-semibold text-white/30 uppercase tracking-[0.12em] mb-4">
            La preuve par les chiffres
          </p>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight">
            Des résultats qui{" "}
            <span className="gradient-brand-text">parlent</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
          {metrics.map((m) => (
            <GlowBorder key={m.label} className="rounded-xl" duration={5}>
              <div className="p-6">
                <AnimatedCounter
                  to={m.to}
                  suffix={m.suffix}
                  prefix={m.prefix}
                  label={m.label}
                  color={m.color}
                  delay={m.delay}
                />
              </div>
            </GlowBorder>
          ))}
        </div>
      </div>
    </section>
  )
}
