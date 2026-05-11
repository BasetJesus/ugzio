"use client"

import { useLanguage } from "../../../app/context/LanguageContext"

export default function LanguageToggle() {
  const { lang, setLang } = useLanguage()

  return (
    <div className="flex items-center gap-1 rounded-lg bg-zinc-900/50 p-0.5">
      <button
        onClick={() => setLang("ar")}
        className={`rounded-md px-2.5 py-1 text-xs font-medium transition ${
          lang === "ar" ? "bg-purple-600 text-white" : "text-zinc-400 hover:text-zinc-200"
        }`}
      >
        العربية
      </button>
      <button
        onClick={() => setLang("fr")}
        className={`rounded-md px-2.5 py-1 text-xs font-medium transition ${
          lang === "fr" ? "bg-purple-600 text-white" : "text-zinc-400 hover:text-zinc-200"
        }`}
      >
        Français
      </button>
    </div>
  )
}
