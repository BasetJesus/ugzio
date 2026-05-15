"use client"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center p-6 py-24 text-center">
      <span className="text-4xl">⚠️</span>
      <h2 className="mt-4 text-lg font-semibold text-[var(--risk-red)]">Une erreur est survenue</h2>
      <p className="mt-1 text-sm text-[var(--text-secondary)]">{error.message || "Une erreur inattendue s'est produite."}</p>
      <button
        onClick={reset}
        className="mt-4 rounded-md bg-[var(--btn-green)] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[var(--btn-green-hover)]"
      >
        Réessayer
      </button>
    </div>
  )
}
