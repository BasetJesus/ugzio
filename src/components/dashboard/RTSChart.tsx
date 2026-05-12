"use client"

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"

interface DataPoint {
  day: string
  rate: number
}

export default function RTSChart({ data }: { data: DataPoint[] }) {
  if (data.length === 0) {
    return (
      <div className="px-6 py-12 text-center">
        <p className="text-zinc-500">Not enough data to show RTS trend.</p>
      </div>
    )
  }

  return (
    <div>
      <h2 className="mb-4 text-sm font-semibold text-zinc-300">RTS Rate Over Time</h2>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <XAxis dataKey="day" stroke="#52525b" tick={{ fill: "#a1a1aa", fontSize: 11 }} />
            <YAxis stroke="#52525b" tick={{ fill: "#a1a1aa", fontSize: 11 }} unit="%" />
            <Tooltip
              contentStyle={{
                background: "#18181b",
                border: "1px solid #27272a",
                borderRadius: "8px",
                color: "#e4e4e7",
              }}
            />
            <Line type="monotone" dataKey="rate" stroke="#f97316" strokeWidth={2} dot={{ fill: "#f97316", r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
