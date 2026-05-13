export default function Benefits() {
  return (
    <section className="border-t border-zinc-800/50 py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <h2 className="text-2xl font-bold text-center text-zinc-100 sm:text-3xl">
          What you get
        </h2>
        <p className="mt-2 text-sm text-zinc-500 text-center">
          Outcomes, not features
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-5">
            <p className="text-2xl font-bold text-green-400">$0</p>
            <p className="mt-2 text-sm font-medium text-zinc-200">Prevent failed deliveries</p>
            <p className="mt-1 text-xs text-zinc-500">Stop shipping orders that will never be paid for</p>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-5">
            <p className="text-2xl font-bold text-green-400">-70%</p>
            <p className="mt-2 text-sm font-medium text-zinc-200">Reduce RTS losses</p>
            <p className="mt-1 text-xs text-zinc-500">Flag risky buyers before the courier picks up</p>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-5">
            <p className="text-2xl font-bold text-amber-400">5s</p>
            <p className="mt-2 text-sm font-medium text-zinc-200">Faster order decisions</p>
            <p className="mt-1 text-xs text-zinc-500">See which orders need action and what to do</p>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-5">
            <p className="text-2xl font-bold text-purple-400">1</p>
            <p className="mt-2 text-sm font-medium text-zinc-200">Detect risky buyers</p>
            <p className="mt-1 text-xs text-zinc-500">Know who to avoid before shipping costs add up</p>
          </div>
        </div>
      </div>
    </section>
  );
}
