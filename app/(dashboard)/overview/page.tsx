import { Zap, Package, ShieldAlert, CheckCircle, Ban } from "lucide-react"
import Header from "@/components/layout/Header"
import MetricCard from "@/components/dashboard/MetricCard"
import HighRiskOrders from "@/components/dashboard/HighRiskOrders"
import RecentActivity from "@/components/dashboard/RecentActivity"
import UGCCaptured from "@/components/dashboard/UGCCaptured"
import { ChannelPerformance, TopCaptions } from "@/components/dashboard/ChannelPerformance"
import { getOverviewGrowthSection } from "@/services/overview.service"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/options"
import { redirect } from "next/navigation"
import { getOrgFromUserId } from "@/lib/billing/enforce"

const SPARKLINES = {
  revenue: [320, 450, 380, 520, 490, 610, 580, 720, 680, 810, 950, 1050, 990, 1120, 1248],
  orders: [85, 92, 88, 105, 98, 110, 115, 108, 120, 125, 118, 130, 135, 140, 142],
  atRisk: [18, 25, 22, 30, 28, 35, 32, 28, 25, 30, 27, 23, 25, 22, 23],
  confirmations: [45, 52, 48, 58, 62, 55, 68, 72, 65, 75, 80, 78, 82, 86, 89],
  rts: [8, 12, 10, 15, 13, 18, 16, 14, 12, 17, 15, 18, 16, 15, 16],
}

export default async function OverviewPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect("/login")
  const orgId = await getOrgFromUserId(session.user.id)
  if (!orgId) redirect("/onboarding")

  const growthSection = await getOverviewGrowthSection(orgId)

  return (
    <div className="flex flex-col gap-5 p-6 sm:p-8 overflow-y-auto h-full" style={{ backgroundColor: "#0B0D12" }}>
      {/* ── Section 1: Header ── */}
      <div className="animate-fade-in-up" style={{ animationFillMode: "backwards" }}>
        <Header
          title="Overview"
          emoji="👋"
          subtitle="Here's what's happening with your business today."
        />
      </div>

      {/* ── Section 2: KPI Row ── */}
      <div
        className="animate-fade-in-up"
        style={{ animationDelay: "0.1s", animationFillMode: "backwards" }}
      >
        <div className="flex flex-col xl:flex-row gap-4">
          <div className="w-full xl:w-[35%] shrink-0">
            <MetricCard
              label="Revenue Protected"
              value="1,248.750 DTN"
              change={18.6}
              icon={<Zap size={18} color="#FFD700" />}
              variant="large"
              color="#FFD700"
              sparklineData={SPARKLINES.revenue}
            />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 flex-1">
            <MetricCard
              label="Orders Received"
              value={142}
              change={12.4}
              icon={<Package size={16} color="#22C55E" />}
              variant="small"
              sparklineData={SPARKLINES.orders}
            />
            <MetricCard
              label="At Risk"
              value={23}
              change={-8.3}
              icon={<ShieldAlert size={16} color="#EF4444" />}
              variant="small"
              invertColor
              sparklineData={SPARKLINES.atRisk}
            />
            <MetricCard
              label="Confirmations"
              value={89}
              change={24.7}
              icon={<CheckCircle size={16} color="#22C55E" />}
              variant="small"
              sparklineData={SPARKLINES.confirmations}
            />
            <MetricCard
              label="RTS Prevented"
              value={16}
              change={20}
              icon={<Ban size={16} color="#FFD700" />}
              variant="small"
              color="#FFD700"
              sparklineData={SPARKLINES.rts}
            />
          </div>
        </div>
      </div>

      {/* ── Section 3: Middle Row ── */}
      <div
        className="animate-fade-in-up"
        style={{ animationDelay: "0.2s", animationFillMode: "backwards" }}
      >
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="w-full lg:w-[65%]">
            <HighRiskOrders />
          </div>
          <div className="flex-1">
            <RecentActivity />
          </div>
        </div>
      </div>

      {/* ── Section 4: Bottom Row (UGC, Captions, Channels) ── */}
      <div
        className="animate-fade-in-up"
        style={{ animationDelay: "0.3s", animationFillMode: "backwards" }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <UGCCaptured items={growthSection.ugcItems} href="/capture" />
          <TopCaptions captions={growthSection.topCaptions} href="/capture" />
          <ChannelPerformance channels={growthSection.channelPerformance} href="/growth" />
        </div>
      </div>
    </div>
  )
}
