"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { t as translate, type Lang } from "./translations";

interface LangCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
}

const Ctx = createContext<LangCtx>({
  lang: "tun",
  setLang: () => {},
  t: (k: string) => k,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("tun");

  useEffect(() => {
    const v = localStorage.getItem("ugzio_lang");
    if (v === "tun" || v === "fr" || v === "en") {
      setLangState(v);
      document.documentElement.dir = v === "tun" ? "rtl" : "ltr";
    }
  }, []);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    localStorage.setItem("ugzio_lang", l);
    document.documentElement.dir = l === "tun" ? "rtl" : "ltr";
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
