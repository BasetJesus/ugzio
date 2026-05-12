"use client"

import { useLanguage } from "../../../app/context/LanguageContext"

const LANGS = [
  { code: "tun" as const, label: "العربية" },
  { code: "fr" as const, label: "Français" },
  { code: "en" as const, label: "English" },
]

export default function LanguageToggle() {
  const { lang, setLang } = useLanguage()

  return (
    <div className="flex items-center gap-0.5 rounded-lg border border-zinc-800/40 bg-zinc-950/90 p-0.5 shadow-lg backdrop-blur">
      {LANGS.map((l) => (
        <button
          key={l.code}
          onClick={() => setLang(l.code)}
          className={`rounded-md px-2 py-0.5 text-[11px] font-medium transition ${
            lang === l.code ? "bg-green-600 text-white" : "text-zinc-500 hover:text-zinc-200"
          }`}
        >
          {l.label}
        </button>
      ))}
    </div>
  )
}
