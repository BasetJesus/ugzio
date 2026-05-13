"use client"

import { createContext, useContext, useEffect, useState, useCallback } from "react"
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

function getInitialTheme(): ThemeMode {
  if (typeof window === "undefined") return "dark"
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored === "light" || stored === "dark") return stored
  if (window.matchMedia?.("(prefers-color-scheme: light)").matches) return "light"
  return "dark"
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>("dark")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setThemeState(getInitialTheme())
    setMounted(true)
  }, [])

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
    return <div className="theme-dark" style={{ display: "contents" }}>{children}</div>
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}
