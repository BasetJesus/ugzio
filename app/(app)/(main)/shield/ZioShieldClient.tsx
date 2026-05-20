"use client";

import { Package, ShieldAlert, Ban, CheckCircle, MessageSquare, AlertTriangle } from "lucide-react";
import { useState } from "react";
import MetricCard from "@/components/dashboard/MetricCard";
import type { RiskAlertItem, RecentRiskOrder, RiskAggregateStats } from "@/types/risk";

interface Props {
  alerts: RiskAlertItem[];
  aggregate: RiskAggregateStats;
  recentOrders: RecentRiskOrder[];
}

function getAlertMessage(signal: string, buyerName: string): string {
  const messages: Record<string, string> = {
    "first-time-order": `CAUTION: ${buyerName} is a first-time buyer with no history. Request prepayment or verify before shipping.`,
    "high-amount": `RISK: High-value order from ${buyerName}. Consider partial prepayment.`,
    "multiple-orders": `REPEAT FAILURE: ${buyerName} has failed deliveries in the past. Require full prepayment.`,
    "wilaya-risk": `ROUTE RISK: Delivery to ${buyerName}'s area has above-average RTS rate.`,
    "suspicious-phone": `SUSPICIOUS: Phone number pattern matches known bad actors. Verify identity before shipping.`,
  };
  return messages[signal] ?? `ALERT: ${buyerName} flagged by ZioShield. Review before shipping.`;
}

const SPARKLINES = {
  orders: [85, 92, 88, 105, 98, 110, 115, 108, 120, 125, 118, 130, 135, 140, 142],
  risk: [18, 25, 22, 30, 28, 35, 32, 28, 25, 30, 27, 23, 25, 22, 23],
  revenue: [320, 450, 380, 520, 490, 610, 580, 720, 680, 810, 950, 1050, 990, 1120, 1248],
  today: [45, 52, 48, 58, 62, 55, 68, 72, 65, 75, 80, 78, 82, 86, 89],
}

