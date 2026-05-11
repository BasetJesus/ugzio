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
          <div key={i} className="animate-pulse rounded-xl border border-zinc-800 bg-zinc-900/30 p-4">
            <div className="mb-2 h-3 w-16 rounded bg-zinc-800" />
            <div className="h-8 w-20 rounded bg-zinc-800" />
          </div>
        ))}
      </div>
    )
  }

  if (type === "chart") {
    return (
      <div className="animate-pulse rounded-xl border border-zinc-800 bg-zinc-900/30 p-4">
        <div className="mb-4 h-3 w-32 rounded bg-zinc-800" />
        <div className="h-64 rounded bg-zinc-800/50" />
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="animate-pulse rounded-xl border border-zinc-800 bg-zinc-900/30 p-4">
          <div className="mb-2 h-4 w-3/4 rounded bg-zinc-800" />
          <div className="h-3 w-1/2 rounded bg-zinc-800" />
        </div>
      ))}
    </div>
  )
}
