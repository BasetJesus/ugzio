"use client"

import type { WhatsAppConnectionState, ConnectionStatus } from "@/types/whatsapp"

interface Props {
  data: WhatsAppConnectionState
}

const STATUS_CONFIG: Record<ConnectionStatus, { label: string; color: string; dot: string; action: string }> = {
  connected: { label: "Connected", color: "text-[var(--success-green)]", dot: "bg-[var(--success-green)]", action: "Active" },
  disconnected: { label: "Disconnected", color: "text-[var(--text-tertiary)]", dot: "bg-[var(--text-tertiary)]", action: "Connect" },
  pending: { label: "Pending", color: "text-[var(--warning-amber)]", dot: "bg-[var(--warning-amber)]", action: "Waiting" },
  expired: { label: "Expired", color: "text-[var(--risk-red)]", dot: "bg-[var(--risk-red)]", action: "Reconnect" },
}

function formatDate(iso?: string): string {
  if (!iso) return "—"
  const d = new Date(iso)
  return d.toLocaleDateString("fr-TN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })
}

export default function WhatsAppConnectionCard({ data }: Props) {
  const cfg = STATUS_CONFIG[data.status]

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-medium text-[var(--text-tertiary)]">WhatsApp Connection</p>
        <div className="flex items-center gap-1.5">
          <span className={`h-2 w-2 rounded-full ${cfg.dot}`} />
          <span className={`text-xs font-semibold ${cfg.color}`}>{cfg.label}</span>
        </div>
      </div>

      <div className="space-y-2 text-xs text-[var(--text-secondary)]">
        {data.phoneNumber && (
          <div className="flex justify-between">
            <span>Phone</span>
            <span className="text-[var(--text-primary)]">{data.phoneNumber}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span>Connected</span>
          <span className="text-[var(--text-primary)]">{formatDate(data.connectedAt)}</span>
        </div>
        {data.expiresAt && (
          <div className="flex justify-between">
            <span>Expires</span>
            <span className="text-[var(--text-primary)]">{formatDate(data.expiresAt)}</span>
          </div>
        )}
      </div>

      {data.status === "disconnected" && (
        <button
          onClick={() => window.open("https://business.facebook.com/wa/manage/", "_blank")}
          className="mt-3 w-full rounded-lg bg-[var(--accent)] py-2.5 text-xs font-semibold text-white hover:bg-[var(--accent-hover)] transition-colors active:scale-[0.97] touch-manipulation"
        >
          Connect WhatsApp Business
        </button>
      )}

      {data.status === "expired" && (
        <button
          onClick={() => window.open("https://business.facebook.com/wa/manage/", "_blank")}
          className="mt-3 w-full rounded-lg border border-[var(--risk-red)]/30 py-2.5 text-xs font-semibold text-[var(--risk-red)] hover:bg-[var(--kpi-red-bg)] transition-colors active:scale-[0.97] touch-manipulation"
        >
          Reconnect Now
        </button>
      )}
    </div>
  )
}
