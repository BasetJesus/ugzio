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
        <p className="text-[var(--text-secondary)]">Not enough data to show RTS trend.</p>
      </div>
    )
  }

  return (
    <div>
      <h2 className="mb-4 text-sm font-semibold text-[var(--text-primary)]">RTS Rate Over Time</h2>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <XAxis dataKey="day" stroke="var(--text-tertiary)" tick={{ fill: "var(--text-tertiary)", fontSize: 11 }} />
            <YAxis stroke="var(--text-tertiary)" tick={{ fill: "var(--text-tertiary)", fontSize: 11 }} unit="%" />
            <Tooltip
              contentStyle={{
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
                borderRadius: "8px",
                color: "var(--text-primary)",
              }}
            />
            <Line type="monotone" dataKey="rate" stroke="#f97316" strokeWidth={2} dot={{ fill: "#f97316", r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
