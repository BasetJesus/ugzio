export default function OperationsPreview() {
  return (
    <section className="border-t border-zinc-800/50 py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-zinc-100 sm:text-3xl">Your operations panel</h2>
          <p className="mt-2 text-sm text-zinc-500">What operators see when they log in</p>
        </div>

        <div className="mx-auto max-w-md rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 shadow-xl">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-semibold text-zinc-200">Today&apos;s Operations</h3>
            <span className="flex items-center gap-1 text-[10px] text-zinc-600">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
              Live
            </span>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-3">
              <div>
                <p className="text-[11px] font-medium text-red-400 uppercase tracking-wider">Revenue at risk</p>
                <p className="text-lg font-bold text-red-400 mt-0.5">$240.00</p>
              </div>
              <span className="text-[10px] text-zinc-500">3 high-risk orders</span>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900/30 px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-red-500" />
                  <span className="text-sm text-zinc-200">Ahmed B.</span>
                </div>
                <span className="text-xs text-red-400 font-medium">Risk 89%</span>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900/30 px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-amber-500" />
                  <span className="text-sm text-zinc-200">Sarra M.</span>
                </div>
                <span className="text-xs text-amber-400 font-medium">Risk 62%</span>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900/30 px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-red-500" />
                  <span className="text-sm text-zinc-200">Karim J.</span>
                </div>
                <span className="text-xs text-red-400 font-medium">Risk 78%</span>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs text-zinc-500 pt-2 border-t border-zinc-800/50">
              <span>Orders needing action: <strong className="text-zinc-200">6</strong></span>
              <span>High-risk: <strong className="text-red-400">3</strong></span>
            </div>

            <a
              href="/onboarding"
              className="block w-full rounded-lg bg-purple-600 px-4 py-2.5 text-center text-sm font-medium text-white hover:bg-purple-500 transition-colors"
            >
              Verify now
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
