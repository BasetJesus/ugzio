export default function Loading() {
  return (
    <div className="p-4">
      <div className="mb-6 h-6 w-48 animate-pulse rounded bg-zinc-800" />
      <div className="space-y-4">
        <div className="h-12 w-full animate-pulse rounded-xl bg-zinc-900/30" />
        <div className="h-12 w-full animate-pulse rounded-xl bg-zinc-900/30" />
      </div>
    </div>
  )
}
