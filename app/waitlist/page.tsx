"use client"

import { useState, type FormEvent } from "react"

const NICHES = [
  { value: "", label: "Sélectionnez votre niche" },
  { value: "mode", label: "Mode / Vêtements" },
  { value: "cosmetique", label: "Cosmétique / Beauté" },
  { value: "parfumerie", label: "Parfumerie" },
  { value: "accessoires", label: "Accessoires" },
  { value: "alimentation", label: "Alimentation" },
  { value: "autre", label: "Autre" },
]

export default function WaitlistPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [niche, setNiche] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!name.trim() || !email.trim()) {
      setError("Nom et email requis")
      return
    }
    setError("")
    setLoading(true)
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), phone: phone.trim() || null, niche: niche || null }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || "Erreur lors de l'inscription")
      }
      setSubmitted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue")
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="flex min-h-dvh items-center justify-center px-5" style={{ backgroundColor: "#0a0a0a" }}>
        <div className="w-full max-w-sm text-center">
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full" style={{ backgroundColor: "rgba(124,58,237,0.15)" }}>
            <span className="text-2xl text-white">✓</span>
          </div>
          <h1 className="text-lg font-bold text-white">Vous êtes sur la liste</h1>
          <p className="mt-3 text-sm text-white/50 leading-relaxed">
            Nous vous contacterons en priorité dès que UGZIO sera disponible pour les vendeurs tunisiens.
          </p>
          <a
            href="/"
            className="mt-6 inline-block rounded-lg px-6 py-3 text-sm font-semibold text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{ backgroundColor: "#7c3aed" }}
          >
            Retour à l&apos;accueil
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-dvh items-center justify-center px-5" style={{ backgroundColor: "#0a0a0a" }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <a href="/" className="inline-block text-sm font-bold tracking-tight mb-6" style={{ color: "#7c3aed" }}>UGZIO</a>
          <h1 className="text-lg font-bold text-white">Rejoindre la liste d&apos;attente</h1>
          <p className="mt-2 text-sm text-white/50">Accès prioritaire pour les 100 premiers vendeurs</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              placeholder="Nom complet"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-transparent px-4 py-3.5 text-sm text-white placeholder:text-white/30 outline-none transition-colors focus:border-white/30"
              style={{ backgroundColor: "rgba(255,255,255,0.03)" }}
              required
            />
          </div>

          <div>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-transparent px-4 py-3.5 text-sm text-white placeholder:text-white/30 outline-none transition-colors focus:border-white/30"
              style={{ backgroundColor: "rgba(255,255,255,0.03)" }}
              required
            />
          </div>

          <div>
            <input
              type="tel"
              placeholder="WhatsApp (optionnel)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-transparent px-4 py-3.5 text-sm text-white placeholder:text-white/30 outline-none transition-colors focus:border-white/30"
              style={{ backgroundColor: "rgba(255,255,255,0.03)" }}
            />
          </div>

          <div>
            <select
              value={niche}
              onChange={(e) => setNiche(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-transparent px-4 py-3.5 text-sm text-white outline-none transition-colors focus:border-white/30"
              style={{ backgroundColor: "rgba(255,255,255,0.03)" }}
            >
              {NICHES.map((n) => (
                <option key={n.value} value={n.value} className="text-black">{n.label}</option>
              ))}
            </select>
          </div>

          {error && (
            <div className="rounded-lg px-4 py-2.5 text-xs text-white" style={{ backgroundColor: "rgba(220,38,38,0.15)" }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl px-6 py-3.5 text-sm font-semibold text-white transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60"
            style={{ backgroundColor: "#7c3aed" }}
          >
            {loading ? "Inscription..." : "Rejoindre la liste d'attente"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-white/30">
          <a href="/" className="hover:text-white/50 transition-colors">← Retour à l&apos;accueil</a>
        </p>
      </div>
    </div>
  )
}
