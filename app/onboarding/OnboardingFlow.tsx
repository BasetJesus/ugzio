"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

interface Props {
  existingOrgId?: string;
}

type Step = "setup" | "generating" | "ready";

export default function OnboardingFlow({ existingOrgId }: Props) {
  const router = useRouter();
  const [step, setStep] = useState<Step>(existingOrgId ? "ready" : "setup");
  const [shopName, setShopName] = useState("");
  const [sellerPhone, setSellerPhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sampleResult, setSampleResult] = useState<{
    ordersCreated: number;
    highRiskCount: number;
  } | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/v1/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shopName, sellerPhone, generateSample: true }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Something went wrong");
        return;
      }

      const data = await res.json();
      setSampleResult(data.sampleData);
      setStep("generating");
      setLoading(false);

      setTimeout(() => {
        setStep("ready");
      }, 800);
    } catch {
      setError("Network error");
      setLoading(false);
    }
  }

  if (step === "setup") {
    return (
      <div className="w-full max-w-[24rem]">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">UGZIO</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">Commerce operations intelligence</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="shopName" className="text-sm font-medium text-[var(--text-secondary)]">
              Shop name
            </label>
            <input
              id="shopName"
              type="text"
              value={shopName}
              onChange={(e) => setShopName(e.target.value)}
              required
              placeholder="My Boutique"
              className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] px-4 py-2.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)] outline-none focus:border-[var(--accent)]"
            />
          </div>

          <div>
            <label htmlFor="sellerPhone" className="text-sm font-medium text-[var(--text-secondary)]">
              Phone number
            </label>
            <input
              id="sellerPhone"
              type="tel"
              value={sellerPhone}
              onChange={(e) => setSellerPhone(e.target.value)}
              required
              placeholder="+216 XX XXX XXX"
              className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] px-4 py-2.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)] outline-none focus:border-[var(--accent)]"
            />
          </div>

          {error && (
            <div className="rounded-lg border border-[var(--kpi-red-border)] bg-[var(--kpi-red-bg)] px-4 py-2 text-sm text-[var(--risk-red)]">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[var(--accent-hover)] disabled:opacity-50 transition-colors"
          >
            {loading ? "Creating your shop..." : "Start"}
          </button>

          <p className="text-center text-[10px] text-[var(--text-tertiary)]">
            Sample data will be generated to show you around
          </p>
        </form>
      </div>
    );
  }

  if (step === "generating") {
    return (
      <div className="w-full max-w-[24rem] text-center">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Setting up your shop</h1>
        <div className="mt-8 space-y-3 text-left">
          <div className="flex items-center gap-3 text-sm text-[var(--text-secondary)]">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--state-protected-bg)] text-[10px] text-[var(--success-green)]">✓</span>
            Organization created
          </div>
          <div className="flex items-center gap-3 text-sm text-[var(--text-secondary)]">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--state-protected-bg)] text-[10px] text-[var(--success-green)]">✓</span>
            Subscription activated
          </div>
          <div className="flex items-center gap-3 text-sm text-[var(--text-secondary)]">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--state-calm-bg)] text-[10px] text-[var(--state-calm)] animate-pulse">•</span>
            Generating sample orders...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[24rem] text-center">
      <div className="rounded-xl border border-[var(--success-green-border)] bg-[var(--state-protected-bg)] p-6">
        <p className="text-2xl mb-2">🎯</p>
        <h1 className="text-xl font-bold text-[var(--text-primary)]">Your shop is ready</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">Here&apos;s what we prepared</p>

        <div className="mt-6 grid grid-cols-2 gap-3 text-left">
          <div className="rounded-lg bg-[var(--bg-card)] border border-[var(--border)] p-3">
            <p className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider">Orders</p>
            <p className="text-lg font-bold text-[var(--text-primary)]">{sampleResult?.ordersCreated ?? 10}</p>
          </div>
          <div className="rounded-lg bg-[var(--bg-card)] border border-[var(--border)] p-3">
            <p className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider">At risk</p>
            <p className="text-lg font-bold text-[var(--risk-red)]">{sampleResult?.highRiskCount ?? 3}</p>
          </div>
        </div>

        <div className="mt-4 text-left space-y-2">
          <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
            <span className="text-[var(--risk-red)]">!</span>
            <span>{sampleResult?.highRiskCount ?? 3} high-risk orders need verification</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
            <span className="text-[var(--warning-amber)]">$</span>
            <span>Revenue at risk detected — review in operations</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
            <span className="text-[var(--accent)]">→</span>
            <span>Confirmation queue ready for action</span>
          </div>
        </div>

        <a
          href="/operations"
          className="mt-6 inline-block w-full rounded-lg bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[var(--accent-hover)] transition-colors"
        >
          Go to operations
        </a>
        <p className="text-[10px] text-[var(--text-tertiary)] mt-2">See what needs your attention right now</p>
      </div>
    </div>
  );
}
