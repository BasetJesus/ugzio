"use client"

import { type ReactNode } from "react"
import { motion } from "framer-motion"

interface Props {
  children: ReactNode
  badge?: string
  badgeColor?: string
}

export default function FloatingPhone({ children, badge, badgeColor = "bg-purple-600" }: Props) {
  return (
    <motion.div
      className="relative mx-auto w-[280px] sm:w-[300px]"
      animate={{ y: [0, -10, 0] }}
      transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
    >
      {badge && (
        <motion.div
          className={`absolute -top-2 -right-2 z-20 ${badgeColor} text-white text-[9px] font-bold px-2.5 py-1 rounded-full shadow-lg`}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5, type: "spring", stiffness: 300 }}
        >
          {badge}
        </motion.div>
      )}

      <div className="relative rounded-[2.5rem] border-[3px] border-zinc-700 bg-black shadow-2xl overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-5 bg-black rounded-b-xl z-10" />

        <div className="pt-7 pb-3 px-2">
          <div className="rounded-2xl bg-[#0a0a0a] min-h-[480px] overflow-hidden">
            {children}
          </div>
        </div>

        <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-32 h-1 rounded-full bg-zinc-800" />
      </div>

      <motion.div
        className="absolute -inset-4 rounded-[3rem] bg-purple-600/5 blur-2xl -z-10"
        animate={{ opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
    </motion.div>
  )
}
