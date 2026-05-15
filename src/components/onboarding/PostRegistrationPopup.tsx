"use client"

import { useState, useEffect } from "react"

interface SocialLinks {
  instagram: string
  facebook: string
  tiktok: string
}

interface Props {
  open: boolean
  onClose: () => void
}

export default function PostRegistrationPopup({ open, onClose }: Props) {
  const [step, setStep] = useState<"brand" | "socials" | "whatsapp">("brand")
  const [brandDescription, setBrandDescription] = useState("")
  const [socialLinks, setSocialLinks] = useState<SocialLinks>({ instagram: "", facebook: "", tiktok: "" })
  const [saving, setSaving] = useState(false)
  const [whatsappStatus, setWhatsappStatus] = useState<"checking" | "connected" | "disconnected">("checking")

  useEffect(() => {
    if (!open) return
    setStep("brand")
    setBrandDescription("")
    setSocialLinks({ instagram: "", facebook: "", tiktok: "" })
    setWhatsappStatus("checking")

    fetch("/api/v1/seller-profile")
      .then((r) => r.json())
      .then((data) => {
        if (data.brandDescription) setBrandDescription(data.brandDescription)
        if (data.socialLinks) {
          setSocialLinks({
            instagram: data.socialLinks.instagram ?? "",
            facebook: data.socialLinks.facebook ?? "",
            tiktok: data.socialLinks.tiktok ?? "",
          })
        }
      })
      .catch(() => {})

    fetch("/api/v1/whatsapp/connection")
      .then((r) => r.json())
      .then((data) => {
        setWhatsappStatus(data.status === "connected" ? "connected" : "disconnected")
      })
      .catch(() => setWhatsappStatus("disconnected"))
  }, [open])

  async function saveBrand() {
    setSaving(true)
    await fetch("/api/v1/seller-profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ brandDescription }),
    })
    setSaving(false)
    setStep("socials")
  }

  async function saveSocials() {
    setSaving(true)
    await fetch("/api/v1/seller-profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ socialLinks }),
    })
    setSaving(false)
    setStep("whatsapp")
  }

  function handleFinish() {
    onClose()
  }

  function handleSkip() {
    onClose()
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-6 animate-fade-in-up">
        {/* Progress dots */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <span className={`h-1.5 w-8 rounded-full ${step === "brand" ? "bg-[var(--accent)]" : "bg-[var(--border)]"}`} />
          <span className={`h-1.5 w-8 rounded-full ${step === "socials" ? "bg-[var(--accent)]" : "bg-[var(--border)]"}`} />
          <span className={`h-1.5 w-8 rounded-full ${step === "whatsapp" ? "bg-[var(--accent)]" : "bg-[var(--border)]"}`} />
        </div>

        {step === "brand" && (
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-3xl mb-2">🏪</div>
              <h2 className="text-lg font-bold text-[var(--text-primary)]">Décris ta marque</h2>
              <p className="text-xs text-[var(--text-secondary)] mt-1">
                Tes clients verront cette description sur leur lien magique
              </p>
            </div>
            <textarea
              value={brandDescription}
              onChange={(e) => setBrandDescription(e.target.value)}
              placeholder="Ex: Boutique tunisienne spécialisée dans les accessoires de mode artisanaux..."
              rows={4}
              maxLength={500}
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-4 text-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)] resize-none focus:outline-none focus:border-[var(--accent)]/50"
            />
            <p className="text-[10px] text-[var(--text-tertiary)] text-right">{brandDescription.length}/500</p>
            <button
              onClick={saveBrand}
              disabled={saving}
              className="w-full rounded-xl bg-[var(--accent)] py-3 text-sm font-semibold text-white hover:bg-[var(--accent-hover)] disabled:opacity-50 transition-colors"
            >
              {saving ? "Enregistrement..." : "Suivant →"}
            </button>
          </div>
        )}

        {step === "socials" && (
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-3xl mb-2">📱</div>
              <h2 className="text-lg font-bold text-[var(--text-primary)]">Connecte tes réseaux</h2>
              <p className="text-xs text-[var(--text-secondary)] mt-1">
                Montre à tes clients que ta boutique est active et sociale
              </p>
            </div>
            {(["instagram", "facebook", "tiktok"] as const).map((platform) => (
              <div key={platform}>
                <label className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                  {platform === "instagram" ? "Instagram" : platform === "facebook" ? "Facebook" : "TikTok"}
                </label>
                <input
                  type="url"
                  value={socialLinks[platform]}
                  onChange={(e) => setSocialLinks((prev) => ({ ...prev, [platform]: e.target.value }))}
                  placeholder={`https://${platform}.com/...`}
                  className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-4 py-2.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)] outline-none focus:border-[var(--accent)]/50"
                />
              </div>
            ))}
            <button
              onClick={saveSocials}
              disabled={saving}
              className="w-full rounded-xl bg-[var(--accent)] py-3 text-sm font-semibold text-white hover:bg-[var(--accent-hover)] disabled:opacity-50 transition-colors"
            >
              {saving ? "Enregistrement..." : "Suivant →"}
            </button>
          </div>
        )}

        {step === "whatsapp" && (
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-3xl mb-2">💬</div>
              <h2 className="text-lg font-bold text-[var(--text-primary)]">Connecte WhatsApp</h2>
              <p className="text-xs text-[var(--text-secondary)] mt-1">
                Confirme tes commandes et communique avec tes clients automatiquement
              </p>
            </div>

            <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-[var(--text-secondary)]">Statut</span>
                <div className="flex items-center gap-1.5">
                  <span className={`h-2 w-2 rounded-full ${
                    whatsappStatus === "connected" ? "bg-[var(--success-green)]" : "bg-[var(--text-tertiary)]"
                  }`} />
                  <span className={`text-xs font-semibold ${
                    whatsappStatus === "connected" ? "text-[var(--success-green)]" : "text-[var(--text-tertiary)]"
                  }`}>
                    {whatsappStatus === "checking" ? "Vérification..." : whatsappStatus === "connected" ? "Connecté" : "Déconnecté"}
                  </span>
                </div>
              </div>
              {whatsappStatus !== "connected" && (
                <button
                  onClick={() => window.open("https://business.facebook.com/wa/manage/", "_blank")}
                  className="w-full rounded-lg bg-[var(--accent)] py-2.5 text-xs font-semibold text-white hover:bg-[var(--accent-hover)] transition-colors"
                >
                  Connecter WhatsApp Business
                </button>
              )}
            </div>

            <p className="text-[10px] text-[var(--text-tertiary)] text-center leading-relaxed">
              Tu pourras toujours modifier ces informations depuis les paramètres
            </p>

            <button
              onClick={handleFinish}
              className="w-full rounded-xl bg-[var(--accent)] py-3 text-sm font-semibold text-white hover:bg-[var(--accent-hover)] transition-colors"
            >
              Terminer
            </button>
          </div>
        )}

        {/* Skip link */}
        <button
          onClick={handleSkip}
          className="mt-4 w-full text-center text-xs text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors"
        >
          {step === "whatsapp" ? "Passer" : "Passer cette étape →"}
        </button>
      </div>
    </div>
  )
}
