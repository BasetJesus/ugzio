"use client";

import { useState, useEffect } from "react";

const CARDS = [
  {
    id: "ord_001",
    label: "High Risk Order",
    metric: "Risk 89%",
    amount: "$78.00",
    variant: "high" as const,
  },
  {
    id: "ord_002",
    label: "Pending Confirmation",
    metric: "2 orders",
    amount: "$240.00",
    variant: "medium" as const,
  },
  {
    id: "ord_003",
    label: "Revenue at Risk",
    metric: "Today total",
    amount: "$240.00",
    variant: "danger" as const,
  },
];

export default function LiveDemo() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActive((prev) => (prev + 1) % CARDS.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="border-t border-zinc-800/50 py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <p className="text-xs font-medium uppercase tracking-widest text-zinc-500 text-center mb-2">Live system</p>
        <h2 className="text-2xl font-bold text-center text-zinc-100 sm:text-3xl">
          See what UGZIO detects right now
        </h2>
        <p className="mt-2 text-sm text-zinc-500 text-center max-w-md mx-auto">
          Orders are analyzed in real time. Risk is calculated before shipping.
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {CARDS.map((card, idx) => {
            const isActive = idx === active;
            return (
              <div
                key={card.id}
                className={`rounded-xl border p-5 transition-all duration-700 ${
                  isActive
                    ? "border-purple-500/30 bg-purple-500/5 shadow-lg shadow-purple-500/5"
                    : "border-zinc-800 bg-zinc-900/30"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-zinc-200">{card.label}</span>
                  {isActive && <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />}
                </div>
                <p className="text-xs text-zinc-500">{card.metric}</p>
                <p className={`text-2xl font-bold mt-1 ${
                  card.variant === "danger" ? "text-red-400" : card.variant === "high" ? "text-amber-400" : "text-zinc-100"
                }`}>
                  {card.amount}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
