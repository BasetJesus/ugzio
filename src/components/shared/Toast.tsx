"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import { copy, type CopyKey } from "@/lib/core/copy"

type ToastType = "success" | "error" | "info"

interface ToastItem {
  id: string
  type: ToastType
  message: string
}

interface ToastContextValue {
  toast: (opts: { type?: ToastType; message: string; duration?: number }) => void
  toastKey: (opts: { type?: ToastType; key: CopyKey; params?: Record<string, string | number>; duration?: number }) => void
}

const ToastCtx = createContext<ToastContextValue>({
  toast: () => {},
  toastKey: () => {},
})

export function useToast() {
  return useContext(ToastCtx)
}

function ToastIcon({ type }: { type: ToastType }) {
  switch (type) {
    case "success": return <span className="text-[var(--success-green)]">✓</span>
    case "error": return <span className="text-[var(--risk-red)]">✕</span>
    case "info": return <span className="text-[var(--accent)]">i</span>
  }
}

function ToastColors(type: ToastType) {
  switch (type) {
    case "success": return "border-[var(--success-green)]/30 bg-[var(--state-protected-bg)]"
    case "error": return "border-[var(--risk-red)]/30 bg-[var(--state-urgent-bg)]"
    case "info": return "border-[var(--accent)]/30 bg-[var(--state-calm-bg)]"
  }
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const addToast = useCallback((opts: { type?: ToastType; message: string; duration?: number }) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
    const item: ToastItem = { id, type: opts.type ?? "info", message: opts.message }
    setToasts((prev) => [...prev, item])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, opts.duration ?? 3000)
  }, [])

  const toast = useCallback((opts: { type?: ToastType; message: string; duration?: number }) => {
    addToast(opts)
  }, [addToast])

  const toastKey = useCallback((opts: { type?: ToastType; key: CopyKey; params?: Record<string, string | number>; duration?: number }) => {
    addToast({
      type: opts.type,
      message: copy(opts.key, opts.params),
      duration: opts.duration,
    })
  }, [addToast])

  return (
    <ToastCtx.Provider value={{ toast, toastKey }}>
      {children}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto animate-slide-in-top rounded-lg border px-4 py-3 text-sm text-[var(--text-primary)] shadow-lg ${ToastColors(t.type)}`}
          >
            <div className="flex items-center gap-2">
              <ToastIcon type={t.type} />
              <span>{t.message}</span>
            </div>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  )
}
