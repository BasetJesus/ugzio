import type { OrdersPageData } from "@/types/order"
import { MiniKpiCard } from "@/components/shared/KpiCard"

interface Props {
  stats: OrdersPageData["stats"]
}

export default function OrdersHeader({ stats }: Props) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      <MiniKpiCard
        label="Total"
        value={stats.total}
      />
      <MiniKpiCard
        label="At Risk"
        value={stats.atRisk}
        tier={stats.atRisk > 0 ? "high" : "neutral"}
        emotion={stats.atRisk > 0 ? "tense" : "calm"}
      />
      <MiniKpiCard
        label="Pending"
        value={stats.pendingToday}
        tier={stats.pendingToday > 0 ? "medium" : "neutral"}
        emotion={stats.pendingToday > 0 ? "tense" : "calm"}
      />
      <MiniKpiCard
        label="Revenue"
        value={`${stats.revenueTotal.toFixed(1)} TND`}
        tier="low"
        emotion="protective"
      />
      <MiniKpiCard
        label="Delivered"
        value={`${stats.deliveredRate}%`}
        tier={stats.deliveredRate >= 70 ? "low" : stats.deliveredRate >= 50 ? "medium" : "high"}
        emotion={stats.deliveredRate >= 70 ? "protective" : stats.deliveredRate >= 50 ? "tense" : "tense"}
      />
    </div>
  )
}
