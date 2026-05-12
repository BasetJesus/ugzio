"use client"

import { FormEvent, useState } from "react"
import { useRouter } from "next/navigation"

export default function OnboardingSetupForm() {
  const router = useRouter()
  const [shopName, setShopName] = useState("")
  const [sellerPhone, setSellerPhone] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const res = await fetch("/api/v1/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shopName, sellerPhone }),
      })

      if (!res.ok) {
        const text = await res.text()
        let msg = "Une erreur est survenue"
        try {
          const data = JSON.parse(text)
          msg = data.error ?? msg
        } catch {
          msg = text || msg
        }
        setError(msg)
        return
      }

      router.refresh()
    } catch (err) {
      console.error("[OnboardingSubmit]", err)
      setError(err instanceof Error ? err.message : "Erreur réseau")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-lg p-4 sm:p-0">
      <div>
        <h1 className="text-xl font-bold text-zinc-100">Bienvenue sur UGZIO</h1>
        <p className="mt-1 text-sm text-zinc-500">Configurez votre boutique pour commencer</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="shopName" className="text-sm font-medium text-zinc-400">
              Nom de la boutique
            </label>
            <input
              id="shopName"
              type="text"
              value={shopName}
              onChange={(e) => setShopName(e.target.value)}
              required
              className="mt-1 w-full rounded-md border border-zinc-800/50 bg-zinc-900/30 px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 outline-none focus:border-green-500"
              placeholder="Ma Boutique"
            />
          </div>

          <div>
            <label htmlFor="sellerPhone" className="text-sm font-medium text-zinc-400">
              Numéro de téléphone
            </label>
            <input
              id="sellerPhone"
              type="tel"
              value={sellerPhone}
              onChange={(e) => setSellerPhone(e.target.value)}
              required
              className="mt-1 w-full rounded-md border border-zinc-800/50 bg-zinc-900/30 px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 outline-none focus:border-green-500"
              placeholder="+216 XX XXX XXX"
            />
          </div>

          {error && (
            <div className="rounded-md border border-red-800 bg-red-950/50 px-4 py-2 text-sm text-red-400">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-green-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-green-500 disabled:opacity-50"
          >
            {loading ? "..." : "Commencer"}
          </button>
        </form>
      </div>
    </div>
  )
}
