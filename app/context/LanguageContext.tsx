"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { t as translate, type Lang } from "./translations";

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

function load(): Lang {
  if (typeof window === "undefined") return "ar";
  const v = localStorage.getItem("ugzio_lang");
  if (v === "ar" || v === "fr") return v;
  return "ar";
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(load);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    localStorage.setItem("ugzio_lang", l);
    document.documentElement.dir = l === "ar" ? "rtl" : "ltr";
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
