export default function Hero() {
  return (
    <section className="mx-auto max-w-6xl px-4 pt-20 pb-16 sm:px-6 sm:pt-28 sm:pb-20">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-red-500/20 bg-red-500/5 px-3 py-1 text-xs font-medium text-red-400 mb-6">
            <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
            Real-time risk detection
          </div>
          <h1 className="text-3xl font-bold leading-tight tracking-tight text-zinc-100 sm:text-4xl lg:text-5xl">
            Stop losing money on failed deliveries before they happen.
          </h1>
          <p className="mt-4 text-base leading-relaxed text-zinc-400 sm:text-lg">
            UGZIO detects risky orders, confirms customers, and helps prevent Return-to-Sender losses in real time.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href="/onboarding"
              className="inline-flex items-center justify-center rounded-lg bg-purple-600 px-6 py-3 text-sm font-semibold text-white hover:bg-purple-500 transition-colors"
            >
              Start protecting orders
            </a>
            <a
              href="#how-it-works"
              className="inline-flex items-center justify-center rounded-lg border border-zinc-700 px-6 py-3 text-sm font-medium text-zinc-300 hover:bg-zinc-900 transition-colors"
            >
              Watch demo
            </a>
          </div>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-red-500" />
              <span className="text-xs font-medium text-zinc-400">Order #1042</span>
            </div>
            <span className="inline-flex items-center rounded-full border border-red-500/20 bg-red-500/10 px-2 py-0.5 text-[10px] font-semibold text-red-400">
              HIGH RISK
            </span>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500">Customer</span>
              <span className="text-zinc-200 font-medium">Ahmed B.</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500">Amount</span>
              <span className="text-zinc-200 font-medium">$78.00</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500">Risk score</span>
              <span className="text-red-400 font-bold">89%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500">Revenue at risk</span>
              <span className="text-amber-400 font-bold">$78.00</span>
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button className="flex-1 rounded-lg bg-purple-600 px-3 py-2 text-xs font-medium text-white hover:bg-purple-500 transition-colors">
              Verify
            </button>
            <button className="flex-1 rounded-lg border border-red-500/30 px-3 py-2 text-xs font-medium text-red-400 hover:bg-red-500/10 transition-colors">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
