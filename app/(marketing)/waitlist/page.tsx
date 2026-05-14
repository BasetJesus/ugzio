'use client'

import { useState, type FormEvent } from "react"
import Navbar from "@/components/landing/Navbar"
import Footer from "@/components/landing/Footer"

const NICHES = [
  { value: "", label: "Sélectionnez votre niche" },
  { value: "mode", label: "Mode / Vêtements" },
  { value: "cosmetique", label: "Cosmétique / Beauté" },
  { value: "parfumerie", label: "Parfumerie" },
  { value: "accessoires", label: "Accessoires" },
  { value: "alimentation", label: "Alimentation / Épicerie" },
  { value: "electronique", label: "Électronique" },
  { value: "autre", label: "Autre" },
]

const ORDERS_RANGES = [
  { value: "", label: "Commandes par mois" },
  { value: "0-50", label: "Moins de 50" },
  { value: "50-200", label: "50 — 200" },
  { value: "200-500", label: "200 — 500" },
  { value: "500+", label: "500+" },
]

export default function WaitlistPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [niche, setNiche] = useState("")
  const [orders, setOrders] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState("")
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  function validate(): boolean {
    const errors: Record<string, string> = {}
    if (!name.trim()) errors.name = "Nom requis"
    if (!email.trim()) errors.email = "Email requis"
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "Email invalide"
    if (phone && !/^(\+216)?[0-9]{8,}$/.test(phone.replace(/\s/g, ""))) errors.phone = "Numéro invalide (ex: +216 XX XXX XXX)"
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!validate()) return
    setError("")
    setLoading(true)
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim() || null,
          niche: niche || null,
        }),
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
      <div style={{ backgroundColor: "#0a0a0a" }} className="min-h-dvh flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center px-5">
          <div className="w-full max-w-[28rem] text-center">
            <div className="landing-glass rounded-2xl p-8 sm:p-10">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10 border border-green-500/20">
                <span className="text-3xl animate-scale-bounce">✅</span>
              </div>
              <h1 className="text-xl font-bold text-white">Tu es sur la liste! 🎉</h1>
              <p className="mt-3 text-sm text-white/50 leading-relaxed">
                On t&apos;a envoyé un email de confirmation. On te contactera en priorité{" "}
                <span className="text-purple-400 font-medium">dès le lancement</span>.
              </p>
              <div className="mt-6 p-4 rounded-xl bg-amber-500/5 border border-amber-500/10">
                <p className="text-xs text-amber-400/80">
                  <span className="font-medium">⏳ Position:</span> Tu fais partie des 100 premiers vendeurs.
                  Accès prioritaire et support dédié garantis.
                </p>
              </div>
              <a
                href="/"
                className="mt-6 inline-flex items-center justify-center rounded-xl px-8 py-3.5 text-sm font-semibold text-white transition-all hover:scale-[1.02] active:scale-[0.97] landing-glow-purple"
                style={{ backgroundColor: "#7c3aed" }}
              >
                ← Retour à l&apos;accueil
              </a>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div style={{ backgroundColor: "#0a0a0a" }} className="min-h-dvh flex flex-col">
      <Navbar />
      <main className="flex-1 pt-24 pb-16">
        <div className="mx-auto max-w-[72rem] px-5">
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-16 items-start">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-1.5 mb-6 landing-glass">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                <span className="text-[11px] text-white/50 tracking-wide">
                  Moins de 100 places disponibles
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight">
                Sois parmi les{" "}
                <span className="landing-text-gradient">100 premiers</span> à
                protéger ton revenue COD.
              </h1>

              <p className="mt-4 text-sm text-white/40 leading-relaxed">
                On lance UGZIO avec un nombre limité de vendeurs tunisiens.
                Accès prioritaire, support WhatsApp dédié, et configuration
                offerte.
              </p>

              <div className="mt-8 space-y-4">
                {[
                  { icon: "🛡️", text: "Protection revenue immédiate", sub: "Dès le jour 1, UGZIO analyse et protège tes commandes" },
                  { icon: "🎯", text: "Configuration personnalisée", sub: "On adapte les séquences WhatsApp à ta niche et ton style" },
                  { icon: "💬", text: "Support WhatsApp dédié", sub: "Accès direct à l'équipe UGZIO sur WhatsApp" },
                  { icon: "💰", text: "Prix lancée préférentiel", sub: "Tarif spécial pour les 100 premiers inscrits" },
                ].map((benefit) => (
                  <div key={benefit.text} className="flex items-start gap-3">
                    <span className="text-lg mt-0.5">{benefit.icon}</span>
                    <div>
                      <p className="text-sm font-medium text-white">{benefit.text}</p>
                      <p className="text-xs text-white/40 mt-0.5">{benefit.sub}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 landing-glass rounded-xl p-5">
                <p className="text-xs text-white/30 uppercase tracking-wider mb-3">Déjà inscrits</p>
                <div className="flex items-center gap-4">
                  <div className="flex -space-x-2">
                    {["@boutique_sfax", "@parfum_tunis", "@cosmetique_sousse", "@electronix_tn"].map((h, i) => (
                      <div
                        key={h}
                        className="h-8 w-8 rounded-full border-2 border-[#0a0a0a] flex items-center justify-center text-[10px] font-bold text-white"
                        style={{ backgroundColor: "#7c3aed", zIndex: 4 - i }}
                      >
                        {h[1].toUpperCase()}
                      </div>
                    ))}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">47+ vendeurs</p>
                    <p className="text-xs text-green-400/60">ont déjà rejoint</p>
                  </div>
                </div>
                <div className="mt-4 h-2 rounded-full bg-white/5 overflow-hidden">
                  <div className="h-full rounded-full bg-purple-500 transition-all duration-700" style={{ width: "47%" }} />
                </div>
                <p className="text-[10px] text-white/30 mt-1.5">47 / 100 places remplies</p>
              </div>
            </div>

            <div className="lg:sticky lg:top-28">
              <div className="landing-glass rounded-2xl p-6 sm:p-8">
                <h2 className="text-base font-bold text-white mb-1">Rejoins l&apos;attente</h2>
                <p className="text-xs text-white/40 mb-6">
                  On te préviendra en priorité au lancement
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="text-[10px] text-white/30 uppercase tracking-wider mb-1.5 block">
                      Nom complet <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="ex: Ahmed Ben Ali"
                      value={name}
                      onChange={(e) => { setName(e.target.value); setFieldErrors((prev) => ({ ...prev, name: "" })) }}
                      className={`w-full rounded-xl border bg-transparent px-4 py-3.5 text-sm text-white placeholder:text-white/20 outline-none transition-all focus:border-white/30 ${
                        fieldErrors.name ? "border-red-500/40" : "border-white/10"
                      }`}
                      style={{ backgroundColor: "rgba(255,255,255,0.02)" }}
                    />
                    {fieldErrors.name && <p className="text-[10px] text-red-400 mt-1">{fieldErrors.name}</p>}
                  </div>

                  <div>
                    <label className="text-[10px] text-white/30 uppercase tracking-wider mb-1.5 block">
                      Email <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="email"
                      placeholder="ex: ahmed@exemple.com"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setFieldErrors((prev) => ({ ...prev, email: "" })) }}
                      className={`w-full rounded-xl border bg-transparent px-4 py-3.5 text-sm text-white placeholder:text-white/20 outline-none transition-all focus:border-white/30 ${
                        fieldErrors.email ? "border-red-500/40" : "border-white/10"
                      }`}
                      style={{ backgroundColor: "rgba(255,255,255,0.02)" }}
                    />
                    {fieldErrors.email && <p className="text-[10px] text-red-400 mt-1">{fieldErrors.email}</p>}
                  </div>

                  <div>
                    <label className="text-[10px] text-white/30 uppercase tracking-wider mb-1.5 block">
                      WhatsApp
                    </label>
                    <input
                      type="tel"
                      placeholder="+216 XX XXX XXX"
                      value={phone}
                      onChange={(e) => { setPhone(e.target.value); setFieldErrors((prev) => ({ ...prev, phone: "" })) }}
                      className={`w-full rounded-xl border bg-transparent px-4 py-3.5 text-sm text-white placeholder:text-white/20 outline-none transition-all focus:border-white/30 ${
                        fieldErrors.phone ? "border-red-500/40" : "border-white/10"
                      }`}
                      style={{ backgroundColor: "rgba(255,255,255,0.02)" }}
                    />
                    {fieldErrors.phone && <p className="text-[10px] text-red-400 mt-1">{fieldErrors.phone}</p>}
                  </div>

                  <div>
                    <label className="text-[10px] text-white/30 uppercase tracking-wider mb-1.5 block">
                      Niche
                    </label>
                    <select
                      value={niche}
                      onChange={(e) => setNiche(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-transparent px-4 py-3.5 text-sm text-white outline-none transition-all focus:border-white/30"
                      style={{ backgroundColor: "rgba(255,255,255,0.02)" }}
                    >
                      {NICHES.map((n) => (
                        <option key={n.value} value={n.value} className="bg-[#0a0a0a] text-white">{n.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] text-white/30 uppercase tracking-wider mb-1.5 block">
                      Volume de commandes
                    </label>
                    <select
                      value={orders}
                      onChange={(e) => setOrders(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-transparent px-4 py-3.5 text-sm text-white outline-none transition-all focus:border-white/30"
                      style={{ backgroundColor: "rgba(255,255,255,0.02)" }}
                    >
                      {ORDERS_RANGES.map((r) => (
                        <option key={r.value} value={r.value} className="bg-[#0a0a0a] text-white">{r.label}</option>
                      ))}
                    </select>
                  </div>

                  {error && (
                    <div className="rounded-xl px-4 py-3 text-xs text-white border" style={{ backgroundColor: "rgba(220,38,38,0.1)", borderColor: "rgba(220,38,38,0.2)" }}>
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="group relative w-full rounded-xl px-6 py-4 text-sm font-semibold text-white transition-all hover:scale-[1.01] active:scale-[0.98] disabled:opacity-60 overflow-hidden landing-glow-purple"
                    style={{ backgroundColor: "#7c3aed" }}
                  >
                    <span className="relative z-10">
                      {loading ? "Inscription..." : "🔒 Rejoindre la liste d'attente"}
                    </span>
                    <span className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors" />
                  </button>
                </form>

                <p className="mt-4 text-[10px] text-white/20 text-center leading-relaxed">
                  En t&apos;inscrivant, tu acceptes d&apos;être contacté par UGZIO concernant le lancement.
                  Aucun spam. Désinscription à tout moment.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
