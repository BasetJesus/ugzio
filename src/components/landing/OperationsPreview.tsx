export default function OperationsPreview() {
  return (
    <section className="border-t border-[var(--nav-border)] py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-[var(--text-primary)] sm:text-3xl">Live Store Simulation Preview</h2>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">What you see when you enter simulation mode</p>
        </div>

        <div className="mx-auto max-w-md rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-6 shadow-lg">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">Boutique Sidi Bou Said</h3>
            <span className="flex items-center gap-1 text-[10px] text-[var(--text-tertiary)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--success-green)] animate-pulse" />
              Simulation
            </span>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border border-[var(--kpi-red-border)] bg-[var(--kpi-red-bg)] px-4 py-3">
              <div>
                <p className="text-[11px] font-medium text-[var(--risk-red)] uppercase tracking-wider">Revenue at risk</p>
                <p className="text-lg font-bold text-[var(--risk-red)] mt-0.5">1,020 TND</p>
              </div>
              <span className="text-[10px] text-[var(--text-tertiary)]">3 high-risk orders</span>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between rounded-lg border border-[var(--kpi-red-border)] bg-[var(--kpi-red-bg)] px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[var(--risk-red)] animate-pulse" />
                  <span className="text-sm text-[var(--text-primary)]">Amine K.</span>
                </div>
                <span className="text-xs text-[var(--risk-red)] font-medium">Risk 92%</span>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-[var(--kpi-red-border)] bg-[var(--kpi-red-bg)] px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[var(--risk-red)]" />
                  <span className="text-sm text-[var(--text-primary)]">Ahmed B.</span>
                </div>
                <span className="text-xs text-[var(--risk-red)] font-medium">Risk 89%</span>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-[var(--warning-amber-border)] bg-[var(--warning-amber-bg)] px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[var(--warning-amber)]" />
                  <span className="text-sm text-[var(--text-primary)]">Houssem R.</span>
                </div>
                <span className="text-xs text-[var(--warning-amber)] font-medium">Risk 85%</span>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs text-[var(--text-tertiary)] pt-2 border-t border-[var(--nav-border)]">
              <span>Orders needing action: <strong className="text-[var(--text-primary)]">6</strong></span>
              <span>High-risk: <strong className="text-[var(--risk-red)]">3</strong></span>
            </div>

            <a
              href="/overview?demo=true"
              className="block w-full rounded-lg bg-[var(--accent)] px-4 py-2.5 text-center text-sm font-medium text-white hover:bg-[var(--accent-hover)] transition-colors"
            >
              Enter Simulation Mode
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
