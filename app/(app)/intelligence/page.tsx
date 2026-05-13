import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/options"
import { redirect } from "next/navigation"
import { getOrgFromUserId } from "@/lib/billing/enforce"
import {
  getActionEffectiveness,
  getAvailableCities,
  getCohortSummary,
} from "@/services/attribution.service"
import type { EffectivenessFilters } from "@/services/attribution.service"

export const dynamic = "force-dynamic"

const ACTION_LABELS: Record<string, string> = {
  confirm: "Confirm",
  cancel: "Cancel",
  unreachable: "Unreachable",
  suspicious: "Suspicious",
  retry: "Retry",
  NO_ACTION: "No Action (Baseline)",
}

const SEQUENCE_LABELS: Record<string, string> = {
  trust: "Trust",
  reassurance: "Reassurance",
  urgency: "Urgency",
  reminder: "Reminder",
}

function deliveryRateTier(rate: number): string {
  if (rate >= 80) return "text-[var(--success-green)]"
  if (rate >= 60) return "text-[var(--warning-amber)]"
  return "text-[var(--risk-red)]"
}

function confidenceStyle(level: "high" | "medium" | "low"): string {
  switch (level) {
    case "high":
      return "bg-[var(--success-green-bg)] text-[var(--success-green)] border-[var(--success-green-border)]"
    case "medium":
      return "bg-[var(--warning-amber-bg)] text-[var(--warning-amber)] border-[var(--warning-amber-border)]"
    case "low":
      return "bg-[var(--kpi-red-bg)] text-[var(--risk-red)] border-[var(--kpi-red-border)]"
  }
}

function confidenceLabel(level: "high" | "medium" | "low", samples: number): string {
  switch (level) {
    case "high":
      return "High confidence"
    case "medium":
      return "Medium confidence — " + samples + " samples"
    case "low":
      return "Low confidence — only " + samples + " samples"
  }
}

function FilterSelect({
  name,
  label,
  options,
  current,
}: {
  name: string
  label: string
  options: { value: string; label: string }[]
  current: string | undefined
}) {
  return (
    <select
      name={name}
      defaultValue={current ?? ""}
      className="rounded-lg border border-[var(--border)] bg-[var(--bg-card)] px-3 py-1.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
    >
      <option value="">{label}</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  )
}

async function FiltersBar({
  orgId,
  current,
}: {
  orgId: string
  current: Record<string, string | undefined>
}) {
  const cities = await getAvailableCities(orgId)

  return (
    <form method="GET" className="flex flex-wrap items-center gap-inline">
      <FilterSelect
        name="action"
        label="All actions"
        options={[
          { value: "confirm", label: "Confirm" },
          { value: "cancel", label: "Cancel" },
          { value: "unreachable", label: "Unreachable" },
          { value: "suspicious", label: "Suspicious" },
          { value: "retry", label: "Retry" },
          { value: "NO_ACTION", label: "No Action (Baseline)" },
        ]}
        current={current.action}
      />
      <FilterSelect
        name="sequence"
        label="All sequences"
        options={[
          { value: "trust", label: "Trust" },
          { value: "reassurance", label: "Reassurance" },
          { value: "urgency", label: "Urgency" },
          { value: "reminder", label: "Reminder" },
        ]}
        current={current.sequence}
      />
      <FilterSelect
        name="risk"
        label="All risk levels"
        options={[
          { value: "high", label: "High risk" },
          { value: "medium", label: "Medium risk" },
          { value: "low", label: "Low risk" },
        ]}
        current={current.risk}
      />
      <FilterSelect
        name="firstTime"
        label="All buyers"
        options={[
          { value: "true", label: "First-time only" },
          { value: "false", label: "Returning only" },
        ]}
        current={current.firstTime}
      />
      {cities.length > 0 && (
        <FilterSelect
          name="city"
          label="All cities"
          options={cities.map((c) => ({ value: c, label: c }))}
          current={current.city}
        />
      )}
      <button
        type="submit"
        className="rounded-lg bg-[var(--accent)] px-3 py-1.5 text-xs font-medium text-white hover:bg-[var(--accent-hover)] transition-colors"
      >
        Apply
      </button>
      {Object.keys(current).length > 0 && (
        <a
          href="/intelligence"
          className="text-xs text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] underline"
        >
          Clear
        </a>
      )}
    </form>
  )
}

async function CohortCards({
  orgId,
  filters,
}: {
  orgId: string
  filters: EffectivenessFilters
}) {
  const cohorts = await Promise.all([
    getCohortSummary(orgId, "All orders", filters),
    getCohortSummary(orgId, "First-time buyers", {
      ...filters,
      firstTimeBuyer: true,
    }),
    getCohortSummary(orgId, "Returning buyers", {
      ...filters,
      firstTimeBuyer: false,
    }),
    getCohortSummary(orgId, "High risk", {
      ...filters,
      riskTier: "high",
    }),
  ])

  const visible = cohorts.filter((c) => c.sampleCount > 0)
  if (visible.length === 0) return null

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-card">
      {visible.map((cohort) => (
        <div
          key={cohort.label}
          className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-card"
        >
          <p className="text-caption text-[var(--text-tertiary)]">
            {cohort.label}
          </p>
          <p
            className={`text-display mt-1 ${deliveryRateTier(cohort.deliveryRate)}`}
          >
            {cohort.deliveryRate}%
          </p>
          <p className="text-[10px] text-[var(--text-tertiary)] mt-0.5">
            {cohort.sampleCount} orders
          </p>
          <span
            className={
              "inline-block mt-2 text-[9px] px-1.5 py-0.5 rounded border font-medium " +
              confidenceStyle(cohort.confidenceLevel)
            }
          >
            {confidenceLabel(cohort.confidenceLevel, cohort.sampleCount)}
          </span>
        </div>
      ))}
    </div>
  )
}

