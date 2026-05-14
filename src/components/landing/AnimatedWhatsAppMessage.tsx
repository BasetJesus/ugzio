"use client"

import { motion } from "framer-motion"

interface Props {
  text: string
  time?: string
  align?: "left" | "right"
  color?: string
  icon?: string
  delay?: number
  typing?: boolean
}

export default function AnimatedWhatsAppMessage({
  text,
  time = "12:30",
  align = "left",
  color = "bg-zinc-800",
  icon,
  delay = 0,
  typing = false,
}: Props) {
  return (
    <motion.div
      className={`flex ${align === "right" ? "justify-end" : "justify-start"} px-3`}
      initial={{ opacity: 0, y: 12, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.4, ease: [0.19, 1, 0.22, 1] }}
    >
      <div
        className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 ${
          align === "right"
            ? "bg-purple-600/80 rounded-br-md"
            : `${color} rounded-bl-md`
        }`}
      >
        <div className="flex items-start gap-2">
          {icon && <span className="text-sm mt-0.5">{icon}</span>}
          <div>
            {typing ? (
              <div className="flex items-center gap-1 py-1">
                <motion.span
                  className="w-1.5 h-1.5 rounded-full bg-zinc-400"
                  animate={{ y: [0, -3, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                />
                <motion.span
                  className="w-1.5 h-1.5 rounded-full bg-zinc-400"
                  animate={{ y: [0, -3, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: 0.15 }}
                />
                <motion.span
                  className="w-1.5 h-1.5 rounded-full bg-zinc-400"
                  animate={{ y: [0, -3, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: 0.3 }}
                />
              </div>
            ) : (
              <p className="text-xs sm:text-sm text-white leading-relaxed">{text}</p>
            )}
            <p className={`text-[9px] mt-1 ${align === "right" ? "text-white/40" : "text-zinc-500"}`}>{time}</p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
