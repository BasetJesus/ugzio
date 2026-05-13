"use client";

import { useState, useEffect, useMemo } from "react";

interface DemoOrder {
  name: string;
  amount: number;
  risk: number;
  status: string;
}

const ORDERS: DemoOrder[] = [
  { name: "Ahmed B.", amount: 240, risk: 89, status: "pending" },
  { name: "Sarra M.", amount: 180, risk: 62, status: "contacted" },
  { name: "Karim J.", amount: 320, risk: 78, status: "pending" },
  { name: "Fatma T.", amount: 95, risk: 28, status: "confirmed" },
  { name: "Amine K.", amount: 450, risk: 92, status: "pending" },
  { name: "Mariem L.", amount: 75, risk: 15, status: "delivered" },
  { name: "Youssef H.", amount: 210, risk: 71, status: "pending" },
  { name: "Nour S.", amount: 130, risk: 44, status: "contacted" },
  { name: "Houssem R.", amount: 380, risk: 85, status: "pending" },
  { name: "Lina Z.", amount: 60, risk: 12, status: "confirmed" },
  { name: "Skander M.", amount: 290, risk: 76, status: "pending" },
  { name: "Rania B.", amount: 160, risk: 55, status: "contacted" },
];

const RISK_COLORS: Record<string, string> = {
  high: "text-red-400",
  medium: "text-amber-400",
  low: "text-green-400",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "pending_confirmation",
  contacted: "contacted",
  confirmed: "confirmed",
  delivered: "delivered",
};

function riskLevel(score: number): string {
  if (score >= 70) return "high";
  if (score >= 40) return "medium";
  return "low";
}

export default function LiveDemo() {
  const [highlightIdx, setHighlightIdx] = useState(0);
  const [revenueJitter, setRevenueJitter] = useState(1100);

  const highRisk = useMemo(() => ORDERS.filter((o) => o.risk >= 70), []);

  useEffect(() => {
    const timer = setInterval(() => {
      setHighlightIdx((prev) => (prev + 1) % highRisk.length);
    }, 3500);
    return () => clearInterval(timer);
  }, [highRisk.length]);

  useEffect(() => {
    const iv = setInterval(() => {
      const delta = Math.floor(Math.random() * 60 - 30);
      setRevenueJitter((prev) => Math.max(800, prev + delta));
    }, 4000 + Math.random() * 3000);
    return () => clearInterval(iv);
  }, []);

  const atRiskTotal = ORDERS.filter((o) => o.risk >= 70).reduce((s, o) => s + o.amount, 0);

  return (
    <section className="border-t border-zinc-800/50 py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <p className="text-xs font-medium uppercase tracking-widest text-zinc-500 text-center mb-2">Live store simulation</p>
        <h2 className="text-2xl font-bold text-center text-zinc-100 sm:text-3xl">
          What a Tunisian store looks like right now
        </h2>
        <p className="mt-2 text-sm text-zinc-500 text-center max-w-md mx-auto">
          Orders are simulated in real time. Risk is calculated before delivery.
        </p>

        <div className="mt-10 max-w-2xl mx-auto">
          <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 mb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-red-400 uppercase tracking-wider">At risk today</p>
                <p className="text-2xl font-bold text-red-400 mt-0.5">{revenueJitter} TND</p>
              </div>
              <span className="text-xs text-zinc-500">
                {ORDERS.filter((o) => o.risk >= 70).length} high-risk orders
              </span>
            </div>
          </div>

          <div className="space-y-1.5">
            {ORDERS.map((order, idx) => {
              const rl = riskLevel(order.risk);
              const isHighlighted = highRisk[highlightIdx]?.name === order.name && rl === "high";

              return (
                <div
                  key={`${order.name}-${idx}`}
                  className={`flex items-center justify-between rounded-lg border px-4 py-2.5 transition-all duration-700 ${
                    isHighlighted
                      ? "border-red-500/30 bg-red-500/10"
                      : "border-zinc-800 bg-zinc-900/30"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className={`h-2 w-2 shrink-0 rounded-full ${
                      rl === "high" ? "bg-red-500" : rl === "medium" ? "bg-amber-500" : "bg-green-500"
                    } ${isHighlighted ? "animate-pulse" : ""}`} />
                    <span className="text-sm text-zinc-200 truncate">{order.name}</span>
                    <span className="text-[11px] text-zinc-600">{order.amount} TND</span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className={`text-xs font-medium ${RISK_COLORS[rl] || "text-zinc-400"}`}>
                      {order.risk}%
                    </span>
                    <span className="text-[10px] text-zinc-600 hidden sm:inline">{STATUS_LABELS[order.status]}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 flex items-center justify-between text-xs text-zinc-500">
            <span><strong className="text-zinc-200">{ORDERS.length}</strong> total orders</span>
            <span>High risk: <strong className="text-red-400">{highRisk.length}</strong></span>
            <span>At risk: <strong className="text-red-400">{atRiskTotal.toFixed(0)} TND</strong></span>
          </div>
        </div>
      </div>
    </section>
  );
}
