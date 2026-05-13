"use client"

import { useLanguage } from "@/context/LanguageContext"

const LANGS = [
  { code: "tun" as const, label: "العربية" },
  { code: "fr" as const, label: "Français" },
  { code: "en" as const, label: "English" },
]

export default function LanguageToggle() {
  const { lang, setLang } = useLanguage()

  return (
    <div className="flex items-center gap-0.5 rounded-lg border border-[var(--nav-border)] bg-[var(--nav-bg)] p-0.5 shadow-[var(--shadow-lg)] backdrop-blur">
      {LANGS.map((l) => (
        <button
          key={l.code}
          onClick={() => setLang(l.code)}
          className={`rounded-md px-2 py-0.5 text-[11px] font-medium transition ${
            lang === l.code ? "bg-[var(--accent)] text-white" : "text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
          }`}
        >
          {l.label}
        </button>
      ))}
    </div>
  )
}
