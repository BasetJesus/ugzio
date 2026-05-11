export default function Loading() {
  return (
    <div className="space-y-3 p-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="animate-pulse rounded-xl border border-zinc-800 bg-zinc-900/30 p-4">
          <div className="mb-2 h-4 w-3/4 rounded bg-zinc-800" />
          <div className="h-3 w-1/2 rounded bg-zinc-800" />
        </div>
      ))}
    </div>
  )
}
