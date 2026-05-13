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
    <div className="flex flex-wrap items-center gap-2 mb-3">
      <input
        type="text"
        placeholder="Search customer, phone, or ID..."
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        className="flex-1 min-w-[160px] rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-1.5 text-xs text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] outline-none focus:border-[var(--accent)] transition-colors"
      />
      <select
        value={statusFilter}
        onChange={(e) => onStatusFilterChange(e.target.value)}
        className="rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] px-2 py-1.5 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--accent)] transition-colors"
      >
        <option value="">All Status</option>
        {STATUSES.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>
      <select
        value={riskFilter}
        onChange={(e) => onRiskFilterChange(e.target.value)}
        className="rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] px-2 py-1.5 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--accent)] transition-colors"
      >
        <option value="">All Risk</option>
        {RISKS.map((r) => (
          <option key={r} value={r}>{r.toUpperCase()}</option>
        ))}
      </select>
    </div>
  )
}
