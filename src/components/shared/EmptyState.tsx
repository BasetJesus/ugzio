

interface EmptyStateProps {
  icon?: React.ReactNode
  title?: string
  subtitle?: string
  titleKey?: string
  descKey?: string
  action?: React.ReactNode
}

export default function EmptyState({
  icon,
  title = "No orders yet",
  subtitle = "Mazelna ma jatch command. Les nouvelles commandes apparaîtront ici.",
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6">
      <div className="flex h-16 w-16 items-center justify-center rounded-full mb-5 bg-[var(--accent)]/10">
        {icon ?? (
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
        )}
      </div>
      <p className="text-[16px] font-bold text-[var(--text-primary)] mb-1.5 text-center">{title}</p>
      <p className="text-[13px] text-center max-w-xs text-[var(--text-tertiary)]">
        {subtitle}
      </p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
