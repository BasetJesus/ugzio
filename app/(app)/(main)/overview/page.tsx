import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { redirect } from "next/navigation";
import { getOrgFromUserId } from "@/lib/billing/enforce";
import { getRevenueAtRisk, getNeedsConfirmCount, getRevenueProtectionStats } from "@/services/demo-orchestrator.service";
import type { RevenueProtectionStats } from "@/services/demo-orchestrator.service";
import { getRecentActivity } from "@/services/operation-timeline.service";
import type { OperationEventRecord } from "@/services/operation-timeline.service";
import { getSellerContext } from "@/services/seller-context.service";
import type { SellerContext } from "@/services/seller-context.service";
import KpiCard, { MiniKpiCard } from "@/components/shared/KpiCard";
import RevenueShield from "@/components/shared/RevenueShield";
import SystemNarrative from "@/components/shared/SystemNarrative";
import OperationalFeed from "@/components/live/OperationalFeed";
import OperationalPresenceLayer from "@/components/shared/OperationalPresenceLayer";
import MorningBriefCard from "@/components/shared/MorningBriefCard";
import Link from "next/link";
import { getServerLang, st } from "@/lib/core/server-lang";

export const dynamic = "force-dynamic";

function SectionHeader({ icon, label, subtitle }: { icon: string; label: string; subtitle?: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm">{icon}</span>
      <span className="text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-widest">{label}</span>
      {subtitle && (
        <span className="text-[10px] text-[var(--text-tertiary)]/60 ml-auto">{subtitle}</span>
      )}
      <div className="flex-1 h-px bg-[var(--border)] ml-3" />
    </div>
  )
}

