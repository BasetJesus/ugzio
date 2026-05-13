import type { TodayOperations, CriticalAction, OrderNeedingAttention } from "@/services/operations.service";

const PRIORITY_COLORS: Record<string, string> = {
  critical: "bg-red-500/10 text-red-400 border-red-500/20",
  high: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  medium: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
};

const ACTION_LABELS: Record<string, string> = {
  verify: "Verify",
  contact: "Contact",
  review: "Review",
  flag: "Flag",
  collect_ugc: "Request UGC",
};

function PriorityBadge({ priority }: { priority: string }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${PRIORITY_COLORS[priority] || PRIORITY_COLORS.medium}`}>
      {priority === "critical" && "!"}
      {priority}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span className="inline-flex items-center rounded-full bg-zinc-800 px-2 py-0.5 text-[10px] font-medium text-zinc-400">
      {status.replace(/_/g, " ")}
    </span>
  );
}

function ActionCard({ action }: { action: CriticalAction }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <PriorityBadge priority={action.priority} />
          <StatusBadge status={action.type} />
        </div>
        <p className="text-sm font-medium text-zinc-100 truncate">{action.buyerName}</p>
        <p className="text-xs text-zinc-500 mt-0.5">{action.reason}</p>
        <p className="text-xs text-zinc-600 mt-0.5">{action.amount.toFixed(0)} TND</p>
      </div>
      <a
        href={action.actionHref}
        className="shrink-0 rounded-lg bg-purple-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-purple-500 transition-colors"
      >
        {action.actionLabel}
      </a>
    </div>
  );
}

function AttentionRow({ order }: { order: OrderNeedingAttention }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-zinc-800/50 bg-zinc-900/20 px-4 py-3">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-zinc-200 truncate">{order.buyerName}</p>
          <StatusBadge status={order.status} />
          {order.riskLevel === "high" && (
            <span className="text-[10px] font-medium text-red-400">High risk</span>
          )}
        </div>
        <p className="text-xs text-zinc-500 mt-0.5">{order.reason}</p>
      </div>
      <div className="text-right shrink-0">
        <p className="text-sm font-medium text-zinc-100">{order.amount.toFixed(0)} TND</p>
        <a
          href={`/orders/${order.orderId}`}
          className="text-[10px] text-purple-400 hover:text-purple-300 transition-colors"
        >
          View order
        </a>
      </div>
    </div>
  );
}

export default function TodayOperationsPanel({ data }: { data: TodayOperations }) {
  const { criticalActions, revenueAtRisk, ordersNeedingAttention, summary } = data;

  return (
    <div className="space-y-6">

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
          <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">Orders today</p>
          <p className="mt-1 text-2xl font-bold text-zinc-100">{summary.totalOrdersToday}</p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
          <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">Revenue today</p>
          <p className="mt-1 text-2xl font-bold text-green-400">{summary.revenueToday.toFixed(0)} TND</p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
          <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">Pending verif.</p>
          <p className="mt-1 text-2xl font-bold text-amber-400">{summary.pendingVerifications}</p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
          <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">UGC opportunities</p>
          <p className="mt-1 text-2xl font-bold text-purple-400">{summary.ugcOpportunities}</p>
        </div>
      </div>

      {revenueAtRisk.highRiskOrderCount > 0 && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-red-400 uppercase tracking-wider">Revenue at risk</p>
              <p className="mt-1 text-2xl font-bold text-red-400">
                {revenueAtRisk.totalAtRisk.toFixed(0)} TND
              </p>
              <p className="text-xs text-zinc-500 mt-0.5">
                Across {revenueAtRisk.highRiskOrderCount} high-risk orders &middot; Est. loss {revenueAtRisk.estimatedLoss.toFixed(0)} TND
              </p>
            </div>
            <a
              href="/shield"
              className="rounded-lg bg-red-500/10 border border-red-500/30 px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500/20 transition-colors"
            >
              Review all
            </a>
          </div>
        </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-zinc-200">What needs your attention now</h2>
          {criticalActions.length > 0 && (
            <span className="text-[10px] text-zinc-500">{criticalActions.length} action{criticalActions.length !== 1 ? "s" : ""}</span>
          )}
        </div>
        {criticalActions.length > 0 ? (
          <div className="space-y-2">
            {criticalActions.map((action) => (
              <ActionCard key={action.id} action={action} />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-6 text-center">
            <p className="text-sm text-zinc-500">No critical actions right now</p>
            <p className="text-xs text-zinc-600 mt-1">All orders are flowing normally</p>
          </div>
        )}
      </div>

      {ordersNeedingAttention.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-zinc-200 mb-3">Orders needing attention</h2>
          <div className="space-y-2">
            {ordersNeedingAttention.map((order) => (
              <AttentionRow key={order.orderId} order={order} />
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
