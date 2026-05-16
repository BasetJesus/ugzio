"use client"

import Link from "next/link"
import { copy, type CopyKey } from "@/lib/core/copy"

interface EmptyStateAction {
  label?: string
  href?: string
  onClick?: () => void
}

interface EmptyStateProps {
  icon?: string
  title?: string
  description?: string
  action?: EmptyStateAction
  titleKey?: CopyKey
  descKey?: CopyKey
  actionKey?: CopyKey
}

export default function EmptyState({
  icon = "—",
  title,
  description,
  action,
  titleKey,
  descKey,
  actionKey,
}: EmptyStateProps) {
  const resolvedTitle = title ?? (titleKey ? copy(titleKey) : "Aucune donnée")
  const resolvedDesc = description ?? (descKey ? copy(descKey) : undefined)
  const resolvedAction = action ?? (actionKey ? { label: copy(actionKey) } : undefined)

  return (
    <div className="flex flex-col items-center py-16 text-center px-5">
      <div className="h-12 w-12 rounded-full flex items-center justify-center mb-4 bg-[var(--bg-card)]">
        <span className="text-base text-[var(--text-tertiary)]">{icon}</span>
      </div>
      <p className="text-base font-medium text-[var(--text-primary)]">
        {resolvedTitle}
      </p>
      {resolvedDesc && (
        <p className="mt-1 text-sm text-[var(--text-secondary)] max-w-xs">
          {resolvedDesc}
        </p>
      )}
      {resolvedAction && (
        <div className="mt-4">
          {resolvedAction.href ? (
            <Link
              href={resolvedAction.href}
              className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--accent-hover)] transition-colors"
            >
              {resolvedAction.label ?? "Action"}
            </Link>
          ) : (
            <button
              onClick={resolvedAction.onClick}
              className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--accent-hover)] transition-colors"
            >
              {resolvedAction.label ?? "Action"}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
