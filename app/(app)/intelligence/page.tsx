import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/options"
import { redirect } from "next/navigation"
import { getOrgFromUserId } from "@/lib/billing/enforce"
import { getActionEffectiveness } from "@/services/attribution.service"

export const dynamic = "force-dynamic"

function deliveryRateTier(rate: number): string {
  if (rate >= 80) return "text-[var(--success-green)]"
  if (rate >= 60) return "text-[var(--warning-amber)]"
  return "text-[var(--risk-red)]"
}

const ACTION_LABELS: Record<string, string> = {
  confirm: "Confirm",
  cancel: "Cancel",
  unreachable: "Unreachable",
  suspicious: "Suspicious",
  retry: "Retry",
}

const SEQUENCE_LABELS: Record<string, string> = {
  trust: "Trust",
  reassurance: "Reassurance",
  urgency: "Urgency",
  reminder: "Reminder",
}

export default async function IntelligencePage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect("/login")

  const orgId = await getOrgFromUserId(session.user.id)
  if (!orgId) redirect("/onboarding")

  const rows = await getActionEffectiveness(orgId, 30)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-[var(--text-primary)]">Action Effectiveness</h1>
        <p className="text-xs text-[var(--text-secondary)] mt-0.5">
          What operational actions actually improve delivery outcomes
        </p>
      </div>

      {rows.length === 0 && (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-6 text-center">
          <p className="text-sm font-medium text-[var(--text-primary)]">
            Not enough outcome data yet
          </p>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            Actions will appear here after orders have been confirmed and delivery outcomes are known.
          </p>
        </div>
      )}

      {rows.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-[var(--border)]">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--bg-card)]">
                <th className="px-4 py-3 font-medium text-[var(--text-secondary)] text-xs uppercase tracking-wider">Action</th>
                <th className="px-4 py-3 font-medium text-[var(--text-secondary)] text-xs uppercase tracking-wider">Sequence</th>
                <th className="px-4 py-3 font-medium text-[var(--text-secondary)] text-xs uppercase tracking-wider text-right">Times Used</th>
                <th className="px-4 py-3 font-medium text-[var(--text-secondary)] text-xs uppercase tracking-wider text-right">Delivery Rate</th>
                <th className="px-4 py-3 font-medium text-[var(--text-secondary)] text-xs uppercase tracking-wider text-right">Avg Revenue/Order</th>
                <th className="px-4 py-3 font-medium text-[var(--text-secondary)] text-xs uppercase tracking-wider text-right">Avg Days to Outcome</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr
                  key={`${row.actionTaken}-${row.sequenceType ?? "manual"}-${i}`}
                  className="border-b border-[var(--border)] last:border-b-0 hover:bg-[var(--bg-card)]/50 transition-colors"
                >
                  <td className="px-4 py-3">
                    <span className="text-[var(--text-primary)] font-medium">
                      {ACTION_LABELS[row.actionTaken] ?? row.actionTaken}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {row.sequenceType ? (
                      <span className="inline-flex items-center rounded-full bg-[var(--accent)]/10 px-2 py-0.5 text-xs font-medium text-[var(--accent)]">
                        {SEQUENCE_LABELS[row.sequenceType] ?? row.sequenceType}
                      </span>
                    ) : (
                      <span className="text-[var(--text-tertiary)]">Manual</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-[var(--text-primary)]">
                    {row.timesUsed}
                  </td>
                  <td className={`px-4 py-3 text-right font-mono font-semibold ${deliveryRateTier(row.deliveryRate)}`}>
                    {row.deliveryRate}%
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-[var(--text-primary)]">
                    {row.avgRevenueSaved} TND
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-[var(--text-secondary)]">
                    {row.avgDaysToOutcome != null ? `${row.avgDaysToOutcome}d` : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-[10px] text-[var(--text-tertiary)] text-center">
        Based on actions with confirmed delivery outcomes in the last 30 days. Data updates in real time.
      </p>
    </div>
  )
}
