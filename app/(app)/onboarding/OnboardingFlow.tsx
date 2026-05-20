"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import PostRegistrationPopup from "@/components/onboarding/PostRegistrationPopup";

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
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    if (step !== "ready") return;
    const t = setTimeout(() => setShowPopup(true), 1200);
    return () => clearTimeout(t);
  }, [step]);

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

  return (
    <>
      {step === "setup" && (
        <div className="w-full max-w-[24rem]">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">UGZIO</h1>
            <p className="text-sm text-[var(--text-secondary)] mt-1">Protège ton revenu ecommerce</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="shopName" className="text-sm font-medium text-[var(--text-secondary)]">
                Nom de la boutique
              </label>
              <input
                id="shopName"
                type="text"
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                required
                placeholder="Ma Boutique"
                className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] px-4 py-2.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)] outline-none focus:border-[var(--accent)]"
              />
            </div>

            <div>
              <label htmlFor="sellerPhone" className="text-sm font-medium text-[var(--text-secondary)]">
                Numéro de téléphone
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
              {loading ? "Création de ta boutique..." : "Commencer"}
            </button>

            <p className="text-center text-[10px] text-[var(--text-tertiary)]">
              Des données d'exemple seront générées pour te montrer le fonctionnement
            </p>
          </form>
        </div>
      )}

      {step === "generating" && (
        <div className="w-full max-w-[24rem] text-center">
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Configuration de ta boutique</h1>
          <div className="mt-8 space-y-3 text-left">
            <div className="flex items-center gap-3 text-sm text-[var(--text-secondary)]">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--state-protected-bg)] text-[10px] text-[var(--success-green)]">✓</span>
              Organisation créée
            </div>
            <div className="flex items-center gap-3 text-sm text-[var(--text-secondary)]">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--state-protected-bg)] text-[10px] text-[var(--success-green)]">✓</span>
              Abonnement activé
            </div>
            <div className="flex items-center gap-3 text-sm text-[var(--text-secondary)]">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--state-calm-bg)] text-[10px] text-[var(--state-calm)] animate-pulse">•</span>
              Génération des commandes d'exemple...
            </div>
          </div>
        </div>
      )}

      {step === "ready" && (
        <div className="w-full max-w-[24rem] text-center">
          <div className="rounded-xl border border-[var(--success-green-border)] bg-[var(--state-protected-bg)] p-6">
            <p className="text-2xl mb-2">🎯</p>
            <h1 className="text-xl font-bold text-[var(--text-primary)]">Boutique prête</h1>
            <p className="text-sm text-[var(--text-secondary)] mt-1">Voici ce qu'on a préparé</p>

            <div className="mt-6 grid grid-cols-2 gap-3 text-left">
              <div className="rounded-lg bg-[var(--bg-card)] border border-[var(--border)] p-3">
                <p className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider">Commandes</p>
                <p className="text-lg font-bold text-[var(--text-primary)]">{sampleResult?.ordersCreated ?? 10}</p>
              </div>
              <div className="rounded-lg bg-[var(--bg-card)] border border-[var(--border)] p-3">
                <p className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider">En risque</p>
                <p className="text-lg font-bold text-[var(--risk-red)]">{sampleResult?.highRiskCount ?? 3}</p>
              </div>
            </div>

            <div className="mt-4 text-left space-y-2">
              <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                <span className="text-[var(--risk-red)]">!</span>
                <span>{sampleResult?.highRiskCount ?? 3} commandes à risque élevé nécessitent une vérification</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                <span className="text-[var(--warning-amber)]">$</span>
                <span>Revenu en risque détecté — vérifie dans les opérations</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                <span className="text-[var(--accent)]">→</span>
                <span>File de confirmation prête pour l'action</span>
              </div>
            </div>

            <button
              onClick={() => setShowPopup(true)}
              className="mt-6 inline-block w-full rounded-lg bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[var(--accent-hover)] transition-colors"
            >
              Voir les opérations
            </button>
            <p className="text-[10px] text-[var(--text-tertiary)] mt-2">Vois ce qui nécessite ton attention maintenant</p>
          </div>
        </div>
      )}

      <PostRegistrationPopup
        open={showPopup}
        onClose={() => {
          setShowPopup(false)
          router.push("/overview")
        }}
      />
    </>
  )
}
