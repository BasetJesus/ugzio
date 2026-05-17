"use client"

import { createContext, useContext, useEffect, useState, useCallback, useSyncExternalStore } from "react"
import type { ThemeMode } from "./design-tokens"
import { THEME_CLASSES, STORAGE_KEY } from "./design-tokens"

interface ThemeContextValue {
  theme: ThemeMode
  toggleTheme: () => void
  setTheme: (mode: ThemeMode) => void
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "dark",
  toggleTheme: () => {},
  setTheme: () => {},
})

export function useTheme() {
  return useContext(ThemeContext)
}

function useIsClient() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  )
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    if (typeof window === "undefined") return "light"
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === "light" || stored === "dark") return stored
    return "light"
  })
  const mounted = useIsClient()

  const applyTheme = useCallback((mode: ThemeMode) => {
    const root = document.documentElement
    root.classList.remove("theme-dark", "theme-light")
    root.classList.add(THEME_CLASSES[mode])
    localStorage.setItem(STORAGE_KEY, mode)
  }, [])

  useEffect(() => {
    if (mounted) applyTheme(theme)
  }, [theme, mounted, applyTheme])

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => (prev === "dark" ? "light" : "dark"))
  }, [])

  const setTheme = useCallback((mode: ThemeMode) => {
    setThemeState(mode)
  }, [])

  if (!mounted) {
    return <div style={{ display: "contents" }}>{children}</div>
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}
