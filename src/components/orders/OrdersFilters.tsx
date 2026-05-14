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
        placeholder="Search customer, phone, or ID..."
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        className="w-full rounded-xl border border-white/10 bg-transparent px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none transition-colors focus:border-white/30"
        style={{ backgroundColor: "rgba(255,255,255,0.03)" }}
      />
      <div className="flex gap-2">
        <select
          value={statusFilter}
          onChange={(e) => onStatusFilterChange(e.target.value)}
          className="flex-1 min-w-0 rounded-xl border border-white/10 bg-transparent px-3 py-3 text-sm text-white outline-none transition-colors focus:border-white/30"
          style={{ backgroundColor: "rgba(255,255,255,0.03)" }}
        >
          <option value="" className="text-black">All Status</option>
          {STATUSES.map((s) => (
            <option key={s} value={s} className="text-black">{s}</option>
          ))}
        </select>
        <select
          value={riskFilter}
          onChange={(e) => onRiskFilterChange(e.target.value)}
          className="flex-1 min-w-0 rounded-xl border border-white/10 bg-transparent px-3 py-3 text-sm text-white outline-none transition-colors focus:border-white/30"
          style={{ backgroundColor: "rgba(255,255,255,0.03)" }}
        >
          <option value="" className="text-black">All Risk</option>
          {RISKS.map((r) => (
            <option key={r} value={r} className="text-black">{r.toUpperCase()}</option>
          ))}
        </select>
      </div>
    </div>
  )
}
