"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { t as translate, type Lang } from "@/context/translations";

interface LangCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
}

const Ctx = createContext<LangCtx>({
  lang: "ar",
  setLang: () => {},
  t: (k: string) => k,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    if (typeof window === "undefined") return "ar"
    const v = localStorage.getItem("ugzio_lang");
    return (v === "ar" || v === "fr" || v === "en") ? v : "ar"
  });

  useEffect(() => {
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    localStorage.setItem("ugzio_lang", l);
    document.cookie = `ugzio_lang=${l};path=/;max-age=31536000;SameSite=Lax`;
    document.documentElement.dir = l === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = l;
  }, []);

  const _t = useCallback((key: string) => translate(key, lang), [lang]);

  return (
    <Ctx.Provider value={{ lang, setLang, t: _t }}>
      {children}
    </Ctx.Provider>
  );
}

export function useLanguage() {
  return useContext(Ctx);
}

export function useT() {
  const { t, lang } = useLanguage()
  return { t, lang }
}
