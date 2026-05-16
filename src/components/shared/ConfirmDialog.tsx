"use client"

import { useEffect, useRef } from "react"
import { copy, type CopyKey } from "@/lib/core/copy"

interface ConfirmDialogProps {
  open: boolean
  title?: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: "danger" | "default"
  titleKey?: CopyKey
  descKey?: CopyKey
  confirmKey?: CopyKey
  cancelKey?: CopyKey
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirmer",
  cancelLabel = "Annuler",
  variant = "default",
  titleKey,
  descKey,
  confirmKey,
  cancelKey,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const confirmRef = useRef<HTMLButtonElement>(null)

  const resolvedTitle = title ?? (titleKey ? copy(titleKey) : "Confirmer")
  const resolvedDesc = description ?? (descKey ? copy(descKey) : "")
  const resolvedConfirm = confirmKey ? copy(confirmKey) : confirmLabel
  const resolvedCancel = cancelKey ? copy(cancelKey) : cancelLabel

  useEffect(() => {
    if (open) {
      confirmRef.current?.focus()
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onCancel()
    }
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [open, onCancel])

  if (!open) return null

  const confirmStyles =
    variant === "danger"
      ? "rounded-lg bg-[var(--risk-red)] px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition-colors"
      : "rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--accent-hover)] transition-colors"

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[var(--overlay)]" onClick={onCancel} />
      <div className="relative rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-5 w-full max-w-sm shadow-lg animate-scale-in">
        <h3 className="text-base font-semibold text-[var(--text-primary)]">
          {resolvedTitle}
        </h3>
        {resolvedDesc && (
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            {resolvedDesc}
          </p>
        )}
        <div className="mt-5 flex items-center justify-end gap-2">
          <button
            onClick={onCancel}
            className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--border)]/30 transition-colors"
          >
            {resolvedCancel}
          </button>
          <button
            ref={confirmRef}
            onClick={onConfirm}
            className={confirmStyles}
          >
            {resolvedConfirm}
          </button>
        </div>
      </div>
    </div>
  )
}
