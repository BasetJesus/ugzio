export default function EmptyState({
  icon = "📦",
  title,
  description,
  action,
}: {
  icon?: string
  title: string
  description?: string
  action?: { label: string; href: string }
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <span className="text-4xl">{icon}</span>
      <h3 className="mt-4 text-lg font-semibold text-zinc-300">{title}</h3>
      {description && <p className="mt-1 text-sm text-zinc-500">{description}</p>}
      {action && (
        <a
          href={action.href}
          className="mt-4 rounded-lg bg-green-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-green-500"
        >
          {action.label}
        </a>
      )}
    </div>
  )
}
