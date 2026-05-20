export default function Loading() {
  return (
    <div className="space-y-3 p-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="animate-pulse rounded-xl border border-[var(--border)] bg-[var(--skeleton-bg)] p-4">
          <div className="mb-2 h-4 w-3/4 rounded bg-[var(--skeleton-bg)]" />
          <div className="h-3 w-1/2 rounded bg-[var(--skeleton-bg)]" />
        </div>
      ))}
    </div>
  )
}
