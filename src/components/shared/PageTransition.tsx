"use client"

import { motion, AnimatePresence } from "framer-motion"
import { usePathname } from "next/navigation"
import type { ReactNode } from "react"

export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname()

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.15, ease: "easeOut" }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}

export const micro = {
  whileHover: { scale: 1.02 },
  whileTap: { scale: 0.98 },
  transition: { duration: 0.15 },
} as const

export const cardHover = {
  whileHover: { y: -2 },
  transition: { duration: 0.15, ease: "easeOut" },
} as const
