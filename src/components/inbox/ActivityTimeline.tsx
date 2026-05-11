const EVENT_ICONS: Record<string, string> = {
  "Commande créée": "📦",
  "Vérification envoyée": "📤",
  "Client a confirmé": "✅",
  "Expédiée": "🚚",
  "Livrée": "📬",
}

export default function ActivityTimeline({ events }: { events: { status: string; label: string }[] }) {
  if (events.length === 0) return null

  return (
    <div>
      <p className="mb-2 text-xs font-semibold text-zinc-400">Activity Timeline</p>
      <div className="space-y-2">
        {events.map((event, i) => (
          <div key={event.status} className="flex items-center gap-3">
            <div className="flex flex-col items-center">
              <span className="text-sm">{EVENT_ICONS[event.label] ?? "•"}</span>
              {i < events.length - 1 && <div className="mt-0.5 h-4 w-px bg-zinc-800" />}
            </div>
            <span className="text-sm text-zinc-300">{event.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
