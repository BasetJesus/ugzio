import { useState, useEffect, useRef } from "react"

export function useCountUp(target: number, duration = 1000) {
  const [value, setValue] = useState(target === 0 ? 0 : 0)
  const startRef = useRef<number | null>(null)
  const rafRef = useRef<number>(0)

  useEffect(() => {
    if (target === 0) return

    startRef.current = null

    function step(ts: number) {
      if (startRef.current === null) startRef.current = ts
      const elapsed = ts - startRef.current
      const progress = Math.min(elapsed / duration, 1)
      setValue(Math.round(target * easeOutQuad(progress)))
      if (progress < 1) rafRef.current = requestAnimationFrame(step)
    }

    rafRef.current = requestAnimationFrame(step)
    return () => cancelAnimationFrame(rafRef.current)
  }, [target, duration])

  return value
}

function easeOutQuad(t: number): number {
  return t * (2 - t)
}
