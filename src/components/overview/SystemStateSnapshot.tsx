import type { SystemState } from "@/services/system-state.service";

export default function SystemStateSnapshot({ state }: { state: SystemState }) {
  return (
    <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px]">
      <div className="rounded-lg bg-zinc-900/30 border border-zinc-800/50 p-3">
        <p className="text-zinc-500 uppercase tracking-wider">Total Orders</p>
        <p className="text-lg font-bold text-zinc-100 mt-0.5">{state.totalOrders}</p>
      </div>
      <div className="rounded-lg bg-zinc-900/30 border border-zinc-800/50 p-3">
        <p className="text-zinc-500 uppercase tracking-wider">Flagged</p>
        <p className="text-lg font-bold text-red-400 mt-0.5">{state.flaggedOrders}</p>
      </div>
      <div className="rounded-lg bg-zinc-900/30 border border-zinc-800/50 p-3">
        <p className="text-zinc-500 uppercase tracking-wider">Avg Risk Score</p>
        <p className="text-lg font-bold text-zinc-100 mt-0.5">{state.riskTrend.averageScore}</p>
      </div>
      <div className="rounded-lg bg-zinc-900/30 border border-zinc-800/50 p-3">
        <p className="text-zinc-500 uppercase tracking-wider">Events Logged</p>
        <p className="text-lg font-bold text-zinc-100 mt-0.5">{state.eventCount}</p>
      </div>
      {state.ordersByStatus.length > 0 && (
        <div className="rounded-lg bg-zinc-900/30 border border-zinc-800/50 p-3 col-span-2 sm:col-span-4">
          <p className="text-zinc-500 uppercase tracking-wider mb-2">Orders by Status</p>
          <div className="flex flex-wrap gap-2">
            {state.ordersByStatus.map((s) => (
              <span key={s.status} className="inline-flex items-center gap-1 rounded-full bg-zinc-800 px-2.5 py-0.5 text-[10px] font-medium text-zinc-300">
                {s.status}
                <span className="text-zinc-500">{s.count}</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
