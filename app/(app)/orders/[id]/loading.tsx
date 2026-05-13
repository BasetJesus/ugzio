export default function Loading() {
  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="h-4 w-32 animate-pulse rounded bg-zinc-800" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="animate-pulse rounded-xl border border-zinc-800 bg-zinc-900/30 p-5">
            <div className="mb-3 h-6 w-48 rounded bg-zinc-800" />
            <div className="h-4 w-32 rounded bg-zinc-800/50" />
          </div>
          <div className="animate-pulse rounded-xl border border-zinc-800 bg-zinc-900/30 p-5">
            <div className="mb-3 h-4 w-16 rounded bg-zinc-800" />
            <div className="h-10 w-full rounded bg-zinc-800/50" />
          </div>
        </div>
        <div className="animate-pulse rounded-xl border border-zinc-800 bg-zinc-900/30 p-5">
          <div className="mb-3 h-4 w-16 rounded bg-zinc-800" />
          <div className="space-y-3">
            <div className="h-4 w-full rounded bg-zinc-800/50" />
            <div className="h-4 w-3/4 rounded bg-zinc-800/50" />
          </div>
        </div>
      </div>
    </div>
  )
}
