import type { OrdersPageData } from "@/types/order"

interface Props {
  stats: OrdersPageData["stats"]
}

export default function OrdersHeader({ stats }: Props) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
      <StatCard icon="📦" label="Total Orders" value={stats.total} />
      <StatCard icon="⚠️" label="At Risk" value={stats.atRisk} />
      <StatCard icon="🕐" label="Pending Today" value={stats.pendingToday} />
      <StatCard icon="💰" label="Revenue" value={`${stats.revenueTotal.toFixed(1)} TND`} />
      <StatCard icon="✅" label="Delivered" value={`${stats.deliveredRate}%`} />
    </div>
  )
}

function StatCard({ icon, label, value }: { icon: string; label: string; value: string | number }) {
  return (
    <div className="rounded-xl bg-zinc-900/50 border border-zinc-800 p-4">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-lg">{icon}</span>
        <p className="text-xs text-zinc-500 font-medium">{label}</p>
      </div>
      <p className="text-2xl font-bold text-zinc-100">{value}</p>
    </div>
  )
}
