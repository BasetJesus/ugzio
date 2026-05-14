"use client"

import { Children, type ReactNode, isValidElement } from "react"
import { motion } from "framer-motion"

interface Props {
  children: ReactNode
  phase: string
}

const fadeUp = {
  hidden: { opacity: 0, y: 10 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.19, 1, 0.22, 1] as const },
  },
}

export default function BuyerPageShell({ children, phase }: Props) {
  return (
    <motion.div
      className="space-y-4 relative"
      initial="hidden"
      animate="show"
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: 0.06, delayChildren: 0.08 } },
      }}
    >
      {phase === "delivered" || phase === "completed" ? (
        <motion.div
          className="absolute top-0 left-0 right-0 h-0.5 rounded-full"
          style={{
            background: "linear-gradient(90deg, #00ff88, #22c55e, #00ff88)",
            backgroundSize: "200% 100%",
          }}
          animate={{ backgroundPosition: ["0% 0%", "100% 0%", "0% 0%"] }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        />
      ) : null}

      {Children.map(children, (child) =>
        isValidElement(child) ? (
          <motion.div variants={fadeUp}>{child}</motion.div>
        ) : (
          child
        ),
      )}
    </motion.div>
  )
}
