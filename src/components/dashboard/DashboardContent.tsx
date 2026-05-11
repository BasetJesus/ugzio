"use client"

import Link from "next/link"
import { useLanguage } from "../../../app/context/LanguageContext"
import RiskAlerts from "./RiskAlerts"
import RTSChart from "./RTSChart"

interface Order {
  id: string
  buyerName: string
  buyerPhone: string
  amount: number
  trustScore: number
  riskLevel: string
  status: string
  product: string | null
  createdAt: Date
}

interface Props {
  ordersToday: number
  needsConfirm: number
  pendingConfirm: number
  inboxCount: number
  ugcCount: number
  totalOrders: number
  rtsPrevented: number
  revenueSavedAmount: number
  deliveredRate: number
  riskAlerts: Order[]
  recentOrders: Order[]
  chartData: { day: string; rate: number }[]
}

export default function DashboardContent({
  ordersToday,
  needsConfirm,
  pendingConfirm,
  inboxCount,
  ugcCount,
  totalOrders,
  rtsPrevented,
  revenueSavedAmount,
  deliveredRate,
  riskAlerts,
  recentOrders,
  chartData,
}: Props) {
  const { t } = useLanguage()

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">{t("nav.dashboard")}</h1>
          <p className="text-sm text-zinc-400">{t("dash.title")}</p>
        </div>
        <Link
          href="/orders/new"
          className="rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-400"
        >
          {t("common.new-order")}
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 text-center">
          <p className="text-xs text-zinc-500">{t("dash.rts-prevented")}</p>
          <p className="mt-1 text-2xl font-bold text-emerald-400">{rtsPrevented}%</p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 text-center">
          <p className="text-xs text-zinc-500">{t("dash.revenue-saved")}</p>
          <p className="mt-1 text-2xl font-bold text-emerald-400">{revenueSavedAmount} TND</p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 text-center">
          <p className="text-xs text-zinc-500">{t("dash.delivered-rate")}</p>
          <p className="mt-1 text-2xl font-bold text-emerald-400">{deliveredRate}%</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Link href="/orders" className="group rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 transition hover:border-emerald-500/50">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-lg">📤</div>
          <h3 className="font-semibold text-zinc-200 group-hover:text-emerald-400 transition-colors">{t("dash.activate")}</h3>
          <p className="mt-1 text-xs text-zinc-500">{t("dash.activate-desc")}</p>
          <div className="mt-4 flex gap-3">
            <div className="flex-1 rounded-lg bg-zinc-950/50 px-3 py-2 text-center">
              <p className="text-lg font-bold text-zinc-200">{ordersToday}</p>
              <p className="text-[10px] text-zinc-500">{t("dash.today")}</p>
            </div>
            <div className="flex-1 rounded-lg bg-zinc-950/50 px-3 py-2 text-center">
              <p className={`text-lg font-bold ${needsConfirm > 0 ? "text-amber-400" : "text-zinc-200"}`}>{needsConfirm}</p>
              <p className="text-[10px] text-zinc-500">{t("dash.at-risk")}</p>
            </div>
            <div className="flex-1 rounded-lg bg-zinc-950/50 px-3 py-2 text-center">
              <p className="text-lg font-bold text-zinc-200">{pendingConfirm}</p>
              <p className="text-[10px] text-zinc-500">{t("dash.pending")}</p>
            </div>
          </div>
        </Link>

        <Link href="/inbox" className="group rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 transition hover:border-emerald-500/50">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-lg">📸</div>
          <h3 className="font-semibold text-zinc-200 group-hover:text-emerald-400 transition-colors">{t("dash.collect")}</h3>
          <p className="mt-1 text-xs text-zinc-500">{t("dash.collect-desc")}</p>
          <div className="mt-4 flex gap-3">
            <div className="flex-1 rounded-lg bg-zinc-950/50 px-3 py-2 text-center">
              <p className={`text-lg font-bold ${inboxCount > 0 ? "text-amber-400" : "text-zinc-600"}`}>{inboxCount}</p>
              <p className="text-[10px] text-zinc-500">{t("dash.inbox")}</p>
            </div>
            <div className="flex-1 rounded-lg bg-zinc-950/50 px-3 py-2 text-center">
              <p className={`text-lg font-bold ${ugcCount > 0 ? "text-emerald-400" : "text-zinc-600"}`}>{ugcCount}</p>
              <p className="text-[10px] text-zinc-500">{t("dash.new-ugc")}</p>
            </div>
          </div>
        </Link>

        <Link href="/shield" className="group rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 transition hover:border-emerald-500/50">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-lg">📈</div>
          <h3 className="font-semibold text-zinc-200 group-hover:text-emerald-400 transition-colors">{t("dash.track")}</h3>
          <p className="mt-1 text-xs text-zinc-500">{t("dash.track-desc")}</p>
          <div className="mt-4 flex gap-3">
            <div className="flex-1 rounded-lg bg-zinc-950/50 px-3 py-2 text-center">
              <p className="text-lg font-bold text-zinc-200">{totalOrders}</p>
              <p className="text-[10px] text-zinc-500">{t("dash.orders")}</p>
            </div>
            <div className="flex-1 rounded-lg bg-zinc-950/50 px-3 py-2 text-center">
              <p className="text-lg font-bold text-emerald-400">{rtsPrevented}%</p>
              <p className="text-[10px] text-zinc-500">{t("dash.rts-free")}</p>
            </div>
          </div>
        </Link>
      </div>

      <RiskAlerts orders={riskAlerts} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-zinc-300">{t("dash.recent-orders")}</h3>
            <Link href="/orders" className="text-xs font-medium text-emerald-400 hover:underline">{t("dash.view-all")}</Link>
          </div>
          {recentOrders.map((o) => (
            <Link
              key={o.id}
              href={`/orders/${o.id}`}
              className="flex items-center justify-between border-t border-zinc-800/50 px-1 py-2.5 transition hover:bg-zinc-900/30"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-zinc-300">{o.buyerName}</p>
                <p className="truncate text-xs text-zinc-600">{o.product ?? o.buyerPhone}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-zinc-200">{Number(o.amount).toFixed(3)} TND</p>
              </div>
            </Link>
          ))}
        </div>
        <RTSChart data={chartData} />
      </div>
    </div>
  )
}
