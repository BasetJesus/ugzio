import type { ReactNode } from "react"

interface Props {
  children: ReactNode
  side?: "left" | "right"
  sender?: string
  time?: string
}

export default function WhatsAppBubble({ children, side = "left", sender, time }: Props) {
  const isLeft = side === "left"

  return (
    <div className={`flex flex-col ${isLeft ? "items-start" : "items-end"} max-w-[85%]`}>
      {sender && (
        <span className="text-[10px] text-green-400/60 font-medium mb-1 px-1">{sender}</span>
      )}
      <div
        className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          isLeft
            ? "rounded-bl-sm bg-white/[0.06] text-white/80"
            : "rounded-br-sm text-white"
        }`}
        style={isLeft ? {} : { backgroundColor: "#075e54" }}
      >
        {children}
      </div>
      {time && (
        <span className="text-[9px] text-white/20 mt-0.5 px-1">{time}</span>
      )}
    </div>
  )
}
