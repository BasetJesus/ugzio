"use client"

import { useRef } from "react"

interface Props {
  value: string
  onChange: (v: string) => void
  placeholder?: string
}

export default function SearchBar({ value, onChange, placeholder = "Search..." }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-500">🔍</span>
      <input
        ref={inputRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-zinc-800 bg-zinc-900/50 py-2.5 pl-9 pr-4 text-sm text-zinc-100 outline-none transition focus:border-purple-500 placeholder:text-zinc-600"
      />
      {value && (
        <button
          onClick={() => onChange("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-500 hover:text-zinc-300"
        >
          ✕
        </button>
      )}
    </div>
  )
}
