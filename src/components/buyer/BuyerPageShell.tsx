"use client"

import { Children, type ReactNode, isValidElement, useState, useEffect } from "react"
import { motion } from "framer-motion"
import ConfettiBurst from "@/components/shared/ConfettiBurst"

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
  const [showConfetti, setShowConfetti] = useState(false)
  const [showContent, setShowContent] = useState(false)

  useEffect(() => {
    const t1 = setTimeout(() => setShowContent(true), 100)
    const t2 = setTimeout(() => {
      if (phase === "pre_confirmation" || phase === "delivered" || phase === "completed") {
        setShowConfetti(true)
      }
    }, 400)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [phase])

  if (!showContent) {
    return (
      <div className="flex h-dvh items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 rounded-full border-2 border-[var(--accent)] border-t-transparent animate-spin" />
          <p className="text-xs text-[var(--text-tertiary)]">Chargement de votre commande...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <ConfettiBurst active={showConfetti} onComplete={() => setShowConfetti(false)} />
      <motion.div
        className="space-y-4 relative"
        initial="hidden"
        animate="show"
        variants={{
          hidden: {},
          show: { transition: { staggerChildren: 0.06, delayChildren: 0.08 } },
        }}
      >
        <motion.div
          className="absolute top-0 left-0 right-0 h-0.5 rounded-full"
          style={{
            background: "linear-gradient(90deg, #00ff88, #22c55e, #00ff88)",
            backgroundSize: "200% 100%",
          }}
          animate={{ backgroundPosition: ["0% 0%", "100% 0%", "0% 0%"] }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        />

        {Children.map(children, (child) =>
          isValidElement(child) ? (
            <motion.div variants={fadeUp}>{child}</motion.div>
          ) : (
            child
          ),
        )}
      </motion.div>
    </>
  )
}
