"use client"

import type { GrowthMetrics } from "@/services/growth.service"
import { MiniKpiCard } from "@/components/shared/KpiCard"
import SystemNarrative from "@/components/shared/SystemNarrative"

interface Props {
  metrics: GrowthMetrics
}

export default function GrowthDashboardClient({ metrics }: Props) {
  const hasData = metrics.requestsSent > 0

  return (
    <div className="space-y-section">
      <SystemNarrative
        title="Croissance UGC"
        narrative={
          hasData
            ? `${metrics.responsesReceived} réponses sur ${metrics.requestsSent} demandes — ${metrics.responseRate}% de participation`
            : "Envoie des demandes UGC à tes acheteurs pour collecter des photos et vidéos"
        }
        emotion={metrics.responseRate >= 50 ? "protective" : metrics.responseRate > 0 ? "tense" : "calm"}
      />

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-card">
        <MiniKpiCard label="Demandes envoyées" value={metrics.requestsSent} tier="neutral" />
        <MiniKpiCard
          label="Taux de réponse"
          value={`${metrics.responseRate}%`}
          tier={metrics.responseRate >= 50 ? "low" : metrics.responseRate >= 25 ? "medium" : "neutral"}
          emotion={metrics.responseRate >= 50 ? "protective" : "calm"}
        />
        <MiniKpiCard
          label="Approuvés"
          value={metrics.totalApproved}
          tier={metrics.totalApproved > 0 ? "low" : "neutral"}
          emotion="protective"
        />
        <MiniKpiCard
          label="Taux d'approbation"
          value={`${metrics.approvalRate}%`}
          tier={metrics.approvalRate >= 50 ? "low" : metrics.approvalRate > 0 ? "medium" : "neutral"}
        />
        <MiniKpiCard
          label="Revenu UGC"
          value={`${metrics.ugcRevenue.toFixed(0)} TND`}
          tier={metrics.ugcRevenue > 0 ? "low" : "neutral"}
        />
      </div>

      {metrics.topProducts.length > 0 && (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4 sm:p-6">
          <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Top produits UGC</h3>
          <div className="space-y-2">
            {metrics.topProducts.map((p, i) => (
              <div
                key={p.product}
                className="flex items-center justify-between rounded-lg bg-[var(--bg-surface)] px-4 py-2.5"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-[10px] font-medium text-[var(--text-tertiary)] w-4 shrink-0">
                    #{i + 1}
                  </span>
                  <span className="text-sm text-[var(--text-primary)] truncate">{p.product}</span>
                </div>
                <span className="text-xs font-semibold text-[var(--accent)] shrink-0 ml-3">
                  {p.count} UGC
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {!hasData && (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-8 text-center">
          <p className="text-sm text-[var(--text-tertiary)]">
            Aucune donnée UGC pour l&apos;instant. Les demandes apparaîtront ici quand les acheteurs répondront.
          </p>
        </div>
      )}
    </div>
  )
}
