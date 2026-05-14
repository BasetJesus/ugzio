import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { redirect } from "next/navigation";
import { getOrgFromUserId } from "@/lib/billing/enforce";
import { getRevenueAtRisk, getNeedsConfirmCount, getRevenueProtectionStats } from "@/services/demo-orchestrator.service";
import { getRecentActivity } from "@/services/operation-timeline.service";
import { getWeeklyStory, getTrustMomentum } from "@/services/behavioral-outcome.service";
import { getQuickstartProgress, getFirst48Hours, getSuccessMoments, getSellerHealth } from "@/services/pilot.service";
import { getConnectionStatus } from "@/services/whatsapp-connection.service";
import { getCommunicationPerformance } from "@/services/communication-performance.service";
import { getSellerContext, getDailyMomentum } from "@/services/seller-context.service";
import type { RevenueProtectionStats } from "@/services/demo-orchestrator.service";
import type { OperationEventRecord } from "@/services/operation-timeline.service";
import type { WeeklyStory, TrustMomentumData } from "@/services/behavioral-outcome.service";
import type { QuickstartProgress, First48HoursData, SuccessMoment, SellerHealth } from "@/services/pilot.service";
import type { WhatsAppConnectionState, CommunicationPerformance } from "@/types/whatsapp";
import type { SellerContext, DailyMomentum } from "@/services/seller-context.service";
import KpiCard, { MiniKpiCard } from "@/components/shared/KpiCard";
import RevenueShield from "@/components/shared/RevenueShield";
import SystemNarrative from "@/components/shared/SystemNarrative";
import OperationalFeed from "@/components/live/OperationalFeed";
import RevenueStoryCard from "@/components/shared/RevenueStoryCard";
import TrustMomentumCard from "@/components/shared/TrustMomentumCard";
import SellerQuickstartCard from "@/components/shared/SellerQuickstartCard";
import First48HoursTracker from "@/components/shared/First48HoursTracker";
import SuccessMomentsFeed from "@/components/shared/SuccessMomentsFeed";
import SellerHealthCard from "@/components/shared/SellerHealthCard";
import WhatsAppConnectionCard from "@/components/shared/WhatsAppConnectionCard";
import CommunicationPerformanceCard from "@/components/shared/CommunicationPerformanceCard";
import OperationalPresenceLayer from "@/components/shared/OperationalPresenceLayer";
import SellerBusinessProfileCard from "@/components/shared/SellerBusinessProfileCard";
import MorningBriefCard from "@/components/shared/MorningBriefCard";
import DailyMomentumCard from "@/components/shared/DailyMomentumCard";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function OverviewPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const orgId = await getOrgFromUserId(session.user.id);
  if (!orgId) redirect("/onboarding");

  let [revenueAtRisk, needsAction, protectionStats, recentActivity, weeklyStory, trustMomentum, quickstart, first48, successMoments, sellerHealth, whatsappConnection, commPerf, sellerContext, dailyMomentum] = [0, 0, null as RevenueProtectionStats | null, [] as OperationEventRecord[], null as WeeklyStory | null, null as TrustMomentumData | null, null as QuickstartProgress | null, null as First48HoursData | null, [] as SuccessMoment[], null as SellerHealth | null, null as WhatsAppConnectionState | null, null as CommunicationPerformance | null, null as SellerContext | null, null as DailyMomentum | null];
  try {
    [revenueAtRisk, needsAction, protectionStats, recentActivity, weeklyStory, trustMomentum, quickstart, first48, successMoments, sellerHealth, whatsappConnection, commPerf, sellerContext, dailyMomentum] = await Promise.all([
      getRevenueAtRisk(orgId),
      getNeedsConfirmCount(orgId),
      getRevenueProtectionStats(orgId),
      getRecentActivity(orgId, 8),
      getWeeklyStory(orgId),
      getTrustMomentum(orgId),
      getQuickstartProgress(orgId),
      getFirst48Hours(orgId),
      getSuccessMoments(orgId, 8),
      getSellerHealth(orgId),
      getConnectionStatus(orgId),
      getCommunicationPerformance(orgId),
      getSellerContext(orgId),
      getDailyMomentum(orgId),
    ]);
  } catch (e) {
    console.error("[overview] service error", e);
  }

  const today = protectionStats?.todayStats;
  const protectedToday = today?.revenueSaved ?? 0;
  const preventedToday = today?.lossPrevented ?? 0;
  const confirmationRate = today?.confirmationRate ?? 0;

  const hasOutcomes = (today && today.totalActions > 0) ?? false;
  const tense = revenueAtRisk > 500;

  const sellerStyle = sellerContext?.style.style

  return (
    <OperationalPresenceLayer>
    <div className="space-y-section" data-state="live">
      <div className="flex items-start justify-between">
        <SystemNarrative
          title={tense ? "Revenue at risk" : "Live Revenue Stream"}
          narrative={
            tense
              ? `${revenueAtRisk.toFixed(0)} TND exposed — ${needsAction} orders need your attention`
              : hasOutcomes
              ? sellerContext?.narrative ?? `${protectedToday.toFixed(0)} TND protected today — ${needsAction} orders in queue`
              : sellerContext?.narrative ?? "No active risks — system monitoring incoming orders"
          }
          emotion={tense ? "tense" : "protective"}
          sellerStyle={sellerStyle}
        />
        <Link
          href="/orders/import"
          className="rounded-lg bg-[var(--accent)] px-4 py-2 text-xs font-medium text-white hover:bg-[var(--accent-hover)] transition-colors shrink-0"
        >
          + Import Orders
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-panel">
        <KpiCard
          label="Revenue at risk"
          value={`${revenueAtRisk.toFixed(0)} TND`}
          tier="high"
          emotion={tense ? "tense" : "calm"}
        />
        <KpiCard
          label="Orders needing action"
          value={needsAction}
          tier={needsAction > 0 ? "medium" : "low"}
          emotion={needsAction > 0 ? "tense" : "calm"}
        />
        <KpiCard
          label="Protection status"
          value={revenueAtRisk > 0 ? "Active" : "Stable"}
          tier={revenueAtRisk > 0 ? "low" : "neutral"}
          emotion={revenueAtRisk > 0 ? "protective" : "calm"}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-panel">
        {sellerContext && (
          <MorningBriefCard context={sellerContext} revenueAtRisk={revenueAtRisk} needsAction={needsAction} />
        )}
        {dailyMomentum && (
          <DailyMomentumCard data={dailyMomentum} hasOutcomes={hasOutcomes} />
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-panel">
        {sellerContext && (
          <SellerBusinessProfileCard context={sellerContext} />
        )}
        {sellerContext && (
          <SellerHealthCard data={sellerHealth} sellerStyle={sellerStyle} />
        )}
      </div>

      {protectedToday > 0 && (
        <RevenueShield
          protectedAmount={protectedToday}
          estimatedLossPrevented={preventedToday}
          continuityLabel={sellerContext?.continuity?.[0]?.text}
        />
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-panel">
        {quickstart && (
          <SellerQuickstartCard data={quickstart} />
        )}
        {first48 && (
          <First48HoursTracker data={first48} />
        )}
        {successMoments.length > 0 && (
          <SuccessMomentsFeed moments={successMoments} />
        )}
        {commPerf && (
          <CommunicationPerformanceCard data={commPerf} />
        )}
      </div>

      {hasOutcomes && (
        <div>
          <p className="text-caption text-[var(--text-tertiary)] mb-card">Today&apos;s Outcomes</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-card">
            <MiniKpiCard
              label="Revenue Protected"
              value={`${protectedToday.toFixed(0)} TND`}
              tier="low"
              emotion="protective"
            />
            <MiniKpiCard
              label="RTS Loss Prevented"
              value={`${preventedToday.toFixed(0)} TND`}
              tier="low"
              emotion="achievement"
            />
            <MiniKpiCard
              label="Confirmation Rate"
              value={`${confirmationRate}%`}
              tier={confirmationRate >= 70 ? "low" : confirmationRate >= 50 ? "medium" : "high"}
              emotion={confirmationRate >= 70 ? "protective" : "tense"}
            />
            <MiniKpiCard
              label="Actions Taken"
              value={today?.totalActions ?? 0}
              tier="neutral"
              emotion="achievement"
            />
          </div>
        </div>
      )}

      {!hasOutcomes && !tense && (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-panel text-center">
          <div className="h-10 w-10 rounded-full bg-[var(--border)] flex items-center justify-center mx-auto mb-4">
            <span className="text-sm text-[var(--text-tertiary)]">—</span>
          </div>
          <p className="text-sm font-medium text-[var(--text-primary)]">No actions taken yet today</p>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            <Link href="/confirm" className="text-[var(--accent)] hover:underline">
              Go to confirmation queue
            </Link>{" "}
            to start protecting revenue
          </p>
        </div>
      )}

      {whatsappConnection && (
        <WhatsAppConnectionCard data={whatsappConnection} />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-panel">
        <div className="lg:col-span-2">
          <RevenueStoryCard story={weeklyStory!} context={sellerContext ?? undefined} />
        </div>
        <div>
          <OperationalFeed events={recentActivity} />
        </div>
      </div>
      
      {trustMomentum && (
        <TrustMomentumCard data={trustMomentum} sellerStyle={sellerStyle} />
      )}
    </div>
    </OperationalPresenceLayer>
  );
}