export default function ZioShieldClient({ alerts, aggregate, recentOrders }: Props) {
  const [localAlerts, setLocalAlerts] = useState(alerts);
  const [snackbar, setSnackbar] = useState<string | null>(null);

  const showSnackbar = (msg: string) => {
    setSnackbar(msg);
    setTimeout(() => setSnackbar(null), 3000);
  };

  const displayOrders = localAlerts.length > 0
    ? localAlerts
    : recentOrders.filter((o) => o.riskLevel === "high").slice(0, 10).map((o) => ({
        id: `alert_${o.id}`,
        buyerName: o.buyerName,
        buyerPhone: o.buyerPhone,
        amount: o.amount,
        riskLevel: o.riskLevel,
        trustScore: o.trustScore,
        signal: "first-time-order",
        orderId: o.id,
      }));

  const handleBlacklist = async (phone: string) => {
    try {
      const res = await fetch("/api/v1/zioshield/blacklist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      if (res.ok) {
        setLocalAlerts((prev) => prev.filter((a) => a.buyerPhone !== phone));
        showSnackbar("Phone blacklisted successfully");
      } else {
        showSnackbar("Failed to blacklist phone");
      }
    } catch {
      showSnackbar("Network error");
    }
  };

  const handleWhatsApp = (phone: string) => {
    window.open(`https://wa.me/${phone.replace(/^\+/, "")}?text=${encodeURIComponent("Hello, this is regarding your order.")}`, "_blank");
  };

  return (
    <div className="flex flex-col gap-5 p-6 sm:p-8" style={{ backgroundColor: "#0B0D12" }}>
      {/* ── KPI Row ── */}
      <div className="animate-fade-in-up" style={{ animationFillMode: "backwards" }}>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <MetricCard
            label="Total Orders"
            value={aggregate.totalOrders}
            change={0}
            icon={<Package size={16} color="#22C55E" />}
            variant="small"
            sparklineData={SPARKLINES.orders}
          />
          <MetricCard
            label="High Risk"
            value={aggregate.highRiskCount}
            change={0}
            icon={<ShieldAlert size={16} color="#EF4444" />}
            variant="small"
            invertColor
            sparklineData={SPARKLINES.risk}
          />
          <MetricCard
            label="Revenue at Risk"
            value={`${aggregate.revenueAtRisk.toLocaleString()} TND`}
            change={0}
            icon={<Ban size={16} color="#FFD700" />}
            variant="small"
            color="#FFD700"
            sparklineData={SPARKLINES.revenue}
          />
          <MetricCard
            label="Today Orders"
            value={aggregate.todayOrders}
            change={0}
            icon={<CheckCircle size={16} color="#FFD700" />}
            variant="small"
            color="#FFD700"
            sparklineData={SPARKLINES.today}
          />
        </div>
      </div>

      {/* ── Section 2: Flagged Orders ── */}
      <div
        className="animate-fade-in-up"
        style={{ animationDelay: "0.1s", animationFillMode: "backwards" }}
      >
        {displayOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center rounded-xl border" style={{ backgroundColor: "#161A23", borderColor: "rgba(255,255,255,0.06)" }}>
            <CheckCircle className="h-10 w-10 text-[#22C55E] mb-3" />
            <p className="text-sm" style={{ color: "#6B7280" }}>No high-risk orders detected. Your revenue is protected.</p>
          </div>
        ) : (
          <div className="space-y-3">
            <h3 className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "#6B7280" }}>
              Flagged Orders ({displayOrders.length})
            </h3>
            {displayOrders.map((order) => (
              <div
                key={order.id}
                className="rounded-xl border p-4 space-y-3"
                style={{ backgroundColor: "#161A23", borderColor: "rgba(255,255,255,0.06)" }}
              >
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold" style={{ color: "#6B7280" }}>#{order.orderId.slice(-6)}</span>
                      {order.riskLevel === "high" && <ShieldAlert className="h-3.5 w-3.5 text-[#EF4444]" />}
                    </div>
                    <h3 className="text-sm font-bold text-white truncate">{order.buyerName}</h3>
                    <p className="text-[11px]" style={{ color: "#6B7280" }}>{order.amount.toLocaleString()} TND · Trust: {order.trustScore}%</p>
                  </div>
                  <div className="text-right shrink-0 ml-3">
                    <span className="text-[9px] font-bold block tracking-wider uppercase" style={{ color: "#6B7280" }}>RISK</span>
                    <span className={`text-lg font-bold ${order.riskLevel === "high" ? "text-[#EF4444]" : "text-[#22C55E]"}`}>
                      {100 - order.trustScore}%
                    </span>
                  </div>
                </div>

                <div
                  className="rounded-lg border p-2.5 flex gap-2 items-start"
                  style={{ backgroundColor: "rgba(239,68,68,0.08)", borderColor: "rgba(239,68,68,0.2)" }}
                >
                  <AlertTriangle className="h-4 w-4 text-[#EF4444] shrink-0 mt-0.5" />
                  <p className="text-[11px] text-[#EF4444] leading-normal font-medium">
                    {getAlertMessage(order.signal, order.buyerName)}
                  </p>
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => handleWhatsApp(order.buyerPhone)}
                    className="flex-1 h-10 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1.5 active:scale-[0.97] transition-transform text-white"
                    style={{ backgroundColor: "#2A303C", border: "1px solid rgba(255,255,255,0.06)" }}
                  >
                    <MessageSquare className="h-3.5 w-3.5 text-[#FFD700]" />
                    WHATSAPP CONFIRM
                  </button>
                  <button
                    onClick={() => handleBlacklist(order.buyerPhone)}
                    className="h-10 px-3 rounded-lg text-[11px] font-bold active:scale-[0.97] transition-transform text-[#EF4444]"
                    style={{ backgroundColor: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.3)" }}
                  >
                    <Ban className="h-3.5 w-3.5 inline mr-1" />
                    BLACKLIST
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {snackbar && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 rounded-xl px-4 py-2.5 text-xs font-bold text-white shadow-lg z-50 animate-fade-in-up"
          style={{ backgroundColor: "#161A23", border: "1px solid rgba(255,255,255,0.06)" }}
        >
          {snackbar}
        </div>
      )}
    </div>
  );
}
