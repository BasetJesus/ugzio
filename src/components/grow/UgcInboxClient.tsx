"use client"

import { useState, useCallback } from "react"
import type { UgcItemSummary, UgcStats } from "@/services/grow.service"
import { MiniKpiCard } from "@/components/shared/KpiCard"
import SystemNarrative from "@/components/shared/SystemNarrative"

interface Props {
  initialItems: UgcItemSummary[]
  stats: UgcStats
}

type FilterMode = "all" | "received" | "approved" | "rejected"

const STATUS_LABELS: Record<string, string> = {
  received: "pending",
  approved: "approved",
  rejected: "rejected",
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
            alt={`UGC from ${item.buyerName}`}
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
            <p className="text-[10px] text-[var(--text-tertiary)]">{item.product ?? "unknown product"}</p>
          </div>
          <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full border shrink-0 ${STATUS_COLORS[item.status]}`}>
            {STATUS_LABELS[item.status] ?? item.status}
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
              {isActing ? "..." : "Approve"}
            </button>
            <button
              onClick={() => onAction(item.id, "reject")}
              disabled={isActing}
              className="rounded-lg border border-[var(--risk-red)]/30 py-2.5 text-xs font-semibold text-[var(--risk-red)] hover:bg-[var(--risk-red-bg)] disabled:opacity-60 transition-all duration-200 active:scale-[0.97] touch-manipulation"
            >
              {isActing ? "..." : "Reject"}
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
              Download ↗
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
        title={needsAttention ? "UGC to review" : "UGC Inbox"}
        narrative={
          needsAttention
            ? `${pendingCount} items need your review — approve the best ones for reposting`
            : "All UGC items have been reviewed"
        }
        emotion={needsAttention ? "tense" : "calm"}
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-card">
        <MiniKpiCard label="Total UGC" value={stats.total} tier="neutral" />
        <MiniKpiCard label="Pending review" value={stats.received} tier={stats.received > 0 ? "medium" : "low"} />
        <MiniKpiCard label="Approved" value={stats.approved} tier="low" emotion="protective" />
        <MiniKpiCard label="Approval rate" value={`${stats.rate}%`} tier={stats.rate >= 50 ? "low" : "neutral"} />
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
            {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
            {f !== "all" && ` (${f === "received" ? stats.received : f === "approved" ? stats.approved : stats.rejected})`}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-8 text-center">
          <p className="text-[var(--text-tertiary)] text-sm">No UGC items yet</p>
          <p className="text-[var(--text-tertiary)] text-xs mt-1">
            UGC requests sent to buyers will appear here once they submit photos or videos
          </p>
        </div>
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
