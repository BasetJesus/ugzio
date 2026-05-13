export default function FinalCTA() {
  return (
    <section className="py-24 sm:py-32 relative overflow-hidden">
      <div className="absolute inset-0 gradient-accent-bg opacity-30" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-[var(--accent)]/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 text-center">
        <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 mb-6">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--success-green)] animate-pulse-soft" />
          <span className="text-[11px] font-medium text-[var(--text-secondary)] tracking-wide">
            Behavioral commerce is here
          </span>
        </div>

        <h2 className="text-2xl font-bold text-[var(--text-primary)] sm:text-3xl lg:text-4xl max-w-xl mx-auto">
          Join the future of{" "}
          <span className="gradient-behavioral">behavioral commerce</span>
        </h2>

        <p className="mt-3 text-sm text-[var(--text-secondary)] max-w-md mx-auto">
          UGZIO is the operational intelligence layer for modern DTC commerce. 
          Protect your COD revenue before it disappears.
        </p>

        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <a
            href="/overview?demo=true"
            className="inline-flex items-center justify-center rounded-lg bg-[var(--accent)] px-8 py-3 text-sm font-semibold text-white hover:bg-[var(--accent-hover)] transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            Experience Live Simulation
          </a>
          <a
            href="#problems"
            className="inline-flex items-center justify-center rounded-lg glass-strong px-8 py-3 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            See how it works
          </a>
        </div>

        <div className="mt-10 flex items-center justify-center gap-8 text-xs text-[var(--text-tertiary)]">
          <span className="flex items-center gap-1.5">
            <span className="text-[var(--success-green)]">\u2713</span> No credit card
          </span>
          <span className="flex items-center gap-1.5">
            <span className="text-[var(--success-green)]">\u2713</span> Instant demo
          </span>
          <span className="flex items-center gap-1.5">
            <span className="text-[var(--success-green)]">\u2713</span> Free tier available
          </span>
        </div>
      </div>
    </section>
  )
}
