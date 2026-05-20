"use client"

import { useState, useMemo, useCallback } from "react"
import { motion } from "framer-motion"
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle,
  Ban,
  Send,
  Ellipsis,
  X,
  Clock,
  Copy,
  ChevronDown,
  Zap,
  Phone,
  Shield,
  ArrowUpRight,
} from "lucide-react"
import MetricCard from "@/components/dashboard/MetricCard"
import RiskScore from "@/components/shared/RiskScore"
import ErrorBoundary from "@/components/shared/ErrorBoundary"
import EmptyState from "@/components/shared/EmptyState"
import FocusTrap from "@/components/shared/FocusTrap"
import { SkeletonMetricCard, SkeletonTableRow } from "@/components/shared/Skeleton"

/* ── Types ── */

type RiskLevel = "high" | "medium" | "low" | "blocked"
type OrderStatus = "to_confirm" | "confirmed"

interface ProtectOrder {
  id: string
  orderRef: string
  customer: { name: string; phone: string; initial: string }
  riskScore: number
  riskLevel: RiskLevel
  riskReason: string
  amount: number
  status: OrderStatus
  time: string
  timeLabel: string
  product: string
  payment: string
  date: string
  customerHistory: { total: number; completed: number; cancelled: number; rtsRate: number }
  riskBullets: string[]
}

/* ── Mock Data ── */

const MOCK_ORDERS: ProtectOrder[] = [
  {
    id: "1", orderRef: "#ZIO-7821",
    customer: { name: "Youssef M.", phone: "+216 50 123 456", initial: "Y" },
    riskScore: 84, riskLevel: "high", riskReason: "New phone · First order · Wilaya mismatch",
    amount: 89000, status: "to_confirm", time: "Today, 10:24", timeLabel: "10 min ago",
    product: "Premium Sneakers XZ-200", payment: "COD", date: "2026-05-20",
    customerHistory: { total: 1, completed: 0, cancelled: 0, rtsRate: 0 },
    riskBullets: ["Phone number created 2 days ago", "First order from this buyer", "Delivery wilaya differs from billing"],
  },
  {
    id: "2", orderRef: "#ZIO-7790",
    customer: { name: "Ahmed K.", phone: "+216 55 987 654", initial: "A" },
    riskScore: 76, riskLevel: "high", riskReason: "High amount · Multiple failed",
    amount: 124500, status: "to_confirm", time: "Today, 09:52", timeLabel: "42 min ago",
    product: "Designer Watch Collection", payment: "COD", date: "2026-05-20",
    customerHistory: { total: 3, completed: 0, cancelled: 2, rtsRate: 100 },
    riskBullets: ["2 previous orders cancelled after delivery", "Amount exceeds average by 340%", "Phone linked to 3 different addresses"],
  },
  {
    id: "3", orderRef: "#ZIO-7765",
    customer: { name: "Mariem B.", phone: "+216 26 456 789", initial: "M" },
    riskScore: 65, riskLevel: "medium", riskReason: "Medium amount · New address",
    amount: 45000, status: "confirmed", time: "Today, 08:30", timeLabel: "2h ago",
    product: "Summer Collection Dress", payment: "COD", date: "2026-05-20",
    customerHistory: { total: 2, completed: 1, cancelled: 0, rtsRate: 0 },
    riskBullets: ["New shipping address not previously used", "Amount is within normal range", "Previous order completed successfully"],
  },
  {
    id: "4", orderRef: "#ZIO-7732",
    customer: { name: "Karim J.", phone: "+216 98 765 432", initial: "K" },
    riskScore: 92, riskLevel: "blocked", riskReason: "Blacklisted · Suspicious wilaya",
    amount: 210000, status: "to_confirm", time: "Yesterday, 22:15", timeLabel: "12h ago",
    product: "Limited Edition Handbag", payment: "COD", date: "2026-05-19",
    customerHistory: { total: 5, completed: 0, cancelled: 3, rtsRate: 100 },
    riskBullets: ["Phone number is on shared blacklist", "Multiple RTS across different sellers", "Delivery address is a known drop location"],
  },
  {
    id: "5", orderRef: "#ZIO-7710",
    customer: { name: "Nadia F.", phone: "+216 23 111 222", initial: "N" },
    riskScore: 58, riskLevel: "medium", riskReason: "First order · COD amount high",
    amount: 33500, status: "to_confirm", time: "Yesterday, 18:40", timeLabel: "16h ago",
    product: "Wireless Earbuds Pro", payment: "COD", date: "2026-05-19",
    customerHistory: { total: 1, completed: 0, cancelled: 0, rtsRate: 0 },
    riskBullets: ["First time buyer — no history available", "COD amount is moderate", "Phone verified via WhatsApp"],
  },
  {
    id: "6", orderRef: "#ZIO-7689",
    customer: { name: "Sami R.", phone: "+216 29 333 444", initial: "S" },
    riskScore: 81, riskLevel: "high", riskReason: "Repeat suspicious · Address anomaly",
    amount: 176000, status: "confirmed", time: "Yesterday, 14:00", timeLabel: "20h ago",
    product: "Smart Home Bundle", payment: "COD", date: "2026-05-19",
    customerHistory: { total: 4, completed: 1, cancelled: 2, rtsRate: 67 },
    riskBullets: ["Address flagged as high-risk zone", "67% RTS rate across 3 orders", "Order placed from different IP region"],
  },
  {
    id: "7", orderRef: "#ZIO-7654",
    customer: { name: "Leila H.", phone: "+216 52 777 888", initial: "L" },
    riskScore: 32, riskLevel: "low", riskReason: "Returning buyer · Consistent history",
    amount: 28500, status: "confirmed", time: "Yesterday, 11:30", timeLabel: "23h ago",
    product: "Organic Skincare Set", payment: "COD", date: "2026-05-19",
    customerHistory: { total: 8, completed: 7, cancelled: 0, rtsRate: 0 },
    riskBullets: ["8 previous orders with 7 completed", "Consistent delivery address", "No negative history flags"],
  },
  {
    id: "8", orderRef: "#ZIO-7621",
    customer: { name: "Omar F.", phone: "+216 20 111 333", initial: "O" },
    riskScore: 18, riskLevel: "low", riskReason: "Trusted buyer · Verified history",
    amount: 15000, status: "confirmed", time: "2 days ago", timeLabel: "2d ago",
    product: "Casual T-Shirt Bundle", payment: "COD", date: "2026-05-18",
    customerHistory: { total: 15, completed: 14, cancelled: 0, rtsRate: 0 },
    riskBullets: ["Long-standing customer with 15 orders", "98% completion rate", "Verified buyer badge active"],
  },
]

