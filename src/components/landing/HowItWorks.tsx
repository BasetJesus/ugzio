export default function HowItWorks() {
  return (
    <section id="how-it-works" className="border-t border-[var(--nav-border)] py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold text-[var(--text-primary)] sm:text-3xl">How it works</h2>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">Three steps to stop losing money on deliveries</p>
        </div>

        <div className="grid gap-8 sm:grid-cols-3">
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--bg-surface)] text-sm font-bold text-[var(--text-tertiary)]">
              1
            </div>
            <h3 className="mt-4 text-base font-semibold text-[var(--text-primary)]">Add your store (or use demo)</h3>
            <p className="mt-2 text-sm text-[var(--text-secondary)] leading-relaxed">
              Connect your store or enter simulation mode instantly. No setup required.
            </p>
          </div>

          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--kpi-red-bg)] text-sm font-bold text-[var(--risk-red)]">
              2
            </div>
            <h3 className="mt-4 text-base font-semibold text-[var(--text-primary)]">UGZIO simulates your real orders</h3>
            <p className="mt-2 text-sm text-[var(--text-secondary)] leading-relaxed">
              Every order is scored by risk. High-risk orders surface immediately.
            </p>
          </div>

          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--accent)]/10 text-sm font-bold text-[var(--accent)]">
              3
            </div>
            <h3 className="mt-4 text-base font-semibold text-[var(--text-primary)]">You see risky deliveries before they fail</h3>
            <p className="mt-2 text-sm text-[var(--text-secondary)] leading-relaxed">
              Each order shows one action: confirm or cancel. No complex workflows.
            </p>
          </div>
        </div>

        <p className="mt-12 text-center text-sm text-[var(--text-tertiary)] border-t border-[var(--nav-border)] pt-8">
          Stop losing money on failed deliveries
        </p>
      </div>
    </section>
  );
}
