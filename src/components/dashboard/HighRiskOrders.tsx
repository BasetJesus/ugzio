"use client"

import Link from "next/link"
import { useState } from "react"
import { Send, Ellipsis, BadgeCheck } from "lucide-react"
import RiskScore from "@/components/shared/RiskScore"

/* ── Types ── */

export interface HighRiskOrderCustomer {
  name: string
  phone: string
  initial: string
  verified: boolean
}

export interface HighRiskOrder {
  id: string
  orderRef: string
  customer: HighRiskOrderCustomer
  riskScore: number
  riskSignals: string[]
  amount: number
  currency: string
  timeLabel: string
  timeDetail: string
  status: "to_confirm" | "confirmed"
}

/* ── Mock data ── */

const MOCK_ORDERS: HighRiskOrder[] = [
  {
    id: "1",
    orderRef: "#ZIO-7821",
    customer: { name: "Youssef M.", phone: "+216 50 123 456", initial: "Y", verified: true },
    riskScore: 84,
    riskSignals: ["New phone", "First order", "Wilaya mismatch"],
    amount: 89000,
    currency: "DTN",
    timeLabel: "Today, 10:24",
    timeDetail: "10 min ago",
    status: "to_confirm",
  },
  {
    id: "2",
    orderRef: "#ZIO-7790",
    customer: { name: "Ahmed K.", phone: "+216 55 987 654", initial: "A", verified: false },
    riskScore: 76,
    riskSignals: ["High amount", "Multiple failed"],
    amount: 124500,
    currency: "DTN",
    timeLabel: "Today, 09:52",
    timeDetail: "42 min ago",
    status: "to_confirm",
  },
  {
    id: "3",
    orderRef: "#ZIO-7765",
    customer: { name: "Mariem B.", phone: "+216 26 456 789", initial: "M", verified: true },
    riskScore: 65,
    riskSignals: ["Medium amount", "New address"],
    amount: 45000,
    currency: "DTN",
    timeLabel: "Today, 08:30",
    timeDetail: "2h ago",
    status: "confirmed",
  },
  {
    id: "4",
    orderRef: "#ZIO-7732",
    customer: { name: "Karim J.", phone: "+216 98 765 432", initial: "K", verified: false },
    riskScore: 92,
    riskSignals: ["Blacklisted phone", "Suspicious wilaya", "High velocity"],
    amount: 210000,
    currency: "DTN",
    timeLabel: "Yesterday, 22:15",
    timeDetail: "12h ago",
    status: "to_confirm",
  },
  {
    id: "5",
    orderRef: "#ZIO-7710",
    customer: { name: "Nadia F.", phone: "+216 23 111 222", initial: "N", verified: true },
    riskScore: 58,
    riskSignals: ["First order", "COD amount high"],
    amount: 33500,
    currency: "DTN",
    timeLabel: "Yesterday, 18:40",
    timeDetail: "16h ago",
    status: "to_confirm",
  },
  {
    id: "6",
    orderRef: "#ZIO-7689",
    customer: { name: "Sami R.", phone: "+216 29 333 444", initial: "S", verified: true },
    riskScore: 81,
    riskSignals: ["Repeat suspicious", "Address anomaly"],
    amount: 176000,
    currency: "DTN",
    timeLabel: "Yesterday, 14:00",
    timeDetail: "20h ago",
    status: "confirmed",
  },
]

/* ── Helpers ── */

function riskLabel(score: number): string {
  if (score >= 75) return "High Risk"
  if (score >= 50) return "Medium Risk"
  return "Low Risk"
}

function riskColor(score: number): string {
  if (score >= 75) return "#EF4444"
  if (score >= 50) return "#F97316"
  return "#EAB308"
}

function formatAmount(n: number): string {
  return n.toLocaleString("fr-FR", { minimumFractionDigits: 3, maximumFractionDigits: 3 })
}

/* ── Component ── */

interface HighRiskOrdersProps {
  orders?: HighRiskOrder[]
}

