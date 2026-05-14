"use client"

import { type CSSProperties, type ReactNode } from "react"
import { trackPageVisit } from "@/lib/analytics"

interface Props {
  href: string
  label: string
  eventName: string
  className?: string
  style?: CSSProperties
  children: ReactNode
}

export default function TrackedCTA({ href, label, eventName, className, style, children }: Props) {
  return (
    <a
      href={href}
      className={className}
      style={style}
      onClick={() => trackPageVisit(eventName, { cta: label, href })}
    >
      {children}
    </a>
  )
}
