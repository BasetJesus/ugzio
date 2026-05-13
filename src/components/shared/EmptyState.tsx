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
      <h3 className="mt-4 text-lg font-semibold text-[var(--text-primary)]">{title}</h3>
      {description && <p className="mt-1 text-sm text-[var(--text-secondary)]">{description}</p>}
      {action && (
        <a
          href={action.href}
          className="mt-4 rounded-lg bg-[var(--accent)] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[var(--accent-hover)]"
        >
          {action.label}
        </a>
      )}
    </div>
  )
}
