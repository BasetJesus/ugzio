'use client'

import { useId } from "react"

type LogoSize = "sm" | "md" | "lg"
type LogoVariant = "dark" | "light" | "yellow"

interface UGZIOIconProps {
  size?: LogoSize
  variant?: LogoVariant
  className?: string
}

interface UGZIOLogoProps extends UGZIOIconProps {
  showTagline?: boolean
  showWordmark?: boolean
}

const iconPx: Record<LogoSize, number> = { sm: 24, md: 36, lg: 64 }

const variantColors: Record<LogoVariant, { primary: string; gray: string; grayLight: string }> = {
  dark: { primary: "#FFFFFF", gray: "#6B7280", grayLight: "#9CA3AF" },
  light: { primary: "#111827", gray: "#6B7280", grayLight: "#9CA3AF" },
  yellow: { primary: "#FFD700", gray: "rgba(255,215,0,0.55)", grayLight: "rgba(255,215,0,0.35)" },
}

const wordmarkSize: Record<LogoSize, string> = {
  sm: "text-sm",
  md: "text-xl",
  lg: "text-4xl",
}

const taglineSize: Record<LogoSize, string> = {
  sm: "text-[7px]",
  md: "text-[10px]",
  lg: "text-sm",
}

const gapSize: Record<LogoSize, string> = {
  sm: "gap-1.5",
  md: "gap-2.5",
  lg: "gap-4",
}

export function UGZIOIcon({ size = "md", variant = "dark", className = "" }: UGZIOIconProps) {
  const uid = useId()
  const px = iconPx[size]

  return (
    <svg
      width={px}
      height={px}
      viewBox="0 0 100 100"
      fill="none"
      className={className}
    >
      <defs>
        <linearGradient id={`uz-arc-${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FFD700" />
          <stop
            offset="100%"
            stopColor="#FFD700"
            className="group-hover:[stop-color:#FFA500]"
          />
        </linearGradient>
        <marker
          id={`uz-arrow-${uid}`}
          viewBox="0 0 14 10"
          refX="12"
          refY="5"
          markerWidth="9"
          markerHeight="7"
          orient="auto"
        >
          <path d="M 0 0 L 13 5 L 0 10 Z" fill={`url(#uz-arc-${uid})`} />
        </marker>
      </defs>

      {/* Circular arc from bottom-left → up → right with arrowhead */}
      <path
        d="M 27 73 A 32 32 0 1 1 75 29"
        stroke={`url(#uz-arc-${uid})`}
        strokeWidth="9"
        strokeLinecap="round"
        markerEnd={`url(#uz-arrow-${uid})`}
      />

      {/* Bold italic Z at center */}
      <text
        x="50"
        y="56"
        textAnchor="middle"
        fontFamily="Inter, sans-serif"
        fontWeight="800"
        fontSize="40"
        fontStyle="italic"
        transform="rotate(6, 50, 50)"
        fill="#FFFFFF"
      >
        Z
      </text>
    </svg>
  )
}

export default function UGZIOLogo({
  size = "md",
  variant = "dark",
  showTagline = false,
  showWordmark = true,
  className = "",
}: UGZIOLogoProps) {
  const c = variantColors[variant]

  return (
    <div className={`group flex items-center ${gapSize[size]} ${className}`}>
      <UGZIOIcon size={size} variant={variant} />

      {showWordmark && (
        <div className="flex flex-col">
          <span
            className={`font-sans font-bold tracking-[-0.02em] leading-none ${wordmarkSize[size]}`}
            style={{ color: c.primary }}
          >
            UG
            <span style={{ color: "#FFD700", fontSize: "1.15em" }}>Z</span>
            <span style={{ fontSize: "0.85em" }}>i</span>
            O
          </span>

          {showTagline && (
            <span
              className={`font-sans font-medium tracking-[0.15em] mt-0.5 ${taglineSize[size]}`}
            >
              <span style={{ color: c.gray }}>GROW. </span>
              <span style={{ color: "#FFD700" }}>PROTECT. </span>
              <span style={{ color: c.gray }}>SCALE.</span>
            </span>
          )}
        </div>
      )}
    </div>
  )
}
