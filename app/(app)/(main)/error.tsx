"use client"

export default function MainError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4">
      <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-8 text-center max-w-md">
        <div className="mb-4 text-4xl">⚠️</div>
        <h2 className="mb-2 text-lg font-semibold text-[var(--text-primary)]">Something went wrong</h2>
        <p className="mb-6 text-sm text-[var(--text-muted)]">
          {error.message || "An unexpected error occurred. Please try again."}
        </p>
        <button
          onClick={reset}
          className="rounded-lg bg-[var(--accent)] px-6 py-2 text-sm font-medium text-black transition hover:brightness-95"
        >
          Try again
        </button>
      </div>
    </div>
  )
}
