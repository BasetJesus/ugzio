import Hero from "@/components/landing/Hero";
import Problems from "@/components/landing/HowItWorks";
import InteractiveDemo from "@/components/landing/LiveDemo";
import BehavioralIntelligence from "@/components/landing/BehavioralIntelligence";
import SocialEnergy from "@/components/landing/OperationsPreview";
import TrustMetrics from "@/components/landing/Benefits";
import FinalCTA from "@/components/landing/CTA";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-dvh">
      <nav className="sticky top-0 z-50 border-b border-[var(--nav-border)] bg-[var(--nav-bg)] backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <span className="text-sm font-bold tracking-tight gradient-behavioral">UGZIO</span>
          <a
            href="/overview?demo=true"
            className="rounded-lg glass-strong px-3 py-1.5 text-xs font-medium text-[var(--text-primary)] hover:text-white transition-colors"
          >
            Live Simulation
          </a>
        </div>
      </nav>
      <main className="flex-1">
        <Hero />
        <Problems />
        <InteractiveDemo />
        <BehavioralIntelligence />
        <SocialEnergy />
        <TrustMetrics />
        <FinalCTA />
      </main>
      <footer className="border-t border-[var(--nav-border)] py-6">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 text-center">
          <p className="text-xs text-[var(--text-tertiary)]">
            UGZIO &mdash; behavioral revenue protection for COD-first DTC commerce
          </p>
        </div>
      </footer>
    </div>
  );
}
