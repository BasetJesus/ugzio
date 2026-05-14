"use client"

import { motion, useInView, useSpring, useTransform } from "framer-motion"
import { useRef, useState, useEffect } from "react"

interface Props {
  from?: number
  to: number
  suffix?: string
  prefix?: string
  label: string
  color?: string
  delay?: number
}

export default function AnimatedCounter({
  from = 0,
  to,
  suffix = "",
  prefix = "",
  label,
  color = "text-purple-400",
  delay = 0,
}: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-50px" })
  const [displayValue, setDisplayValue] = useState(from)

  const spring = useSpring(from, { stiffness: 50, damping: 20 })
  const rounded = useTransform(spring, (v) => Math.round(v))

  useEffect(() => {
    if (isInView) {
      const timer = setTimeout(() => {
        spring.set(to)
      }, delay * 1000)
      return () => clearTimeout(timer)
    }
  }, [isInView, spring, to, delay])

  useEffect(() => {
    const unsubscribe = rounded.on("change", (v) => {
      setDisplayValue(v)
    })
    return unsubscribe
  }, [rounded])

  return (
    <div ref={ref} className="text-center">
      <motion.p
        className={`text-3xl sm:text-4xl font-bold ${color} font-[family-name:var(--font-fraunces)]`}
        initial={{ opacity: 0, y: 10 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ delay: delay + 0.2, duration: 0.5 }}
      >
        {prefix}{displayValue}{suffix}
      </motion.p>
      <p className="text-[10px] text-white/40 font-medium uppercase tracking-[0.08em] mt-1">
        {label}
      </p>
    </div>
  )
}
