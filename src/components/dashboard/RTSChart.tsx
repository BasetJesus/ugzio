"use client"

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, Area, CartesianGrid } from "recharts"
import { useLanguage } from "@/context/LanguageContext"

interface DataPoint {
  day: string
  rate: number
}

interface Props {
  data: DataPoint[]
  trend?: "up" | "down" | "stable"
}

export default function RTSChart({ data, trend }: Props) {
  const { t } = useLanguage()
  const isPositive = trend === "down"

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) => {
    if (!active || !payload) return null
    return (
      <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2 shadow-lg">
        <p className="text-[10px] text-[var(--text-secondary)]">{label}</p>
        <p className="text-sm font-bold text-[var(--text-primary)]">{payload[0].value}%</p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-5">
      {trend && (
        <p className="text-xs font-medium mb-3" style={{ color: isPositive ? "var(--status-success)" : "var(--status-danger)" }}>
          {isPositive ? "↓" : "↑"} RTS Rate {isPositive ? "dropping" : "rising"}
        </p>
      )}
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis
              dataKey="day"
              tick={{ fontSize: 10, fill: "var(--text-muted)" }}
              axisLine={{ stroke: "var(--border)" }}
              tickLine={false}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fontSize: 10, fill: "var(--text-muted)" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v: number) => `${v}%`}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={30} stroke="var(--status-danger)" strokeDasharray="4 4" strokeWidth={1} label={{
              value: "Avg 30%",
              position: "right",
              fill: "var(--status-danger)",
              fontSize: 9,
            }} />
            <ReferenceLine y={15} stroke="var(--status-success)" strokeDasharray="4 4" strokeWidth={1} label={{
              value: "Target 15%",
              position: "right",
              fill: "var(--status-success)",
              fontSize: 9,
            }} />
            <defs>
              <linearGradient id="rtsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#7c3aed" stopOpacity={0.2} />
                <stop offset="100%" stopColor="#7c3aed" stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area type="monotone" dataKey="rate" fill="url(#rtsGradient)" stroke="none" />
            <Line
              type="monotone"
              dataKey="rate"
              stroke="#7c3aed"
              strokeWidth={2}
              dot={{ fill: "#7c3aed", strokeWidth: 0, r: 3 }}
              activeDot={{ r: 5, fill: "#7c3aed" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
