export default function Benefits() {
  return (
    <section className="border-t border-[var(--nav-border)] py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <h2 className="text-2xl font-bold text-center text-[var(--text-primary)] sm:text-3xl">
          What you get
        </h2>
        <p className="mt-2 text-sm text-[var(--text-secondary)] text-center">
          Outcomes, not features
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-5">
            <p className="text-2xl font-bold text-[var(--success-green)]">$0</p>
            <p className="mt-2 text-sm font-medium text-[var(--text-primary)]">Prevent failed deliveries</p>
            <p className="mt-1 text-xs text-[var(--text-secondary)]">Stop shipping orders that will never be paid for</p>
          </div>

          <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-5">
            <p className="text-2xl font-bold text-[var(--success-green)]">-70%</p>
            <p className="mt-2 text-sm font-medium text-[var(--text-primary)]">Reduce RTS losses</p>
            <p className="mt-1 text-xs text-[var(--text-secondary)]">Flag risky buyers before the courier picks up</p>
          </div>

          <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-5">
            <p className="text-2xl font-bold text-[var(--warning-amber)]">5s</p>
            <p className="mt-2 text-sm font-medium text-[var(--text-primary)]">Faster order decisions</p>
            <p className="mt-1 text-xs text-[var(--text-secondary)]">See which orders need action and what to do</p>
          </div>

          <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-5">
            <p className="text-2xl font-bold text-[var(--accent)]">1</p>
            <p className="mt-2 text-sm font-medium text-[var(--text-primary)]">Detect risky buyers</p>
            <p className="mt-1 text-xs text-[var(--text-secondary)]">Know who to avoid before shipping costs add up</p>
          </div>
        </div>
      </div>
    </section>
  );
}
