interface Conv {
  id: string
  buyerName: string
  buyerPhone: string
  order?: {
    trustScore: number
    status: string
  } | null
  messages: { createdAt: Date }[]
  updatedAt: Date
}

export default function ConversationList({
  conversations,
  selectedId,
  onSelect,
}: {
  conversations: Conv[]
  selectedId?: string
  onSelect: (id: string) => void
}) {
  if (conversations.length === 0) {
    return (
      <div className="p-6 text-center text-sm text-zinc-500">
        No conversations yet
      </div>
    )
  }

  return (
    <div className="divide-y divide-zinc-800">
      {conversations.map((conv) => {
        const isSelected = conv.id === selectedId
        const lastMessage = conv.messages[conv.messages.length - 1]
        return (
          <button
            key={conv.id}
            onClick={() => onSelect(conv.id)}
            className={`w-full text-left px-4 py-3 transition hover:bg-zinc-900/50 ${isSelected ? "bg-zinc-900/70 border-l-2 border-purple-600" : ""}`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-zinc-200">{conv.buyerName}</p>
                <p className="truncate text-xs text-zinc-500">{conv.buyerPhone}</p>
                {lastMessage && (
                  <p className="mt-1 truncate text-xs text-zinc-600">
                    {lastMessage.createdAt.toLocaleDateString()}
                  </p>
                )}
              </div>
              <div className="shrink-0 text-right">
                {conv.order && (
                  <>
                    <p className="text-xs font-semibold text-purple-400">{conv.order.trustScore}</p>
                    <p className="text-[10px] text-zinc-600">{conv.order.status}</p>
                  </>
                )}
              </div>
            </div>
          </button>
        )
      })}
    </div>
  )
}
