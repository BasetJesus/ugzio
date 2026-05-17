"use client"

import { useState, useRef, useEffect } from "react"
import { useLanguage } from "@/context/LanguageContext"
import { LANG_FLAGS, type Lang } from "@/lib/translations"

const ORDER: Lang[] = ["ar", "fr", "en"]

export default function LanguageToggle() {
  const { lang, setLang } = useLanguage()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  const current = LANG_FLAGS[lang]

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] text-lg transition hover:border-[var(--accent)] active:scale-95"
        aria-label="Toggle language"
      >
        {current.flag}
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 w-40 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] shadow-lg">
          {ORDER.map((code) => {
            const item = LANG_FLAGS[code]
            return (
              <button
                key={code}
                onClick={() => { setLang(code); setOpen(false) }}
                className={`flex w-full items-center gap-3 px-3 py-2.5 text-sm transition ${
                  lang === code
                    ? "bg-[var(--accent)]/10 text-[var(--accent)]"
                    : "text-[var(--text-secondary)] hover:bg-[var(--bg-surface)] hover:text-[var(--text-primary)]"
                }`}
              >
                <span className="text-lg">{item.flag}</span>
                <span>{item.label}</span>
                {lang === code && <span className="ml-auto text-xs">✓</span>}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