export default function HighRiskOrders({ orders = MOCK_ORDERS }: HighRiskOrdersProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null)

  return (
    <div
      className="rounded-xl border p-5"
      style={{ backgroundColor: "#161A23", borderColor: "rgba(255,255,255,0.06)" }}
    >
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <h3 className="text-[15px] font-bold text-white">High Risk Orders</h3>
          <span
            className="flex min-w-5 h-5 items-center justify-center rounded-full bg-[#FFD700] px-1.5 text-[10px] font-bold text-[#0B0D12]"
          >
            {orders.length}
          </span>
        </div>
        <Link
          href="/orders"
          className="text-[12px] font-medium transition-opacity hover:opacity-80"
          style={{ color: "#FFD700" }}
        >
          View all &rsaquo;
        </Link>
      </div>

      {/* ── Scrollable table ── */}
      <div className="overflow-x-auto -mx-1">
        <div className="min-w-[600px]">
        {/* ── Column headers ── */}
        <div
          className="grid grid-cols-[1fr_1.5fr_1fr_0.8fr_1.2fr] gap-3 pb-2 mb-1"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
        >
          {["Order", "Customer", "Risk Score", "Amount", "Action"].map((h) => (
            <span
              key={h}
              className="text-[11px] font-medium uppercase tracking-[0.05em]"
              style={{ color: "#6B7280" }}
            >
              {h}
            </span>
          ))}
        </div>

        {/* ── Rows ── */}
        {orders.map((order, idx) => {
          const isSelected = selectedId === order.id
          return (
          <div
            key={order.id}
            onClick={() => setSelectedId(isSelected ? null : order.id)}
            className="grid grid-cols-[1fr_1.5fr_1fr_0.8fr_1.2fr] gap-3 items-center transition-all duration-150 rounded-lg px-1 cursor-pointer"
            style={{
              height: 52,
              borderBottom: idx < orders.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
              borderLeft: isSelected ? "3px solid #FFD700" : "3px solid transparent",
              backgroundColor: isSelected ? "#1E2029" : "transparent",
              paddingLeft: isSelected ? "3px" : "5px",
            }}
            onMouseEnter={(e) => {
              if (!isSelected) (e.currentTarget as HTMLElement).style.backgroundColor = "#2A303C"
            }}
            onMouseLeave={(e) => {
              if (!isSelected) (e.currentTarget as HTMLElement).style.backgroundColor = "transparent"
            }}
          >
            {/* Order ref */}
            <div className="min-w-0">
              <p className="text-[13px] font-medium text-white truncate">{order.orderRef}</p>
              <p className="text-[11px] truncate" style={{ color: "#6B7280" }}>{order.timeLabel}</p>
            </div>

            {/* Customer */}
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className="flex h-8 w-8 items-center justify-center rounded-full shrink-0 text-[12px] font-bold"
                style={{ backgroundColor: "#25D366", color: "white" }}
              >
                {order.customer.initial}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1">
                  <span className="text-[13px] font-bold text-white truncate">{order.customer.name}</span>
                  {order.customer.verified && <BadgeCheck size={13} color="#22C55E" className="shrink-0" />}
                </div>
                <p className="text-[11px] truncate" style={{ color: "#6B7280" }}>{order.customer.phone}</p>
              </div>
            </div>

            {/* Risk Score */}
            <div className="flex items-center gap-2.5">
              <RiskScore score={order.riskScore} size="table" />
              <div className="min-w-0">
                <p className="text-[11px] font-bold truncate" style={{ color: riskColor(order.riskScore) }}>
                  {riskLabel(order.riskScore)}
                </p>
                <p className="text-[10px] truncate" style={{ color: "#6B7280" }}>
                  {order.riskSignals[0]}
                </p>
              </div>
            </div>

            {/* Amount */}
            <div>
              <p className="text-[13px] font-bold text-white">{formatAmount(order.amount)}</p>
              <span
                className="inline-block rounded px-1.5 py-0.5 text-[10px] font-medium leading-none"
                style={{ backgroundColor: "#2A303C", color: "#9CA3AF" }}
              >
                COD
              </span>
            </div>

            {/* Action */}
            <div className="flex items-center gap-1.5 justify-end">
              {order.status === "to_confirm" ? (
                <button
                  className="rounded-full border px-3 py-1 text-[11px] font-semibold transition-colors hover:opacity-80"
                  style={{ borderColor: "#FFD700", color: "#FFD700" }}
                >
                  To Confirm
                </button>
              ) : (
                <button
                  className="rounded-full border px-3 py-1 text-[11px] font-semibold"
                  style={{ borderColor: "#22C55E", color: "#22C55E" }}
                >
                  Confirmed
                </button>
              )}
              <button
                className="flex h-7 w-7 items-center justify-center rounded-lg transition-colors hover:opacity-80"
                style={{ backgroundColor: "#2A303C" }}
              >
                <Send size={13} style={{ color: "#9CA3AF" }} />
              </button>
              <button
                className="flex h-7 w-7 items-center justify-center rounded-lg transition-colors hover:opacity-80"
              >
                <Ellipsis size={14} style={{ color: "#6B7280" }} />
              </button>
            </div>
          </div>
          )
        })}
        </div>
      </div>
    </div>
  )
}
