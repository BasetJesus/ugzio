export default function CTA() {
  return (
    <section className="border-t border-[var(--nav-border)] py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 text-center">
        <h2 className="text-2xl font-bold text-[var(--text-primary)] sm:text-3xl lg:text-4xl">
          Start seeing your store in real time.
        </h2>
        <p className="mt-3 text-sm text-[var(--text-secondary)] max-w-sm mx-auto">
          No setup. See risky orders instantly.
        </p>
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <a
            href="/overview?demo=true"
            className="inline-flex items-center justify-center rounded-lg bg-[var(--accent)] px-8 py-3 text-sm font-semibold text-white hover:bg-[var(--accent-hover)] transition-colors"
          >
            Start Simulation
          </a>
          <a
            href="/overview?demo=true"
            className="inline-flex items-center justify-center rounded-lg border border-[var(--border)] px-8 py-3 text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-surface)] transition-colors"
          >
            See Live Example
          </a>
        </div>
      </div>
    </section>
  );
}
