"use client"

import { useState, useRef, type ChangeEvent, type DragEvent } from "react"
import { trackUGCTrigger, trackWhatsAppClick } from "@/lib/analytics"
import type { BuyerOrderView } from "@/services/buyer-order.service"

interface Props {
  order: BuyerOrderView
}

export default function BuyerUGCPrompt({ order }: Props) {
  const [dismissed, setDismissed] = useState(false)
  const [mode, setMode] = useState<"choice" | "upload" | "preview" | "success">("choice")
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [caption, setCaption] = useState("")
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState("")
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  if (order.phase !== "delivered" && order.phase !== "completed") return null
  if (dismissed) return null

  const ugcMessage = `Salem ${order.buyerName}!, J'ai reçu ma commande ${order.product ? `de ${order.product} ` : ""}et je confirme que tout va bien ✅`

  function handleWhatsApp() {
    trackUGCTrigger(order.orderId, { method: "whatsapp_photo" })
    trackWhatsAppClick("ugc_photo_share", { orderId: order.orderId })
    const phone = (order.sellerPhone ?? "").replace(/\s/g, "")
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(ugcMessage)}`, "_blank")
    setDismissed(true)
  }

  function handleFileSelect(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (f) validateAndSetFile(f)
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault()
    setDragOver(false)
    const f = e.dataTransfer.files?.[0]
    if (f) validateAndSetFile(f)
  }

  function validateAndSetFile(f: File) {
    setError("")
    const allowed = ["image/jpeg", "image/png", "image/webp", "video/mp4", "video/quicktime"]
    if (!allowed.includes(f.type)) {
      setError("Format non supporté. Utilisez JPG, PNG, WebP, MP4 ou MOV.")
      return
    }
    if (f.size > 5 * 1024 * 1024) {
      setError("Fichier trop volumineux. Maximum 5 MB.")
      return
    }
    setFile(f)
    setPreview(URL.createObjectURL(f))
    setMode("preview")
  }

  async function handleUpload() {
    if (!file) return
    setUploading(true)
    setError("")

    try {
      const formData = new FormData()
      formData.append("token", order.token)
      formData.append("file", file)
      if (caption.trim()) formData.append("caption", caption.trim())

      const res = await fetch("/api/v1/ugc/upload", { method: "POST", body: formData })
      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: "Erreur" }))
        throw new Error(data.error || "Upload failed")
      }

      trackUGCTrigger(order.orderId, { method: "web_upload" })
      setMode("success")
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erreur lors de l'envoi. Réessayez.")
    } finally {
      setUploading(false)
    }
  }

  function reset() {
    setMode("choice")
    setFile(null)
    setPreview(null)
    setCaption("")
    setError("")
  }

  return (
    <div className="rounded-xl border border-purple-500/20 bg-gradient-to-b from-purple-500/5 to-transparent p-4 animate-fade-in-up">
      <div className="flex items-start gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-purple-500/10">
          <span className="text-sm">📸</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-[var(--text-primary)]">T7eb tsa3edna ?</p>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5 leading-relaxed">
            Envoie-nous une photo de ton produit et gagne 15 TND de crédit 🎁
          </p>

          {mode === "choice" && (
            <div className="flex flex-col gap-2 mt-3">
              <button
                onClick={() => setMode("upload")}
                className="w-full rounded-lg bg-purple-600 hover:bg-purple-500 py-2.5 px-4 text-center text-xs font-medium text-white transition-all duration-150 active:scale-[0.98]"
              >
                📤 Envoyer directement ici
              </button>
              <button
                onClick={handleWhatsApp}
                className="w-full rounded-lg bg-green-600 hover:bg-green-500 py-2.5 px-4 text-center text-xs font-medium text-white transition-all duration-150 active:scale-[0.98]"
              >
                💬 Envoyer via WhatsApp
              </button>
              <button
                onClick={() => { trackUGCTrigger(order.orderId, { method: "dismiss" }); setDismissed(true) }}
                className="text-center text-xs text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors py-1"
              >
                Plus tard
              </button>
            </div>
          )}

          {mode === "upload" && (
            <div className="mt-3">
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
                className={`rounded-xl border-2 border-dashed p-6 text-center cursor-pointer transition-all ${
                  dragOver ? "border-purple-500 bg-purple-500/5" : "border-[var(--border)] hover:border-purple-500/50"
                }`}
              >
                <input
                  ref={inputRef}
                  type="file"
                  accept="image/*,video/mp4,video/quicktime"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <p className="text-sm text-[var(--text-secondary)]">📸 Clique ou glisse une photo ici</p>
                <p className="text-[10px] text-[var(--text-tertiary)] mt-1">JPG, PNG, WebP, MP4 — Max 5 MB</p>
              </div>
              <button
                onClick={reset}
                className="mt-2 text-center text-xs text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors w-full py-1"
              >
                ← Retour
              </button>
            </div>
          )}

          {mode === "preview" && preview && (
            <div className="mt-3 space-y-3">
              {file?.type.startsWith("video/") ? (
                <video src={preview} controls className="w-full rounded-xl max-h-64 object-cover" />
              ) : (
                <img src={preview} alt="Aperçu" className="w-full rounded-xl max-h-64 object-cover" />
              )}
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Ajoute un commentaire (optionnel)..."
                rows={2}
                maxLength={300}
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-2 text-xs text-[var(--text-primary)] placeholder-[var(--text-tertiary)] resize-none outline-none focus:border-purple-500/50"
              />
              {error && (
                <p className="text-[10px] text-[var(--risk-red)]">{error}</p>
              )}
              <div className="flex gap-2">
                <button
                  onClick={handleUpload}
                  disabled={uploading}
                  className="flex-1 rounded-lg bg-purple-600 hover:bg-purple-500 disabled:bg-purple-600/50 py-2.5 text-xs font-medium text-white transition-all active:scale-[0.98]"
                >
                  {uploading ? "Envoi en cours..." : "✅ Envoyer"}
                </button>
                <button
                  onClick={reset}
                  disabled={uploading}
                  className="rounded-lg border border-[var(--border)] py-2.5 px-3 text-xs text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors"
                >
                  Annuler
                </button>
              </div>
            </div>
          )}

          {mode === "success" && (
            <div className="mt-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-center animate-scale-in">
              <p className="text-xl mb-1">🎉</p>
              <p className="text-sm font-medium text-emerald-400">Merci {order.buyerName}!</p>
              <p className="text-[10px] text-[var(--text-secondary)] mt-1">
                Ta photo a bien été reçue. Tu recevras ton crédit de 15 TND sous 48h.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
