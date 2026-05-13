export default function Loading() {
  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="animate-pulse">
        <div className="mb-2 h-6 w-48 rounded bg-[var(--skeleton-bg)]" />
        <div className="h-4 w-64 rounded bg-[var(--skeleton-bg)]" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="animate-pulse rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4">
            <div className="mb-2 h-3 w-16 rounded bg-[var(--skeleton-bg)]" />
            <div className="h-8 w-20 rounded bg-[var(--skeleton-bg)]" />
          </div>
        ))}
      </div>
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="animate-pulse rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4">
            <div className="mb-2 h-4 w-3/4 rounded bg-[var(--skeleton-bg)]" />
            <div className="h-3 w-1/3 rounded bg-[var(--skeleton-bg)]" />
          </div>
        ))}
      </div>
    </div>
  )
}