export default async function OverviewPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const orgId = await getOrgFromUserId(session.user.id);
  if (!orgId) redirect("/onboarding");

  const lang = await getServerLang();

  let [revenueAtRisk, needsAction, protectionStats, recentActivity, sellerContext] = [0, 0, null as RevenueProtectionStats | null, [] as OperationEventRecord[], null as SellerContext | null];
  try {
    [revenueAtRisk, needsAction, protectionStats, recentActivity, sellerContext] = await Promise.all([
      getRevenueAtRisk(orgId),
      getNeedsConfirmCount(orgId),
      getRevenueProtectionStats(orgId),
      getRecentActivity(orgId, 6),
      getSellerContext(orgId),
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

  const NARRATIVE = {
    "tense": {
      ar: `${revenueAtRisk.toFixed(0)} TND معرضة للخطر — ${needsAction} طلب تحتاج لاهتمامك`,
      fr: `${revenueAtRisk.toFixed(0)} TND exposés — ${needsAction} commande nécessitent votre attention`,
      en: `${revenueAtRisk.toFixed(0)} TND at risk — ${needsAction} order needs your attention`,
    },
    "has-outcomes": {
      ar: `${protectedToday.toFixed(0)} TND محمية اليوم — ${needsAction} طلب في الانتظار`,
      fr: `${protectedToday.toFixed(0)} TND protégés aujourd'hui — ${needsAction} commande en attente`,
      en: `${protectedToday.toFixed(0)} TND protected today — ${needsAction} order pending`,
    },
    "empty": {
      ar: "لا يوجد خطر نشط — النظام يراقب الطلبات الجديدة",
      fr: "Aucun risque actif — le système surveille les nouvelles commandes",
      en: "No active risk — monitoring new orders",
    },
  }

  return (
    <OperationalPresenceLayer>
    <div className="space-y-section" data-state="live">
      <SystemNarrative
        title={tense ? st(lang, "ov.revenue-at-risk") : st(lang, "ov.revenue-live")}
        narrative={
          tense
            ? NARRATIVE["tense"][lang]
            : hasOutcomes
            ? sellerContext?.narrative ?? NARRATIVE["has-outcomes"][lang]
            : sellerContext?.narrative ?? NARRATIVE["empty"][lang]
        }
        emotion={tense ? "tense" : "protective"}
        sellerStyle={sellerStyle}
      />

      <SectionHeader icon="🛡️" label={st(lang, "ov.section-protection")} subtitle={revenueAtRisk > 0 ? `${revenueAtRisk.toFixed(0)} TND ${st(lang, "ov.at-risk-amount").replace("{n}", "")}` : undefined} />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-panel">
        <KpiCard
          label={st(lang, "ov.revenue-at-risk")}
          value={`${revenueAtRisk.toFixed(0)} TND`}
          tier="high"
          emotion={tense ? "tense" : "calm"}
          href="/confirm"
        >
          {tense && <p className="text-[10px] text-red-400/60 mt-1">{st(lang, "ov.needs-action")}</p>}
        </KpiCard>
        <KpiCard
          label={st(lang, "ov.orders-to-process")}
          value={needsAction}
          tier={needsAction > 0 ? "medium" : "low"}
          emotion={needsAction > 0 ? "tense" : "calm"}
          href="/confirm"
        >
          {needsAction > 0 && <p className="text-[10px] text-amber-400/60 mt-1">{st(lang, "ov.decisions-pending")}</p>}
        </KpiCard>
        <KpiCard
          label={st(lang, "ov.protection-status")}
          value={revenueAtRisk > 0 ? st(lang, "ov.active") : st(lang, "ov.stable")}
          tier={revenueAtRisk > 0 ? "low" : "neutral"}
          emotion={revenueAtRisk > 0 ? "protective" : "calm"}
          href="/shield"
        >
          {revenueAtRisk === 0 && <p className="text-[10px] text-emerald-400/60 mt-1">{st(lang, "ov.all-protected")}</p>}
        </KpiCard>
      </div>

      {protectedToday > 0 && (
        <RevenueShield
          protectedAmount={protectedToday}
          estimatedLossPrevented={preventedToday}
          continuityLabel={sellerContext?.continuity?.[0]?.text}
        />
      )}

      {hasOutcomes && (
        <div>
          <p className="text-caption text-[var(--text-tertiary)] mb-3">{st(lang, "ov.results-today")}</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-card">
            <MiniKpiCard label={st(lang, "ov.protected-revenue")} value={`${protectedToday.toFixed(0)} TND`} tier="low" emotion="protective" href="/shield" />
            <MiniKpiCard label={st(lang, "ov.rts-prevented")} value={`${preventedToday.toFixed(0)} TND`} tier="low" emotion="achievement" href="/shield" />
            <MiniKpiCard label={st(lang, "ov.confirmation-rate")} value={`${confirmationRate}%`} tier={confirmationRate >= 70 ? "low" : confirmationRate >= 50 ? "medium" : "high"} emotion={confirmationRate >= 70 ? "protective" : "tense"} href="/confirm" />
            <MiniKpiCard label={st(lang, "ov.actions-taken")} value={today?.totalActions ?? 0} tier="neutral" emotion="achievement" href="/stats" />
          </div>
        </div>
      )}

      {!hasOutcomes && !tense && (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-6 text-center">
          <div className="w-12 h-12 rounded-full bg-[var(--state-protected-bg)] flex items-center justify-center mx-auto mb-3">
            <span className="text-lg">🛡️</span>
          </div>
          <p className="text-sm font-medium text-[var(--text-primary)]">{st(lang, "ov.empty-title")}</p>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            <Link href="/confirm" className="text-[var(--success-green)] hover:underline">{st(lang, "ov.empty-link")}</Link> {st(lang, "ov.empty-desc")}
          </p>
        </div>
      )}

      <SectionHeader icon="⚡" label={st(lang, "ov.section-act")} subtitle={needsAction > 0 ? `${needsAction} ${st(lang, "ov.pending-count").replace("{n}", "")}` : undefined} />

      {sellerContext && (
        <MorningBriefCard context={sellerContext} revenueAtRisk={revenueAtRisk} needsAction={needsAction} />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-panel">
        <OperationalFeed events={recentActivity} />
      </div>
    </div>
    </OperationalPresenceLayer>
  );
}
