"use client"

import Link from "next/link"
import { useLanguage } from "@/context/LanguageContext"
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

const PILLAR_CARDS = [
  {
    key: "activate",
    href: "/orders",
    icon: "📤",
    titleKey: "dash.activate",
    descKey: "dash.activate-desc",
    accent: "green",
    stats: [
      { key: "today", labelKey: "dash.today", get: (p: Props) => String(p.ordersToday) },
      { key: "at-risk", labelKey: "dash.at-risk", get: (p: Props) => String(p.needsConfirm), alert: (p: Props) => p.needsConfirm > 0 },
      { key: "pending", labelKey: "dash.pending", get: (p: Props) => String(p.pendingConfirm) },
    ],
  },
  {
    key: "collect",
    href: "/inbox",
    icon: "📸",
    titleKey: "dash.collect",
    descKey: "dash.collect-desc",
    accent: "amber",
    stats: [
      { key: "inbox", labelKey: "dash.inbox", get: (p: Props) => String(p.inboxCount), alert: (p: Props) => p.inboxCount > 0 },
      { key: "ugc", labelKey: "dash.new-ugc", get: (p: Props) => String(p.ugcCount), alert: (p: Props) => p.ugcCount > 0 },
    ],
  },
  {
    key: "track",
    href: "/shield",
    icon: "📈",
    titleKey: "dash.track",
    descKey: "dash.track-desc",
    accent: "orange",
    stats: [
      { key: "orders", labelKey: "dash.orders", get: (p: Props) => String(p.totalOrders) },
      { key: "rts-free", labelKey: "dash.rts-free", get: (p: Props) => `${p.rtsPrevented}%` },
    ],
  },
] as const

const ACCENT_TEXT: Record<string, string> = {
  green: "text-[var(--success-green)]",
  amber: "text-[var(--warning-amber)]",
  orange: "text-orange-400",
}

const ACCENT_BG: Record<string, string> = {
  green: "bg-[var(--success-green-bg)]",
  amber: "bg-[var(--warning-amber-bg)]",
  orange: "bg-orange-500/10",
}

const ACCENT_STAT: Record<string, string> = {
  green: "text-[var(--success-green)]",
  amber: "text-[var(--warning-amber)]",
  orange: "text-orange-400",
}

export default function DashboardContent(props: Props) {
  const { t } = useLanguage()

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[var(--text-primary)]">{t("nav.dashboard")}</h1>
          <p className="text-sm text-[var(--text-secondary)]">{t("dash.title")}</p>
        </div>
        <Link
          href="/orders/new"
          className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--accent-hover)]"
        >
          {t("common.new-order")}
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <p className="text-xs text-[var(--text-tertiary)]">{t("dash.rts-prevented")}</p>
          <p className="mt-0.5 text-2xl font-bold text-[var(--success-green)]">{props.rtsPrevented}%</p>
        </div>
        <div>
          <p className="text-xs text-[var(--text-tertiary)]">{t("dash.revenue-saved")}</p>
          <p className="mt-0.5 text-2xl font-bold text-[var(--success-green)]">{props.revenueSavedAmount} TND</p>
        </div>
        <div>
          <p className="text-xs text-[var(--text-tertiary)]">{t("dash.delivered-rate")}</p>
          <p className="mt-0.5 text-2xl font-bold text-[var(--success-green)]">{props.deliveredRate}%</p>
        </div>
      </div>

      <div className="border-t border-[var(--nav-border)] pt-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {PILLAR_CARDS.map((pillar) => (
            <Link
              key={pillar.key}
              href={pillar.href}
              className="group rounded-xl border border-[var(--border)] p-5 transition hover:border-[var(--text-tertiary)] bg-[var(--bg-card)]"
            >
              <div className="flex items-center gap-3 mb-3">
                <span className={`flex h-9 w-9 items-center justify-center rounded-lg text-base ${ACCENT_BG[pillar.accent]}`}>
                  {pillar.icon}
                </span>
                <div>
                  <h3 className={`font-semibold text-sm ${ACCENT_TEXT[pillar.accent]}`}>{t(pillar.titleKey)}</h3>
                  <p className="text-xs text-[var(--text-tertiary)]">{t(pillar.descKey)}</p>
                </div>
              </div>
              <div className="flex gap-3">
                {pillar.stats.map((stat: any) => {
                  const alert = stat.alert?.(props)
                  return (
                    <div key={stat.key} className="flex-1">
                      <p className={`text-lg font-bold ${alert ? ACCENT_STAT[pillar.accent] : "text-[var(--text-primary)]"}`}>
                        {stat.get(props)}
                      </p>
                      <p className="text-[10px] text-[var(--text-tertiary)]">{t(stat.labelKey)}</p>
                    </div>
                  )
                })}
              </div>
            </Link>
          ))}
        </div>
      </div>

      <RiskAlerts orders={props.riskAlerts} />

      <div className="border-t border-[var(--nav-border)] pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">{t("dash.recent-orders")}</h3>
              <Link href="/orders" className="text-xs font-medium text-[var(--accent)] hover:underline">{t("dash.view-all")}</Link>
            </div>
            <div className="divide-y divide-[var(--nav-border)]">
              {props.recentOrders.map((o) => (
                <Link
                  key={o.id}
                  href={`/orders/${o.id}`}
                  className="flex items-center justify-between px-1 py-2.5 transition hover:bg-[var(--table-row-hover)] -mx-1 rounded"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-[var(--text-primary)]">{o.buyerName}</p>
                    <p className="truncate text-xs text-[var(--text-tertiary)]">{o.product ?? o.buyerPhone}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-[var(--text-primary)]">{Number(o.amount).toFixed(3)} TND</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
          <RTSChart data={props.chartData} />
        </div>
      </div>
    </div>
  )
}
