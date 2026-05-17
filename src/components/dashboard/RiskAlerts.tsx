"use client"

import { motion } from "framer-motion"
import { useLanguage } from "@/context/LanguageContext"
import { getRiskAlertCopy, type RiskReason, type OrderContext } from "@/lib/risk-copy"

interface Alert {
  id: string
  buyerName: string
  orderId: string
  amount: number
  city: string
  riskLevel: "high" | "medium"
  reason: RiskReason
  context: Partial<OrderContext>
  timeAgo: string
}

interface Props {
  alerts: Alert[]
  onVerify?: (orderId: string) => void
  onContact?: (orderId: string) => void
  onBlock?: (orderId: string) => void
}

export default function RiskAlerts({ alerts, onVerify, onContact, onBlock }: Props) {
  const { lang, t } = useLanguage()

  if (alerts.length === 0) {
    return (
      <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-6 text-center">
        <p className="text-sm text-[var(--text-secondary)]">{t("cf.all-clear")}</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {alerts.map((alert, i) => {
        const riskCopy = getRiskAlertCopy(alert.reason, alert.context as OrderContext, lang)
        const isHigh = alert.riskLevel === "high"

        return (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05, duration: 0.2 }}
            className="rounded-xl border bg-[var(--bg-surface)] overflow-hidden"
            style={{ borderLeft: `3px solid ${isHigh ? "var(--status-danger)" : "var(--status-warning)"}` }}
          >
            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span
                    className="rounded px-1.5 py-0.5 text-[9px] font-bold uppercase"
                    style={{
                      backgroundColor: isHigh ? "var(--status-danger-bg)" : "var(--status-warning-bg)",
                      color: isHigh ? "var(--status-danger)" : "var(--status-warning)",
                    }}
                  >
                    {isHigh ? t("risk.high") : t("risk.medium")}
                  </span>
                  <span className="text-sm font-medium text-[var(--text-primary)]">{alert.buyerName}</span>
                </div>
                <span className="text-[10px] text-[var(--text-muted)]">{alert.timeAgo}</span>
              </div>

              <p className="text-xs font-medium text-[var(--text-primary)] mb-1">{riskCopy.title}</p>
              <p className="text-[11px] text-[var(--text-secondary)] mb-1">
                {riskCopy.body}
              </p>
              <p className="text-[10px] text-[var(--text-muted)]">
                {alert.amount} TND · {alert.city} · {alert.timeAgo}
              </p>
            </div>

            <div className="flex border-t border-[var(--border)]">
              {alert.reason === "NO_REPLY_6H" && onContact && (
                <button
                  onClick={() => onContact(alert.orderId)}
                  className="flex-1 px-3 py-2.5 text-[11px] font-medium text-[var(--accent)] transition hover:bg-[var(--accent)]/5 active:scale-[0.98] min-h-[44px]"
                >
                  📞 {t("actions.contact")}
                </button>
              )}
              {(alert.reason === "FIRST_TIME_BUYER" || alert.reason === "HIGH_VALUE_COD") && onVerify && (
                <button
                  onClick={() => onVerify(alert.orderId)}
                  className="flex-1 px-3 py-2.5 text-[11px] font-medium text-[var(--status-success)] transition hover:bg-[var(--status-success-bg)] active:scale-[0.98] min-h-[44px]"
                >
                  ✅ {t("actions.verify")}
                </button>
              )}
              {alert.reason === "SUSPICIOUS_PATTERN" && onBlock && (
                <button
                  onClick={() => onBlock(alert.orderId)}
                  className="flex-1 px-3 py-2.5 text-[11px] font-medium text-[var(--status-danger)] transition hover:bg-[var(--status-danger-bg)] active:scale-[0.98] min-h-[44px]"
                >
                  🚫 {t("actions.block")}
                </button>
              )}
              <button
                onClick={() => window.location.href = `/orders/${alert.orderId}`}
                className="px-3 py-2.5 text-[11px] text-[var(--text-muted)] transition hover:text-[var(--text-secondary)] min-h-[44px]"
              >
                {t("actions.viewDetails")}
              </button>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
