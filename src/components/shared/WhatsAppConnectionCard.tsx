"use client"

import { useState } from "react"
import type { WhatsAppConnectionState, ConnectionStatus } from "@/types/whatsapp"

interface Props {
  data: WhatsAppConnectionState
}

const STATUS_CONFIG: Record<ConnectionStatus, { label: string; color: string; dot: string; action: string }> = {
  connected: { label: "Connecté", color: "text-[var(--success-green)]", dot: "bg-[var(--success-green)]", action: "Actif" },
  disconnected: { label: "Déconnecté", color: "text-[var(--text-tertiary)]", dot: "bg-[var(--text-tertiary)]", action: "Configurer" },
  pending: { label: "En attente", color: "text-[var(--warning-amber)]", dot: "bg-[var(--warning-amber)]", action: "En attente" },
  expired: { label: "Expiré", color: "text-[var(--risk-red)]", dot: "bg-[var(--risk-red)]", action: "Reconnecter" },
}

function formatDate(iso?: string): string {
  if (!iso) return "—"
  const d = new Date(iso)
  return d.toLocaleDateString("fr-TN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })
}

export default function WhatsAppConnectionCard({ data }: Props) {
  const cfg = STATUS_CONFIG[data.status]
  const [showSetup, setShowSetup] = useState(false)
  const [phoneNumberId, setPhoneNumberId] = useState(data.phoneNumberId ?? "")
  const [accessToken, setAccessToken] = useState("")
  const [phoneNumber, setPhoneNumber] = useState(data.phoneNumber ?? "")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  const needsSetup = data.status === "disconnected" || data.status === "expired" || !data.hasAccessToken

  async function handleSave() {
    setSaving(true)
    setError("")
    try {
      const res = await fetch("/api/v1/whatsapp/connection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: phoneNumberId && accessToken ? "connected" : "disconnected",
          phoneNumber: phoneNumber || undefined,
          phoneNumberId: phoneNumberId || undefined,
          accessToken: accessToken || undefined,
        }),
      })
      if (!res.ok) throw new Error("Erreur de sauvegarde")
      setShowSetup(false)
      window.location.reload()
    } catch {
      setError("Erreur de sauvegarde. Vérifie les champs et réessaie.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-medium text-[var(--text-tertiary)]">Connexion WhatsApp</p>
        <div className="flex items-center gap-1.5">
          <span className={`h-2 w-2 rounded-full ${cfg.dot}`} />
          <span className={`text-xs font-semibold ${cfg.color}`}>{cfg.label}</span>
        </div>
      </div>

      {!showSetup ? (
        <>
          <div className="space-y-2 text-xs text-[var(--text-secondary)]">
            {data.phoneNumber && (
              <div className="flex justify-between">
                <span>Téléphone</span>
                <span className="text-[var(--text-primary)]">{data.phoneNumber}</span>
              </div>
            )}
            {data.phoneNumberId && (
              <div className="flex justify-between">
                <span>Phone ID</span>
                <span className="text-[var(--text-primary)] font-mono text-[10px]">{data.phoneNumberId}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Statut</span>
              <span className={`text-[var(--text-primary)]`}>{cfg.label}</span>
            </div>
            <div className="flex justify-between">
              <span>Connecté le</span>
              <span className="text-[var(--text-primary)]">{formatDate(data.connectedAt)}</span>
            </div>
            {data.expiresAt && (
              <div className="flex justify-between">
                <span>Expire le</span>
                <span className="text-[var(--text-primary)]">{formatDate(data.expiresAt)}</span>
              </div>
            )}
          </div>

          {needsSetup && (
            <button
              onClick={() => setShowSetup(true)}
              className="mt-3 w-full rounded-lg bg-[var(--accent)] py-2.5 text-xs font-semibold text-white hover:bg-[var(--accent-hover)] transition-colors active:scale-[0.97] touch-manipulation"
            >
              {data.status === "expired" ? "Reconnecter" : "Configurer"}
            </button>
          )}

          {!needsSetup && data.status === "connected" && (
            <div className="mt-3 flex items-center justify-center gap-1.5 text-[10px] text-[var(--success-green)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--success-green)]" />
              Connecté et prêt à envoyer des messages
            </div>
          )}
        </>
      ) : (
        <div className="space-y-3">
          <p className="text-[10px] text-[var(--text-tertiary)] leading-relaxed">
            Entre les credentials de ton WhatsApp Business Account. Tu les trouves dans{" "}
            <a href="https://business.facebook.com/wa/manage/" target="_blank" rel="noopener noreferrer" className="underline hover:text-[var(--accent)]">
              Meta Business Manager
            </a>.
          </p>

          <div>
            <label className="text-[10px] font-medium text-[var(--text-secondary)]">Phone Number ID</label>
            <input
              type="text"
              value={phoneNumberId}
              onChange={(e) => setPhoneNumberId(e.target.value)}
              placeholder="123456789012345"
              className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-2 text-xs text-[var(--text-primary)] placeholder-[var(--text-tertiary)] outline-none focus:border-[var(--accent)]/50 font-mono"
            />
          </div>

          <div>
            <label className="text-[10px] font-medium text-[var(--text-secondary)]">Access Token</label>
            <input
              type="password"
              value={accessToken}
              onChange={(e) => setAccessToken(e.target.value)}
              placeholder="EAAx..."
              className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-2 text-xs text-[var(--text-primary)] placeholder-[var(--text-tertiary)] outline-none focus:border-[var(--accent)]/50 font-mono"
            />
          </div>

          <div>
            <label className="text-[10px] font-medium text-[var(--text-secondary)]">Numéro WhatsApp (optionnel)</label>
            <input
              type="text"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+216 XX XXX XXX"
              className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-2 text-xs text-[var(--text-primary)] placeholder-[var(--text-tertiary)] outline-none focus:border-[var(--accent)]/50"
            />
          </div>

          {error && (
            <p className="text-[10px] text-[var(--risk-red)]">{error}</p>
          )}

          <div className="flex gap-2">
            <button
              onClick={() => setShowSetup(false)}
              className="flex-1 rounded-lg border border-[var(--border)] py-2 text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-surface)] transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 rounded-lg bg-[var(--accent)] py-2 text-xs font-semibold text-white hover:bg-[var(--accent-hover)] disabled:opacity-50 transition-colors"
            >
              {saving ? "Enregistrement..." : "Connecter"}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
