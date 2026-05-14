import type { OrdersPageData } from "@/types/order"

interface Props {
  stats: OrdersPageData["stats"]
}

export default function OrdersHeader({ stats }: Props) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      <div className="rounded-xl border border-white/10 p-4" style={{ backgroundColor: "rgba(255,255,255,0.02)" }}>
        <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Total</p>
        <p className="text-lg font-bold text-white">{stats.total}</p>
      </div>
      <div className="rounded-xl border border-white/10 p-4" style={{ backgroundColor: "rgba(255,255,255,0.02)" }}>
        <p className="text-xs text-white/40 uppercase tracking-wider mb-1">At Risk</p>
        <p className="text-lg font-bold text-white" style={{ color: "#f87171" }}>{stats.atRisk}</p>
      </div>
      <div className="rounded-xl border border-white/10 p-4" style={{ backgroundColor: "rgba(255,255,255,0.02)" }}>
        <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Pending</p>
        <p className="text-lg font-bold text-white" style={{ color: "#fbbf24" }}>{stats.pendingToday}</p>
      </div>
      <div className="rounded-xl border border-white/10 p-4" style={{ backgroundColor: "rgba(255,255,255,0.02)" }}>
        <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Revenue</p>
        <p className="text-lg font-bold text-white" style={{ color: "#4ade80" }}>{stats.revenueTotal.toFixed(1)} TND</p>
      </div>
      <div className="rounded-xl border border-white/10 p-4" style={{ backgroundColor: "rgba(255,255,255,0.02)" }}>
        <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Delivered</p>
        <p className="text-lg font-bold text-white" style={{ color: "#4ade80" }}>{stats.deliveredRate}%</p>
      </div>
    </div>
  )
}