const ALL_ORDERS = MOCK_ORDERS

function formatAmount(n: number): string {
  return n.toLocaleString("fr-FR", { minimumFractionDigits: 3, maximumFractionDigits: 3 })
}

function riskLevelColor(level: RiskLevel): string {
  switch (level) {
    case "high": return "#EF4444"
    case "medium": return "#F97316"
    case "low": return "#22C55E"
    case "blocked": return "#EF4444"
  }
}

function riskLevelLabel(level: RiskLevel): string {
  switch (level) {
    case "high": return "High Risk"
    case "medium": return "Medium Risk"
    case "low": return "Low Risk"
    case "blocked": return "Blocked"
  }
}

/* ── Order Detail Panel ── */

function OrderDetailPanel({
  order,
  onClose,
}: {
  order: ProtectOrder | null
  onClose: () => void
}) {
  return (
    <>
      {order && <div className="fixed inset-0 z-30 bg-black/40" onClick={onClose} />}
      {/* Desktop: right panel */}
      <div
        className="fixed top-0 right-0 z-40 h-full w-[320px] border-l overflow-y-auto transition-transform duration-300 ease-out max-md:hidden"
        style={{
          backgroundColor: "#161A23",
          borderLeftColor: "rgba(255,255,255,0.06)",
          transform: order ? "translateX(0)" : "translateX(100%)",
        }}
      >
        {order && (
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <div className="flex items-center gap-2.5">
                <h2 className="text-[15px] font-bold text-white">{order.orderRef}</h2>
                <span
                  className="rounded-full px-2 py-0.5 text-[10px] font-bold"
                  style={{ backgroundColor: `${riskLevelColor(order.riskLevel)}20`, color: riskLevelColor(order.riskLevel) }}
                >
                  {riskLevelLabel(order.riskLevel)}
                </span>
              </div>
              <button onClick={onClose} className="p-1 rounded-lg hover:bg-[#2A303C] transition-colors" aria-label="Close panel">
                <X size={16} style={{ color: "#6B7280" }} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
              <DetailContent order={order} />
            </div>
          </div>
        )}
      </div>

      {/* Mobile: bottom sheet */}
      <div
        className="fixed bottom-0 left-0 right-0 z-40 max-h-[85vh] rounded-t-2xl overflow-y-auto transition-transform duration-300 ease-out md:hidden"
        style={{
          backgroundColor: "#161A23",
          transform: order ? "translateY(0)" : "translateY(100%)",
        }}
      >
        {order && (
          <div className="flex flex-col">
            {/* Handle */}
            <div className="flex items-center justify-center pt-2 pb-1">
              <div className="h-1 w-10 rounded-full" style={{ backgroundColor: "#2A303C" }} />
            </div>
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <div className="flex items-center gap-2">
                <h2 className="text-[14px] font-bold text-white">{order.orderRef}</h2>
                <span
                  className="rounded-full px-2 py-0.5 text-[10px] font-bold"
                  style={{ backgroundColor: `${riskLevelColor(order.riskLevel)}20`, color: riskLevelColor(order.riskLevel) }}
                >
                  {riskLevelLabel(order.riskLevel)}
                </span>
              </div>
              <button onClick={onClose} className="p-1 rounded-lg hover:bg-[#2A303C] transition-colors" aria-label="Close panel">
                <X size={16} style={{ color: "#6B7280" }} />
              </button>
            </div>

            <div className="px-4 py-4 space-y-5">
              <DetailContent order={order} />
            </div>
          </div>
        )}
      </div>
    </>
  )
}

