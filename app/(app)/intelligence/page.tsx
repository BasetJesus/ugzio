import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { redirect } from "next/navigation";
import { getOrgFromUserId } from "@/lib/billing/enforce";
import { getCancellationAnalytics, getBuyerSentiment } from "@/services/cancellation-analytics.service";
import KpiCard from "@/components/shared/KpiCard";

export const dynamic = "force-dynamic";

function SectionHeader({ icon, label }: { icon: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm">{icon}</span>
      <span className="text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-widest">{label}</span>
      <div className="flex-1 h-px bg-[var(--border)] ml-3" />
    </div>
  )
}

function SentimentBar({ score, count, max, total }: { score: number; count: number; max: number; total: number }) {
  const pct = max > 0 ? (count / max) * 100 : 0
  const labels: Record<number, string> = { 1: "😠", 2: "😟", 3: "😐", 4: "🙂", 5: "😍" }
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm w-6 text-center">{labels[score] ?? score}</span>
      <div className="flex-1 h-5 rounded-full bg-[var(--bg-card)] overflow-hidden">
        <div
          className="h-full rounded-full bg-purple-600 transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs text-[var(--text-tertiary)] w-12 text-right">
        {total > 0 ? Math.round((count / total) * 100) : 0}%
      </span>
    </div>
  )
}

export default async function IntelligencePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const orgId = await getOrgFromUserId(session.user.id);
  if (!orgId) redirect("/onboarding");

  const [analytics, sentiment] = await Promise.all([
    getCancellationAnalytics(orgId),
    getBuyerSentiment(orgId),
  ]);

  const maxSentimentCount = Math.max(...Object.values(sentiment.distribution), 1);

  return (
    <div className="p-4 sm:p-6 space-y-8">
      <div>
        <h1 className="text-lg font-bold text-[var(--text-primary)]">Analyse des annulations</h1>
        <p className="text-sm text-[var(--text-tertiary)] mt-1">Intelligence de protection du revenu</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard label="Total commandes" value={analytics.totalOrders} tier="neutral" />
        <KpiCard
          label="Taux d'annulation"
          value={`${analytics.cancellationRate}%`}
          tier={analytics.cancellationRate > 20 ? "high" : analytics.cancellationRate > 10 ? "medium" : "low"}
          emotion={analytics.cancellationRate > 20 ? "tense" : analytics.cancellationRate > 10 ? "protective" : "calm"}
        />
        <KpiCard
          label="Taux de refus"
          value={`${analytics.refusalRate}%`}
          tier={analytics.refusalRate > 15 ? "high" : analytics.refusalRate > 5 ? "medium" : "low"}
        />
        <KpiCard
          label="Taux de livraison"
          value={`${analytics.deliveryRate}%`}
          tier={analytics.deliveryRate > 70 ? "low" : analytics.deliveryRate > 50 ? "medium" : "high"}
          emotion={analytics.deliveryRate > 70 ? "achievement" : analytics.deliveryRate > 50 ? "protective" : "tense"}
        />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KpiCard label="Annulé" value={analytics.cancelledCount} tier="high" emotion="tense" />
        <KpiCard label="Refusé" value={analytics.refusedCount} tier="medium" />
        <KpiCard label="Livré" value={analytics.deliveredCount} tier="low" emotion="achievement" />
        <KpiCard label="Confirmé" value={analytics.confirmedCount} tier="neutral" />
      </div>

      <div>
        <SectionHeader icon="🔬" label="Avant vs Après Confirmation (30 jours)" />
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4">
            <p className="text-[10px] font-medium text-[var(--text-tertiary)] uppercase tracking-wider mb-2">Avant confirmation</p>
            <p className="text-2xl font-extrabold text-red-400">{analytics.beforeAfter.beforeConfirm.rate}%</p>
            <p className="text-xs text-[var(--text-tertiary)] mt-1">
              {analytics.beforeAfter.beforeConfirm.cancelled} annulés / {analytics.beforeAfter.beforeConfirm.total} total
            </p>
          </div>
          <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4">
            <p className="text-[10px] font-medium text-[var(--text-tertiary)] uppercase tracking-wider mb-2">Après confirmation</p>
            <p className="text-2xl font-extrabold text-emerald-400">{analytics.beforeAfter.afterConfirm.rate}%</p>
            <p className="text-xs text-[var(--text-tertiary)] mt-1">
              {analytics.beforeAfter.afterConfirm.cancelled} annulés / {analytics.beforeAfter.afterConfirm.total} confirmés
            </p>
          </div>
        </div>
      </div>

      <div>
        <SectionHeader icon="💬" label="Sentiment acheteur" />
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4 mt-4 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-[var(--text-primary)]">Satisfaction moyenne</p>
            <p className="text-lg font-bold text-purple-400">{sentiment.averageSatisfaction} / 5</p>
          </div>
          <p className="text-xs text-[var(--text-tertiary)]">{sentiment.totalFeedback} réponses de feedback</p>
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((score) => (
              <SentimentBar
                key={score}
                score={score}
                count={sentiment.distribution[score] ?? 0}
                max={maxSentimentCount}
                total={sentiment.totalFeedback}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
