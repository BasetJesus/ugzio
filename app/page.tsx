import Hero from "@/components/landing/Hero";
import LiveDemo from "@/components/landing/LiveDemo";
import HowItWorks from "@/components/landing/HowItWorks";
import Benefits from "@/components/landing/Benefits";
import OperationsPreview from "@/components/landing/OperationsPreview";
import CTA from "@/components/landing/CTA";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-dvh">
      <nav className="sticky top-0 z-50 border-b border-[var(--nav-border)] bg-[var(--nav-bg)] backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <span className="text-sm font-bold tracking-tight text-[var(--text-primary)]">UGZIO</span>
          <a
            href="/overview?demo=true"
            className="rounded-lg bg-[var(--accent)] px-3 py-1.5 text-xs font-medium text-white hover:bg-[var(--accent-hover)] transition-colors"
          >
            Try live simulation
          </a>
        </div>
      </nav>
      <main className="flex-1">
        <Hero />
        <LiveDemo />
        <HowItWorks />
        <Benefits />
        <OperationsPreview />
        <CTA />
      </main>
      <footer className="border-t border-[var(--nav-border)] py-6">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <p className="text-center text-xs text-[var(--text-tertiary)]">UGZIO &mdash; live risk simulation for DTC sellers</p>
        </div>
      </footer>
    </div>
  );
}
