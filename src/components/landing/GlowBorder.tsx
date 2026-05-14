"use client"

import { type ReactNode } from "react"
import { motion } from "framer-motion"

interface Props {
  children: ReactNode
  className?: string
  colors?: string[]
  duration?: number
}

export default function GlowBorder({
  children,
  className = "",
  colors = ["#7c3aed", "#00ff88", "#7c3aed"],
  duration = 4,
}: Props) {
  return (
    <div className={`relative ${className}`}>
      <motion.div
        className="absolute -inset-[1px] rounded-xl opacity-60"
        style={{
          background: `linear-gradient(135deg, ${colors.join(", ")})`,
        }}
        animate={{
          background: [
            `linear-gradient(135deg, ${colors[0]}, ${colors[1]}, ${colors[2]})`,
            `linear-gradient(135deg, ${colors[1]}, ${colors[2]}, ${colors[0]})`,
            `linear-gradient(135deg, ${colors[2]}, ${colors[0]}, ${colors[1]})`,
            `linear-gradient(135deg, ${colors[0]}, ${colors[1]}, ${colors[2]})`,
          ],
        }}
        transition={{ duration, repeat: Infinity, ease: "linear" }}
      />
      <div className="relative bg-[#0c0c0e] rounded-[calc(0.75rem-1px)] m-[1px]">
        {children}
      </div>
    </div>
  )
}
