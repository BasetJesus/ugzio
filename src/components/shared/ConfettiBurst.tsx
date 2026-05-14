"use client"

import { useEffect, useMemo, useState } from "react"

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

function rand(seed: number): number {
  return ((seed * 9301 + 49297) % 233280) / 233280
}

function generateParticles(): Particle[] {
  return Array.from({ length: 30 }, (_, i) => {
    const s = i * 7 + 13
    return {
      id: i,
      x: 40 + rand(s) * 20,
      y: 40 + rand(s + 1) * 10,
      color: COLORS[Math.floor(rand(s + 2) * COLORS.length)],
      rotation: rand(s + 3) * 360,
      size: 4 + rand(s + 4) * 6,
      duration: 600 + rand(s + 5) * 600,
      delay: rand(s + 6) * 100,
    }
  })
}

export default function ConfettiBurst({ active, onComplete }: { active: boolean; onComplete?: () => void }) {
  if (!active) return null
  return <ConfettiBurstInner onComplete={onComplete} />
}

function ConfettiBurstInner({ onComplete }: { onComplete?: () => void }) {
  const [particles] = useState(generateParticles)

  useEffect(() => {
    const timer = setTimeout(() => onComplete?.(), 1400)
    return () => clearTimeout(timer)
  }, [onComplete])

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