function DetailContent({ order }: { order: ProtectOrder }) {
  return (
    <div className="space-y-5">
      {/* Customer */}
      <div>
        <h3 className="text-[10px] font-medium uppercase tracking-wider mb-2" style={{ color: "#6B7280" }}>Customer</h3>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#25D366] text-white text-[14px] font-bold">
            {order.customer.initial}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[14px] font-bold text-white">{order.customer.name}</p>
            <p className="text-[12px]" style={{ color: "#6B7280" }}>{order.customer.phone}</p>
          </div>
          <button className="p-1.5 rounded-lg hover:bg-[#2A303C]" style={{ color: "#6B7280" }} aria-label="Copy phone number"><Copy size={14} /></button>
          <button className="p-1.5 rounded-lg hover:bg-[#2A303C]" style={{ color: "#25D366" }} aria-label="Call customer"><Phone size={14} /></button>
        </div>
        <button
          className="mt-2 w-full rounded-lg py-2 text-[12px] font-medium transition-colors hover:opacity-80"
          style={{ backgroundColor: "#2A303C", color: "#9CA3AF" }}
        >
          View Profile
        </button>
      </div>

      {/* Order Details */}
      <div>
        <h3 className="text-[10px] font-medium uppercase tracking-wider mb-2" style={{ color: "#6B7280" }}>Order Details</h3>
        <div className="space-y-2">
          {[
            { label: "Amount", value: `${formatAmount(order.amount)} DTN` },
            { label: "Payment", value: order.payment },
            { label: "Item", value: order.product },
            { label: "Date", value: order.date },
          ].map((d) => (
            <div key={d.label} className="flex justify-between">
              <span className="text-[12px]" style={{ color: "#6B7280" }}>{d.label}</span>
              <span className="text-[12px] font-medium text-white">{d.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Risk Score */}
      <div className="flex flex-col items-center py-2" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <RiskScore score={order.riskScore} size="detail" />
      </div>

      {/* Why high risk? */}
      {order.riskBullets.length > 0 && (
        <div>
          <h3 className="text-[12px] font-bold text-white mb-2">Why {riskLevelLabel(order.riskLevel).toLowerCase()}?</h3>
          <ul className="space-y-1.5">
            {order.riskBullets.map((b, i) => (
              <li key={i} className="flex items-start gap-2 text-[12px]" style={{ color: "#9CA3AF" }}>
                <span className="mt-1 h-1.5 w-1.5 rounded-full shrink-0" style={{ backgroundColor: riskLevelColor(order.riskLevel) }} />
                {b}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Timestamp */}
      <div className="flex items-center gap-1.5 text-[11px]" style={{ color: "#6B7280" }}>
        <Clock size={12} />
        Risk score updated {order.timeLabel}
      </div>

      {/* Recommended Action */}
      <div className="rounded-xl p-4" style={{ backgroundColor: "#0B0D12" }}>
        <div className="flex items-center gap-2 mb-2">
          <Zap size={16} color="#FFD700" />
          <h3 className="text-[12px] font-bold text-white">Recommended Action</h3>
        </div>
        <p className="text-[12px] mb-3" style={{ color: "#9CA3AF" }}>
          {order.riskLevel === "high" || order.riskLevel === "blocked"
            ? "High risk score suggests pre-delivery confirmation is required. Send WhatsApp confirmation request to verify buyer intent."
            : "Medium risk — standard confirmation recommended. Send WhatsApp message to confirm order."}
        </p>
        <button
          className="w-full rounded-lg py-2.5 text-[12px] font-bold transition-opacity hover:opacity-90 mb-2"
          style={{ backgroundColor: "#FFD700", color: "#0B0D12" }}
        >
          Send WhatsApp Confirmation
        </button>
        <button
          className="w-full rounded-lg py-2.5 text-[12px] font-bold border transition-colors hover:opacity-80"
          style={{ borderColor: "#FFD700", color: "#FFD700" }}
        >
          Request Prepayment (30%)
        </button>
      </div>

      {/* Customer History */}
      <div>
        <h3 className="text-[10px] font-medium uppercase tracking-wider mb-2" style={{ color: "#6B7280" }}>Customer History</h3>
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: "Total", value: order.customerHistory.total },
            { label: "Completed", value: order.customerHistory.completed },
            { label: "Cancelled", value: order.customerHistory.cancelled },
            {
              label: "RTS Rate",
              value: `${order.customerHistory.rtsRate}%`,
              red: order.customerHistory.rtsRate >= 100,
            },
          ].map((d) => (
            <div key={d.label} className="text-center rounded-lg p-2" style={{ backgroundColor: "#0B0D12" }}>
              <p className="text-[18px] font-bold" style={{ color: "red" in d && d.red ? "#EF4444" : "#FFFFFF" }}>
                {d.value}
              </p>
              <p className="text-[10px]" style={{ color: "#6B7280" }}>{d.label}</p>
            </div>
          ))}
        </div>
        <button className="mt-2 flex items-center gap-1 text-[12px] font-medium transition-opacity hover:opacity-80" style={{ color: "#FFD700" }}>
          View Full History <ArrowUpRight size={12} />
        </button>
      </div>
    </div>
  )
}

/* ── Main Page ── */

export default function ProtectPage() {
  const [activeTab, setActiveTab] = useState("all")
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)

  const selectedOrder = ALL_ORDERS.find((o) => o.id === selectedOrderId) ?? null

  const filteredOrders = useMemo(() => {
    if (activeTab === "all") return ALL_ORDERS
    return ALL_ORDERS.filter((o) => o.riskLevel === activeTab)
  }, [activeTab])

  const tabs = [
    { key: "all", label: "All", count: ALL_ORDERS.length },
    { key: "high", label: "High Risk", count: ALL_ORDERS.filter((o) => o.riskLevel === "high").length },
    { key: "medium", label: "Medium Risk", count: ALL_ORDERS.filter((o) => o.riskLevel === "medium").length },
    { key: "low", label: "Low Risk", count: ALL_ORDERS.filter((o) => o.riskLevel === "low").length },
    { key: "blocked", label: "Blocked", count: ALL_ORDERS.filter((o) => o.riskLevel === "blocked").length },
  ]

  const pageSize = 8
  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / pageSize))
  const pagedOrders = filteredOrders.slice(0, pageSize)

  const handleRowClick = useCallback((orderId: string) => {
    setSelectedRowId((prev) => (prev === orderId ? null : orderId))
    setSelectedOrderId(orderId)
  }, [])

  const handleRowKeyDown = useCallback((e: React.KeyboardEvent, orderId: string) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      handleRowClick(orderId)
    }
  }, [handleRowClick])

  return (
    <motion.div
      className="flex flex-col h-full overflow-y-auto"
      style={{ backgroundColor: "#0B0D12" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex-1 p-4 sm:p-6 lg:p-8 space-y-5">
        {/* ── Header ── */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-[26px] font-bold tracking-[-0.02em] leading-tight">
              <span className="text-white">Protect </span>
              <span style={{ color: "#FFD700" }}>/ Risk Center</span>
            </h1>
            <p className="text-[13px] mt-1" style={{ color: "#6B7280" }}>
              Stop fake orders before they ship. Every decision protects your revenue.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button
              className="flex h-9 items-center gap-1.5 rounded-lg border px-3 text-[12px] font-medium"
              style={{ borderColor: "#2A303C", color: "#9CA3AF" }}
            >
              Filters <ChevronDown size={12} />
            </button>
            <button
              className="flex h-9 items-center rounded-lg px-4 text-[12px] font-bold transition-opacity hover:opacity-90"
              style={{ backgroundColor: "#FFD700", color: "#0B0D12" }}
            >
              Request Confirmations
            </button>
          </div>
        </div>

        {/* ── Stats Bar ── */}
        <ErrorBoundary>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          <div className="sm:col-span-2 lg:col-span-1">
          <MetricCard
            label="At Risk" value={23} change={-8.3}
            icon={<ShieldAlert size={16} color="#EF4444" />}
            variant="small" invertColor sparklineData={[18, 25, 22, 30, 28, 35, 32, 28, 25, 30, 27, 23]}
          />
          </div>
          <MetricCard
            label="To Confirm" value={47} change={12.5}
            icon={<AlertTriangle size={16} color="#FFD700" />}
            variant="small" color="#FFD700" sparklineData={[30, 35, 32, 40, 38, 45, 42, 47]}
          />
          <MetricCard
            label="High Risk" value={11} change={-15.2}
            icon={<Shield size={16} color="#EF4444" />}
            variant="small" invertColor sparklineData={[15, 18, 14, 20, 17, 13, 11]}
          />
          <MetricCard
            label="Blocked" value={9} change={28.6}
            icon={<Ban size={16} color="#F97316" />}
            variant="small" color="#F97316" sparklineData={[4, 5, 4, 6, 7, 8, 9]}
          />
          <MetricCard
            label="Revenue At Risk" value="2,840 DTN" change={14.6}
            icon={<Shield size={16} color="#FFD700" />}
            variant="small" color="#FFD700" sparklineData={[1200, 1500, 1300, 1800, 2100, 1950, 2500, 2300, 2840]}
          />
        </div>
        </ErrorBoundary>

        {/* ── Orders Table Section ── */}
        <ErrorBoundary>
        <div
          className="rounded-xl border overflow-hidden"
          style={{ backgroundColor: "#161A23", borderColor: "rgba(255,255,255,0.06)" }}
        >
        {filteredOrders.length === 0 ? (
          <EmptyState />
        ) : (
        <>
          {/* Tabs */}
          <div className="flex items-center justify-between px-4 sm:px-5 pt-4 pb-0 overflow-x-auto" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="flex items-center gap-1 shrink-0">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => { setActiveTab(tab.key); setCurrentPage(1) }}
                  className="relative px-2.5 sm:px-3 py-2 text-[12px] font-medium transition-colors whitespace-nowrap"
                  style={{ color: activeTab === tab.key ? "#FFD700" : "#6B7280" }}
                >
                  {tab.label} ({tab.count})
                  {activeTab === tab.key && (
                    <span className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full" style={{ backgroundColor: "#FFD700" }} />
                  )}
                </button>
              ))}
            </div>
            <button className="flex items-center gap-1.5 text-[12px] font-medium shrink-0" style={{ color: "#6B7280" }}>
              Sort by: Risk Score <ChevronDown size={12} />
            </button>
          </div>

          {/* Scrollable table area */}
          <div className="overflow-x-auto">
          <div className="min-w-[700px]">
          {/* Column headers */}
          <div
            className="grid grid-cols-[32px_1fr_1.5fr_0.8fr_1fr_0.8fr_0.9fr_0.9fr] gap-3 px-4 sm:px-5 py-3 text-[11px] font-medium uppercase tracking-[0.05em]"
            style={{ color: "#6B7280", borderBottom: "1px solid rgba(255,255,255,0.04)" }}
          >
            <span className="flex items-center justify-center"><input type="checkbox" className="w-4 h-4 accent-[#FFD700]" /></span>
            <span>Order</span>
            <span>Customer</span>
            <span>Risk Score</span>
            <span>Risk Level</span>
            <span>Amount</span>
            <span>Status</span>
            <span className="text-right">Action</span>
          </div>

          {/* Rows */}
          {pagedOrders.map((order) => {
            const isRowSelected = selectedRowId === order.id
            return (
            <div
              key={order.id}
              className="grid grid-cols-[32px_1fr_1.5fr_0.8fr_1fr_0.8fr_0.9fr_0.9fr] gap-3 px-4 sm:px-5 items-center transition-all duration-150 cursor-pointer"
              style={{
                height: 52,
                borderBottom: "1px solid rgba(255,255,255,0.04)",
                borderLeft: isRowSelected ? "3px solid #FFD700" : "3px solid transparent",
                backgroundColor: isRowSelected ? "#1E2029" : "transparent",
                paddingLeft: isRowSelected ? "17px" : "20px",
              }}
              onMouseEnter={(e) => { if (!isRowSelected) e.currentTarget.style.backgroundColor = "#2A303C" }}
              onMouseLeave={(e) => { if (!isRowSelected) e.currentTarget.style.backgroundColor = "transparent" }}
              onClick={() => handleRowClick(order.id)}
              onKeyDown={(e) => handleRowKeyDown(e, order.id)}
              tabIndex={0}
              role="button"
              aria-label={`Order ${order.orderRef}, ${riskLevelLabel(order.riskLevel)}, ${formatAmount(order.amount)} DTN`}
            >
              <span className="flex items-center justify-center"><input type="checkbox" className="w-4 h-4 accent-[#FFD700]" /></span>
              <div className="min-w-0">
                <p className="text-[13px] font-bold text-white truncate">{order.orderRef}</p>
                <p className="text-[11px] truncate" style={{ color: "#6B7280" }}>{order.time}</p>
              </div>
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#25D366] text-white text-[12px] font-bold shrink-0">
                  {order.customer.initial}
                </div>
                <div className="min-w-0">
                  <p className="text-[13px] font-bold text-white truncate">{order.customer.name}</p>
                  <p className="text-[11px] truncate" style={{ color: "#6B7280" }}>{order.customer.phone}</p>
                </div>
              </div>
              <RiskScore score={order.riskScore} size="table" />
              <div className="min-w-0">
                <p className="text-[12px] font-bold truncate" style={{ color: riskLevelColor(order.riskLevel) }}>
                  {riskLevelLabel(order.riskLevel)}
                </p>
                <p className="text-[10px] truncate" style={{ color: "#6B7280" }}>{order.riskReason}</p>
              </div>
              <div>
                <p className="text-[13px] font-bold text-white">{formatAmount(order.amount)}</p>
                <span className="inline-block rounded px-1.5 py-0.5 text-[10px] font-medium" style={{ backgroundColor: "#2A303C", color: "#9CA3AF" }}>COD</span>
              </div>
              <div>
                {order.status === "to_confirm" ? (
                  <span className="inline-block rounded-full border px-3 py-1 text-[11px] font-semibold" style={{ borderColor: "#FFD700", color: "#FFD700" }}>To Confirm</span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full border px-3 py-1 text-[11px] font-semibold" style={{ borderColor: "#22C55E", color: "#22C55E" }}>
                    <CheckCircle size={12} /> Confirmed
                  </span>
                )}
              </div>
              <div className="flex items-center justify-end gap-1">
                <button className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-[#2A303C]" aria-label={`Send confirmation for ${order.orderRef}`}><Send size={13} style={{ color: "#9CA3AF" }} /></button>
                <button className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-[#2A303C]" aria-label={`More actions for ${order.orderRef}`}><Ellipsis size={14} style={{ color: "#6B7280" }} /></button>
              </div>
            </div>
            )
          })}

          {/* Pagination */}
          <div className="flex items-center justify-between px-4 sm:px-5 py-3 flex-wrap gap-2" style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
            <p className="text-[12px]" style={{ color: "#6B7280" }}>
              Showing 1 to {pagedOrders.length} of {filteredOrders.length} orders
            </p>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setCurrentPage(p)}
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-[12px] font-medium transition-colors"
                  style={{
                    backgroundColor: currentPage === p ? "#FFD700" : "transparent",
                    color: currentPage === p ? "#0B0D12" : "#6B7280",
                  }}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          </div>
          </div>
          </>
        )}
        </div>
        </ErrorBoundary>
      </div>

      {/* ── Right Panel ── */}
      <FocusTrap active={!!selectedOrder}>
      <OrderDetailPanel order={selectedOrder} onClose={() => setSelectedOrderId(null)} />
      </FocusTrap>
    </motion.div>
  )
}
