"use client"

export default function OrderDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center p-6 py-24 text-center">
      <span className="text-4xl">⚠️</span>
      <h2 className="mt-4 text-lg font-semibold text-red-400">Failed to load order</h2>
      <p className="mt-1 text-sm text-zinc-500">{error.message || "An unexpected error occurred."}</p>
      <button
        onClick={reset}
        className="mt-4 rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-400"
      >
        Try again
      </button>
    </div>
  )
}
