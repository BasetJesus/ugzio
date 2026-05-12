"use client"

interface Props {
  label: string
  options: { value: string; label: string }[]
  value: string
  onChange: (v: string) => void
}

export default function FilterDropdown({ label, options, value, onChange }: Props) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-lg border border-zinc-800/50 bg-zinc-900/30 px-3 py-2 text-sm text-zinc-100 outline-none transition focus:border-green-500"
    >
      <option value="">{label}</option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  )
}
