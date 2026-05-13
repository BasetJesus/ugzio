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
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card) => (
          <div key={card.label}>
            <p className="text-2xl">{card.icon}</p>
            <p className="mt-2 text-2xl font-bold tracking-tight text-orange-400">{card.value}</p>
            <p className="mt-1 text-xs font-medium text-zinc-500">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="border-t border-zinc-800/40 pt-6">
        <p className="mb-3 text-sm font-semibold text-zinc-300">Partagez vos résultats</p>
        <div className="rounded-md bg-zinc-900/30 p-4 text-sm text-zinc-400 whitespace-pre-line">
          {shareText}
        </div>
        <button
          onClick={handleShare}
          className="mt-3 rounded-md bg-orange-500 px-6 py-2.5 font-semibold text-white transition hover:bg-orange-400"
        >
          {copied ? "Copié! ✓" : "Copier et partager"}
        </button>
      </div>
    </div>
  );
}
