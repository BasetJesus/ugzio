"use client"

import type { WeeklyStory } from "@/services/behavioral-outcome.service"

interface Props {
  story: WeeklyStory
}

export default function RevenueStoryCard({ story }: Props) {
  const hasRevenue = story.revenueProtected > 0
  if (!hasRevenue && story.totalActions === 0) return null

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] overflow-hidden">
      <div className="px-panel pt-panel pb-3 border-b border-[var(--border)]">
        <p className="text-caption text-[var(--text-tertiary)]">This Week</p>
        <h2 className="text-display text-[var(--text-primary)] mt-1">
          Revenue Story
        </h2>
        <p className="text-xs text-[var(--text-secondary)] mt-1">
          {hasRevenue
            ? `${story.revenueProtected.toFixed(0)} TND protected — ${story.failedDeliveriesPrevented} failed deliveries prevented`
            : "Building operational patterns"}
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-panel p-panel">
        <div>
          <p className="text-caption text-[var(--success-green)]">Revenue Protected</p>
          <p className="text-display text-[var(--success-green)] mt-0.5">
            {story.revenueProtected.toFixed(0)}
            <span className="text-base font-medium text-[var(--text-tertiary)] ml-1">TND</span>
          </p>
        </div>

        <div>
          <p className="text-caption text-[var(--accent)]">Best Sequence</p>
          <p className="text-display text-[var(--text-primary)] mt-0.5">
            {story.bestSequence}
          </p>
          {story.bestSequenceRate > 0 && (
            <p className="text-xs text-[var(--success-green)] mt-0.5">
              {story.bestSequenceRate}% delivery rate
            </p>
          )}
        </div>

        <div>
          <p className="text-caption text-[var(--text-tertiary)]">Deliveries Prevented</p>
          <p className="text-display text-[var(--text-primary)] mt-0.5">
            {story.failedDeliveriesPrevented}
          </p>
        </div>

        <div>
          <p className="text-caption text-[var(--text-tertiary)]">vs Last Week</p>
          <p className={`text-display mt-0.5 ${story.operationalImprovement > 0 ? "text-[var(--success-green)]" : story.operationalImprovement < 0 ? "text-[var(--risk-red)]" : "text-[var(--text-primary)]"}`}>
            {story.operationalImprovement > 0 ? "+" : ""}{story.operationalImprovement}%
          </p>
        </div>
      </div>
    </div>
  )
}