export default async function IntelligencePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>
}) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect("/login")

  const orgId = await getOrgFromUserId(session.user.id)
  if (!orgId) redirect("/onboarding")

  const raw = await searchParams
  const currentFilters: Record<string, string | undefined> = {}
  const filters: EffectivenessFilters = {}

  if (raw.action) {
    currentFilters.action = raw.action
    filters.actionTaken = raw.action
  }
  if (raw.sequence) {
    currentFilters.sequence = raw.sequence
    filters.sequenceType = raw.sequence
  }
  if (raw.risk) {
    currentFilters.risk = raw.risk
    filters.riskTier = raw.risk as "low" | "medium" | "high"
  }
  if (raw.firstTime) {
    currentFilters.firstTime = raw.firstTime
    filters.firstTimeBuyer = raw.firstTime === "true"
  }
  if (raw.city) {
    currentFilters.city = raw.city
    filters.city = raw.city
  }
  filters.days = 90

  const [rows] = await Promise.all([
    getActionEffectiveness(orgId, filters),
  ])

  const hasData = rows.length > 0

  return (
    <div className="space-y-section">
      <div>
        <h1 className="text-display-lg text-[var(--text-primary)]">
          Action Effectiveness
        </h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          What operational actions actually improve delivery outcomes
        </p>
      </div>

      <FiltersBar orgId={orgId} current={currentFilters} />

      <CohortCards orgId={orgId} filters={filters} />

      {!hasData && (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-panel text-center">
          <div className="h-10 w-10 rounded-full bg-[var(--border)] flex items-center justify-center mx-auto mb-4">
            <span className="text-sm text-[var(--text-tertiary)]">\u2014</span>
          </div>
          <p className="text-sm font-medium text-[var(--text-primary)]">
            Not enough outcome data yet
          </p>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            Action effectiveness data appears after orders have been acted on and delivery
            outcomes are known.
          </p>
        </div>
      )}

      {hasData && (
        <div className="overflow-x-auto rounded-xl border border-[var(--border)]">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--table-border)]">
                <th className="px-4 py-3 text-caption text-[var(--text-tertiary)] font-medium">
                  Action
                </th>
                <th className="px-4 py-3 text-caption text-[var(--text-tertiary)] font-medium">
                  Sequence
                </th>
                <th className="px-4 py-3 text-caption text-[var(--text-tertiary)] font-medium text-right">
                  Used
                </th>
                <th className="px-4 py-3 text-caption text-[var(--text-tertiary)] font-medium text-right">
                  Delivery Rate
                </th>
                <th className="px-4 py-3 text-caption text-[var(--text-tertiary)] font-medium text-right">
                  Avg Saved
                </th>
                <th className="px-4 py-3 text-caption text-[var(--text-tertiary)] font-medium text-right">
                  Avg Days
                </th>
                <th className="px-4 py-3 text-caption text-[var(--text-tertiary)] font-medium">
                  Confidence
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr
                  key={
                    row.actionTaken +
                    "-" +
                    (row.sequenceType ?? "manual") +
                    "-" +
                    (row.sequenceVersion ?? 0) +
                    "-" +
                    i
                  }
                  className={
                    "border-b border-[var(--table-border)] last:border-b-0 hover:bg-[var(--table-row-hover)] transition-colors" +
                    (row.actionTaken === "NO_ACTION"
                      ? " opacity-50"
                      : "")
                  }
                >
                  <td className="px-4 py-3">
                    <span className="text-[var(--text-primary)] font-medium text-sm">
                      {ACTION_LABELS[row.actionTaken] ?? row.actionTaken}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {row.sequenceType ? (
                      <span className="inline-flex items-center rounded-full bg-[var(--accent)]/10 px-2 py-0.5 text-xs font-medium text-[var(--accent)]">
                        {SEQUENCE_LABELS[row.sequenceType] ?? row.sequenceType}
                        {row.sequenceVersion != null && (
                          <span className="ml-1 text-[9px] opacity-60">
                            v{row.sequenceVersion}
                          </span>
                        )}
                      </span>
                    ) : (
                      <span className="text-[var(--text-tertiary)] text-xs">
                        {row.actionTaken === "NO_ACTION" ? "\u2014" : "Manual"}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-sm text-[var(--text-primary)]">
                    {row.timesUsed}
                  </td>
                  <td
                    className={
                      "px-4 py-3 text-right font-mono font-medium text-sm " +
                      deliveryRateTier(row.deliveryRate)
                    }
                  >
                    {row.deliveryRate}%
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-sm text-[var(--text-primary)]">
                    {row.avgRevenueSaved} TND
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-sm text-[var(--text-secondary)]">
                    {row.avgDaysToOutcome != null ? row.avgDaysToOutcome + "d" : "\u2014"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        "inline-block text-[9px] px-1.5 py-0.5 rounded border font-medium " +
                        confidenceStyle(row.confidenceLevel)
                      }
                    >
                      {confidenceLabel(row.confidenceLevel, row.timesUsed)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="text-[10px] text-[var(--text-tertiary)] text-center">
        Based on {filters.days}-day lookback. Groups with fewer than 5 samples are hidden.
        Baseline rows represent untouched orders for comparison.
      </p>
    </div>
  )
}
