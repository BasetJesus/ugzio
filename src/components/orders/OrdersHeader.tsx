import type { OrdersPageData } from "@/types/order"

interface Props {
  stats: OrdersPageData["stats"]
}

const STAT_ICONS: Record<string, string> = {
  total: "\u25CF",
  atRisk: "\u25C6",
  pendingToday: "\u25B8",
  revenue: "\u25A0",
  delivered: "\u25CB",
}

export default function OrdersHeader({ stats }: Props) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
      <StatCard icon={STAT_ICONS.total} label="Total Orders" value={stats.total} color="var(--text-secondary)" />
      <StatCard icon={STAT_ICONS.atRisk} label="At Risk" value={stats.atRisk} color="var(--risk-red)" />
      <StatCard icon={STAT_ICONS.pendingToday} label="Pending Today" value={stats.pendingToday} color="var(--warning-amber)" />
      <StatCard icon={STAT_ICONS.revenue} label="Revenue" value={`${stats.revenueTotal.toFixed(1)} TND`} color="var(--success-green)" />
      <StatCard icon={STAT_ICONS.delivered} label="Delivered" value={`${stats.deliveredRate}%`} color="var(--success-green)" />
    </div>
  )
}

function StatCard({ icon, label, value, color }: { icon: string; label: string; value: string | number; color: string }) {
  return (
    <div className="rounded-xl bg-[var(--bg-card)] border border-[var(--border)] p-4">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-sm" style={{ color }}>{icon}</span>
        <p className="text-caption text-[var(--text-tertiary)]">{label}</p>
      </div>
      <p className="text-display text-[var(--text-primary)]">{value}</p>
    </div>
  )
}
