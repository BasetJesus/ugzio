"use client"

import { useEffect, useState } from "react"

interface Particle {
  id: number
  x: number
  y: number
  color: string
  rotation: number
  size: number
  duration: number
  delay: number
}

const COLORS = ["#4ade80", "#22d3ee", "#a78bfa", "#fbbf24", "#f87171", "#34d399", "#60a5fa"]

export default function ConfettiBurst({ active, onComplete }: { active: boolean; onComplete?: () => void }) {
  const [particles, setParticles] = useState<Particle[]>([])

  useEffect(() => {
    if (!active) {
      setParticles([])
      return
    }

    const p: Particle[] = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: 40 + Math.random() * 20,
      y: 40 + Math.random() * 10,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      rotation: Math.random() * 360,
      size: 4 + Math.random() * 6,
      duration: 600 + Math.random() * 600,
      delay: Math.random() * 100,
    }))

    setParticles(p)

    const timer = setTimeout(() => {
      setParticles([])
      onComplete?.()
    }, 1400)

    return () => clearTimeout(timer)
  }, [active, onComplete])

  if (particles.length === 0) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-sm"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            transform: `rotate(${p.rotation}deg)`,
            animation: `confetti-fall ${p.duration}ms ease-out ${p.delay}ms forwards`,
            opacity: 1,
          }}
        />
      ))}
      <style>{`
        @keyframes confetti-fall {
          0% { opacity: 1; transform: translateY(0) rotate(0deg) scale(1); }
          100% { opacity: 0; transform: translateY(200px) rotate(720deg) scale(0.3); }
        }
      `}</style>
    </div>
  )
}
