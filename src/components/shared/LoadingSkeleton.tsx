"use client"

type SkelVariant = "card" | "list" | "chart"

interface LoadingSkeletonProps {
  variant?: SkelVariant
  count?: number
}

function SkeletonCard() {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4 animate-pulse">
      <div className="h-3 w-20 bg-[var(--skeleton-bg)] rounded mb-3" />
      <div className="h-8 w-32 bg-[var(--skeleton-bg)] rounded mb-2" />
      <div className="h-2 w-24 bg-[var(--skeleton-bg)] rounded" />
    </div>
  )
}

function SkeletonListItem() {
  return (
    <div className="flex items-center gap-3 p-3 animate-pulse">
      <div className="h-8 w-8 rounded-full bg-[var(--skeleton-bg)] flex-shrink-0" />
      <div className="flex-1 space-y-1.5">
        <div className="h-3 w-40 bg-[var(--skeleton-bg)] rounded" />
        <div className="h-2 w-24 bg-[var(--skeleton-bg)] rounded" />
      </div>
      <div className="h-6 w-16 bg-[var(--skeleton-bg)] rounded" />
    </div>
  )
}

function SkeletonChart() {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4 animate-pulse">
      <div className="h-3 w-28 bg-[var(--skeleton-bg)] rounded mb-4" />
      <div className="flex items-end gap-2 h-32">
        {[40, 70, 50, 90, 60, 80, 45].map((h, i) => (
          <div
            key={i}
            className="flex-1 rounded-t bg-[var(--skeleton-bg)]"
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
    </div>
  )
}

export default function LoadingSkeleton({ variant = "card", count = 3 }: LoadingSkeletonProps) {
  const items = Array.from({ length: count }, (_, i) => i)

  switch (variant) {
    case "list":
      return (
        <div className="divide-y divide-[var(--border)]">
          {items.map((i) => <SkeletonListItem key={i} />)}
        </div>
      )
    case "chart":
      return <SkeletonChart />
    case "card":
    default:
      return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {items.map((i) => <SkeletonCard key={i} />)}
        </div>
      )
  }
}
