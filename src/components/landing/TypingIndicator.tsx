export default function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5 px-3 py-2">
      <span className="text-[10px] text-green-400/60 font-medium">UGZIO is typing</span>
      <span className="flex items-center gap-0.5">
        <span className="h-1 w-1 rounded-full bg-green-400/60 animate-bounce" style={{ animationDelay: "0ms" }} />
        <span className="h-1 w-1 rounded-full bg-green-400/60 animate-bounce" style={{ animationDelay: "150ms" }} />
        <span className="h-1 w-1 rounded-full bg-green-400/60 animate-bounce" style={{ animationDelay: "300ms" }} />
      </span>
    </div>
  )
}
