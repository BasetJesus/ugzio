"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { useLanguage } from "@/context/LanguageContext"

type Outcome = "delivered" | "refused" | "unreachable"

const OUTCOMES: { key: Outcome; face: string; labelKey: string; color: string; bg: string }[] = [
  { key: "delivered", face: "😊", labelKey: "outcome.delivered", color: "var(--status-success)", bg: "var(--status-success-bg)" },
  { key: "refused", face: "😞", labelKey: "outcome.refused", color: "var(--status-danger)", bg: "var(--status-danger-bg)" },
  { key: "unreachable", face: "📵", labelKey: "outcome.unreachable", color: "var(--status-warning)", bg: "var(--status-warning-bg)" },
]

interface Props {
  orderId: string
  onComplete?: () => void
}

export default function OutcomeMarker({ orderId, onComplete }: Props) {
  const { t } = useLanguage()
  const [selected, setSelected] = useState<Outcome | null>(null)
  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState(false)

  const handleSelect = async (outcome: Outcome) => {
    if (saving || done) return
    setSelected(outcome)
    setSaving(true)
    try { navigator.vibrate?.(20) } catch {}
    try {
      await fetch(`/api/v1/orders/${orderId}/outcome`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ outcome }),
      })
      setDone(true)
      onComplete?.()
    } catch {
      setSelected(null)
    } finally {
      setSaving(false)
    }
  }

  if (done) {
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="rounded-xl border border-[var(--status-success)] bg-[var(--status-success-bg)] p-4 text-center"
      >
        <p className="text-sm font-medium text-[var(--status-success)]">
          {t("outcome.delivered")}
        </p>
        <p className="text-xs text-[var(--text-secondary)] mt-1">✓ Résultat enregistré</p>
      </motion.div>
    )
  }

  return (
    <div className="grid grid-cols-3 gap-3">
      {OUTCOMES.map((item) => {
        const active = selected === item.key
        return (
          <motion.button
            key={item.key}
            onClick={() => handleSelect(item.key)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`flex flex-col items-center gap-2 rounded-xl border p-4 transition ${
              active
                ? "border-transparent"
                : "border-[var(--border)] hover:border-[var(--accent)]"
            }`}
            style={{
              backgroundColor: active ? item.bg : "var(--bg-surface)",
              borderColor: active ? item.color : undefined,
            }}
          >
            <motion.span
              className="text-3xl"
              animate={active ? { scale: [1, 1.3, 1], rotate: [0, -10, 0] } : {}}
              transition={{ duration: 0.3 }}
            >
              {item.face}
            </motion.span>
            <span className="text-[10px] font-medium" style={{ color: active ? item.color : "var(--text-secondary)" }}>
              {t(item.labelKey)}
            </span>
          </motion.button>
        )
      })}
    </div>
  )
}
