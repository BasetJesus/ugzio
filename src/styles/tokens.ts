export const colors = {
  background: "#0B0D12",
  surface: "#161A23",
  surface2: "#2A303C",
  border: "#2A303C",
  borderLight: "rgba(255,255,255,0.06)",
  yellow: "#FFD700",
  yellowHover: "#E6C200",
  white: "#FFFFFF",
  gray: "#6B7280",
  grayLight: "#9CA3AF",
  riskRed: "#EF4444",
  riskOrange: "#F97316",
  riskGreen: "#22C55E",
  riskYellow: "#EAB308",
  blue: "#3B82F6",
  purple: "#8B5CF6",
} as const

export type ColorKey = keyof typeof colors

export const typography = {
  fontFamily: {
    sans: ["Inter", "sans-serif"],
    mono: ["JetBrains Mono", "monospace"],
  },
} as const

export const spacing = {
  xs: "4px",
  sm: "8px",
  md: "12px",
  lg: "16px",
  xl: "20px",
  "2xl": "24px",
  "3xl": "28px",
  "4xl": "32px",
  "5xl": "36px",
  "6xl": "40px",
} as const

export const borderRadius = {
  sm: "6px",
  md: "8px",
  lg: "12px",
  xl: "16px",
  full: "9999px",
} as const

export const shadows = {
  card: "0 1px 3px rgba(0,0,0,0.4)",
  elevated: "0 4px 20px rgba(0,0,0,0.5)",
} as const

export const tokens = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
} as const

export default tokens
