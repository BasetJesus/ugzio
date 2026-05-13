export const THEME_CLASSES = {
  dark: "theme-dark",
  light: "theme-light",
} as const

export type ThemeMode = keyof typeof THEME_CLASSES

export const STORAGE_KEY = "ugzio-theme"

export const SEMANTIC = {
  bg: {
    base: "bg-[var(--bg-base)]",
    surface: "bg-[var(--bg-surface)]",
    card: "bg-[var(--bg-card)]",
    nav: "bg-[var(--nav-bg)]",
  },
  text: {
    primary: "text-[var(--text-primary)]",
    secondary: "text-[var(--text-secondary)]",
    tertiary: "text-[var(--text-tertiary)]",
  },
  border: "border-[var(--border)]",
  borderMuted: "border-[var(--nav-border)]",
  accent: {
    bg: "bg-[var(--accent)]",
    hover: "hover:bg-[var(--accent-hover)]",
    text: "text-[var(--accent)]",
    subtle: "bg-[var(--accent)]/20 text-[var(--accent)]",
  },
  risk: {
    red: "text-[var(--risk-red)]",
    redBg: "bg-[var(--risk-red-bg)]",
    redBorder: "border-[var(--kpi-red-border)]",
    green: "text-[var(--success-green)]",
    greenBg: "bg-[var(--success-green-bg)]",
    amber: "text-[var(--warning-amber)]",
    amberBg: "bg-[var(--warning-amber-bg)]",
  },
  kpi: {
    red: "bg-[var(--kpi-red-bg)] border-[var(--kpi-red-border)]",
    amber: "bg-[var(--warning-amber-bg)] border-[var(--warning-amber-border)]",
    green: "bg-[var(--success-green-bg)] border-[var(--success-green-border)]",
    neutral: "bg-[var(--bg-card)] border-[var(--border)]",
  },
} as const

export function cardBorder(level: string): string {
  if (level === "high") return "border-[var(--kpi-red-border)] bg-[var(--kpi-red-bg)]"
  if (level === "medium") return "border-[var(--warning-amber-border)] bg-[var(--warning-amber-bg)]"
  return "border-[var(--border)] bg-[var(--bg-card)]"
}
