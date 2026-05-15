"use client"

interface Props {
  search: string
  onSearchChange: (v: string) => void
  statusFilter: string
  onStatusFilterChange: (v: string) => void
  riskFilter: string
  onRiskFilterChange: (v: string) => void
}

const STATUSES = ["CREATED", "PRE_SHIPPING_CONFIRM_SENT", "BUYER_CONFIRMED", "SHIPPED", "DELIVERED", "INTELLIGENT_CANCEL", "REFUSED"]
const RISKS = ["high", "medium", "low"]

export default function OrdersFilters({ search, onSearchChange, statusFilter, onStatusFilterChange, riskFilter, onRiskFilterChange }: Props) {
  return (
    <div className="space-y-2 mb-4">
      <input
        type="text"
        placeholder="Rechercher client, téléphone ou ID..."
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] outline-none transition-colors focus:border-[var(--accent)]/50"
      />
      <div className="flex gap-2">
        <select
          value={statusFilter}
          onChange={(e) => onStatusFilterChange(e.target.value)}
          className="flex-1 min-w-0 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-3 text-sm text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--accent)]/50"
        >
          <option value="">Tous les statuts</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <select
          value={riskFilter}
          onChange={(e) => onRiskFilterChange(e.target.value)}
          className="flex-1 min-w-0 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-3 text-sm text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--accent)]/50"
        >
          <option value="">Tous les risques</option>
          {RISKS.map((r) => (
            <option key={r} value={r}>{r.toUpperCase()}</option>
          ))}
        </select>
      </div>
    </div>
  )
}
