interface KPIProps {
  ordersToday: number
  highRiskCount: number
  rtsPrevented: number
  revenueSaved: number
}

export default function KPISection({ ordersToday, highRiskCount, rtsPrevented, revenueSaved }: KPIProps) {
  const cards: { label: string; value: string; icon: string; alert: boolean }[] = [
    { label: "Orders Today", value: String(ordersToday), icon: "📦", alert: false },
    { label: "High Risk Orders", value: String(highRiskCount), icon: "🔴", alert: true },
    { label: "RTS Prevented", value: `${rtsPrevented}%`, icon: "🛡️", alert: false },
    { label: "Revenue Saved", value: `${revenueSaved} TND`, icon: "💰", alert: false },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div key={card.label}>
          <p className="text-lg">{card.icon}</p>
          <p className="text-xs font-medium text-zinc-500">{card.label}</p>
          <p className={`mt-1 text-2xl font-bold tracking-tight ${card.alert && highRiskCount > 0 ? "text-red-400" : "text-green-400"}`}>
            {card.value}
          </p>
        </div>
      ))}
    </div>
  )
}
