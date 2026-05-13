export default function LoadingSkeleton({
  lines = 3,
  type = "list",
}: {
  lines?: number
  type?: "list" | "card" | "chart"
}) {
  if (type === "card") {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="animate-pulse p-4">
            <div className="mb-2 h-3 w-16 rounded bg-[var(--skeleton-bg)]" />
            <div className="h-8 w-20 rounded bg-[var(--skeleton-bg)]" />
          </div>
        ))}
      </div>
    )
  }

  if (type === "chart") {
    return (
      <div className="animate-pulse p-4">
        <div className="mb-4 h-3 w-32 rounded bg-[var(--skeleton-bg)]" />
        <div className="h-64 rounded bg-[var(--skeleton-bg)] opacity-60" />
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="animate-pulse p-4">
          <div className="mb-2 h-4 w-3/4 rounded bg-[var(--skeleton-bg)]" />
          <div className="h-3 w-1/2 rounded bg-[var(--skeleton-bg)]" />
        </div>
      ))}
    </div>
  )
}
