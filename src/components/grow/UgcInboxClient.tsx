"use client"

import { useState, useCallback } from "react"
import type { UgcItemSummary, UgcStats } from "@/services/grow.service"
import { MiniKpiCard } from "@/components/shared/KpiCard"
import SystemNarrative from "@/components/shared/SystemNarrative"
import EmptyState from "@/components/shared/EmptyState"
import { t } from "@/lib/core/copy"

interface Props {
  initialItems: UgcItemSummary[]
  stats: UgcStats
}

type FilterMode = "all" | "received" | "approved" | "rejected"

function statusLabel(s: string): string {
  switch (s) {
    case "received": return t("label.ugc-status-pending")
    case "approved": return t("label.ugc-status-approved")
    case "rejected": return t("label.ugc-status-rejected")
    default: return s
  }
}

function filterLabel(s: string): string {
  switch (s) {
    case "all": return t("label.filter-all")
    case "received": return t("label.filter-received")
    case "approved": return t("label.filter-approved")
    case "rejected": return t("label.filter-rejected")
    default: return s
  }
}

const STATUS_COLORS: Record<string, string> = {
  received: "text-[var(--warning-amber)] border-[var(--warning-amber)]/20 bg-[var(--warning-amber-bg)]",
  approved: "text-[var(--success-green)] border-[var(--success-green)]/20 bg-[var(--success-green-bg)]",
  rejected: "text-[var(--risk-red)] border-[var(--risk-red)]/20 bg-[var(--risk-red-bg)]",
}

function UgcMediaCard({ item, onAction, acting }: {
  item: UgcItemSummary
  onAction: (id: string, action: "approve" | "reject") => void
  acting: string | null
}) {
  const isActing = acting === item.id

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] overflow-hidden">
      <div className="aspect-[4/3] bg-[var(--bg-surface)] flex items-center justify-center overflow-hidden">
        {item.mediaType === "image" ? (
          <img
            src={item.mediaUrl}
            alt={`UGC de ${item.buyerName}`}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <video
            src={item.mediaUrl}
            className="w-full h-full object-cover"
            preload="metadata"
            playsInline
            controls
          />
        )}
      </div>

      <div className="p-3 space-y-2">
        <div className="flex items-start justify-between">
          <div className="min-w-0">
            <p className="text-sm font-medium text-[var(--text-primary)] truncate">{item.buyerName}</p>
            <p className="text-[10px] text-[var(--text-tertiary)]">{item.product ?? t("label.produit-inconnu")}</p>
          </div>
          <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full border shrink-0 ${STATUS_COLORS[item.status]}`}>
            {statusLabel(item.status)}
          </span>
        </div>

        <p className="text-xs text-[var(--text-secondary)]">
          {item.amount.toFixed(0)} TND &middot; {new Date(item.createdAt).toLocaleDateString()}
        </p>

        {item.status === "received" && (
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={() => onAction(item.id, "approve")}
              disabled={isActing}
              className="rounded-lg bg-[var(--btn-green)]/90 py-2.5 text-xs font-semibold text-white hover:bg-[var(--btn-green-hover)] disabled:opacity-60 transition-all duration-200 active:scale-[0.97] touch-manipulation"
            >
              {isActing ? "..." : t("cta.approve")}
            </button>
            <button
              onClick={() => onAction(item.id, "reject")}
              disabled={isActing}
              className="rounded-lg border border-[var(--risk-red)]/30 py-2.5 text-xs font-semibold text-[var(--risk-red)] hover:bg-[var(--risk-red-bg)] disabled:opacity-60 transition-all duration-200 active:scale-[0.97] touch-manipulation"
            >
              {isActing ? "..." : t("cta.reject")}
            </button>
          </div>
        )}

        {item.status === "approved" && (
          <div className="pt-1">
            <a
              href={item.mediaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full rounded-lg bg-[var(--bg-surface)] border border-[var(--border)] py-2.5 text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--accent)]/50 text-center transition-all duration-200"
            >
              {t("label.ugc-download")}
            </a>
          </div>
        )}
      </div>
    </div>
  )
}

export default function UgcInboxClient({ initialItems, stats }: Props) {
  const [items, setItems] = useState(initialItems)
  const [acting, setActing] = useState<string | null>(null)
  const [filter, setFilter] = useState<FilterMode>("all")

  const handleAction = useCallback(async (id: string, action: "approve" | "reject") => {
    setActing(id)
    try {
      const res = await fetch(`/api/v1/ugc/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      })
      if (!res.ok) return
      const data = await res.json()
      setItems((prev) => prev.map((i) => (i.id === id ? { ...i, status: data.status } : i)))
    } finally {
      setActing(null)
    }
  }, [])

  const filtered = filter === "all" ? items : items.filter((i) => i.status === filter)

  const pendingCount = items.filter((i) => i.status === "received").length
  const needsAttention = pendingCount > 0

  return (
    <div className="space-y-section">
      <SystemNarrative
        title={needsAttention ? "UGC à examiner" : "Boîte de réception UGC"}
        narrative={
          needsAttention
            ? `${pendingCount} éléments nécessitent votre avis — approuvez les meilleurs pour republication`
            : "Tous les contenus UGC ont été examinés"
        }
        emotion={needsAttention ? "tense" : "calm"}
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-card">
        <MiniKpiCard label={t("label.ugc-total")} value={stats.total} tier="neutral" />
        <MiniKpiCard label={t("label.pending")} value={stats.received} tier={stats.received > 0 ? "medium" : "low"} />
        <MiniKpiCard label={t("label.ugc-approved")} value={stats.approved} tier="low" emotion="protective" />
        <MiniKpiCard label={t("label.ugc-approval-rate")} value={`${stats.rate}%`} tier={stats.rate >= 50 ? "low" : "neutral"} />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {(["all", "received", "approved", "rejected"] as FilterMode[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 border shrink-0 ${
              filter === f
                ? "bg-[var(--accent)] text-white border-[var(--accent)]"
                : "bg-[var(--bg-card)] text-[var(--text-secondary)] border-[var(--border)] hover:border-[var(--accent)]/50"
            }`}
          >
            {filterLabel(f)}
            {f !== "all" && ` (${f === "received" ? stats.received : f === "approved" ? stats.approved : stats.rejected})`}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon="📸"
          titleKey="empty.ugc.title"
          descKey="empty.ugc.desc"
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((item) => (
            <UgcMediaCard key={item.id} item={item} onAction={handleAction} acting={acting} />
          ))}
        </div>
      )}
    </div>
  )
}
