"use client";

import { useState } from "react";

interface Stats {
  ordersProtected: number
  revenueSaved: number
  rtsBefore: number
  rtsAfter: number
  highRiskBlocked: number
  verificationRate: number
}

export default function SuccessCards({ stats }: { stats: Stats }) {
  const [copied, setCopied] = useState(false);

  const cards = [
    { label: "Orders Protected", value: stats.ordersProtected, icon: "🛡️" },
    { label: "Revenue Saved", value: `${stats.revenueSaved} TND`, icon: "💰" },
    { label: "RTS Reduced", value: `${stats.rtsBefore}% → ${stats.rtsAfter}%`, icon: "📉" },
    { label: "High-Risk Blocked", value: stats.highRiskBlocked, icon: "🚫" },
    { label: "Verification Success", value: `${stats.verificationRate}%`, icon: "✅" },
  ];

  const shareText = `UGZIO a protégé ${stats.ordersProtected} commandes ce mois.
RTS réduit de ${stats.rtsBefore}% → ${stats.rtsAfter}%.
💰 ${stats.revenueSaved} TND économisés.
#UGZIO #Tunisia #Ecommerce`;

  async function handleShare() {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5"
          >
            <p className="text-2xl">{card.icon}</p>
            <p className="mt-3 text-2xl font-bold tracking-tight text-emerald-400">{card.value}</p>
            <p className="mt-1 text-xs font-medium text-zinc-500">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
        <p className="mb-3 text-sm font-semibold text-zinc-300">Partagez vos résultats</p>
        <div className="rounded-lg bg-zinc-950 p-4 text-sm text-zinc-400 whitespace-pre-line">
          {shareText}
        </div>
        <button
          onClick={handleShare}
          className="mt-3 rounded-xl bg-emerald-500 px-6 py-3 font-semibold text-white transition hover:bg-emerald-400"
        >
          {copied ? "Copié! ✓" : "Copier et partager"}
        </button>
      </div>
    </div>
  );
}
