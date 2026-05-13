export default function CTA() {
  return (
    <section className="border-t border-zinc-800/50 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 text-center">
        <h2 className="text-2xl font-bold text-zinc-100 sm:text-3xl lg:text-4xl">
          Start preventing failed deliveries today
        </h2>
        <p className="mt-3 text-sm text-zinc-500 max-w-sm mx-auto">
          No setup complexity. See value in under 2 minutes.
        </p>
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <a
            href="/onboarding"
            className="inline-flex items-center justify-center rounded-lg bg-purple-600 px-8 py-3 text-sm font-semibold text-white hover:bg-purple-500 transition-colors"
          >
            Start free
          </a>
          <a
            href="#how-it-works"
            className="inline-flex items-center justify-center rounded-lg border border-zinc-700 px-8 py-3 text-sm font-medium text-zinc-300 hover:bg-zinc-900 transition-colors"
          >
            See demo
          </a>
        </div>
      </div>
    </section>
  );
}
