import type { ReactNode } from 'react'

interface EmptyStateProps {
  icon: ReactNode
  title: string
  subtitle?: string
  compact?: boolean
}

export function EmptyState({ icon, title, subtitle, compact = false }: EmptyStateProps) {
  if (compact) {
    return (
      <div className="flex flex-col items-center justify-center gap-1 py-6 px-4 text-center">
        <span style={{ color: 'var(--color-text-muted)', opacity: 0.6 }}>{icon}</span>
        <p className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>{title}</p>
        {subtitle && (
          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{subtitle}</p>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center gap-2 py-10 px-4 text-center">
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center mb-1"
        style={{ background: 'var(--color-surface-2)', color: 'var(--color-text-muted)' }}
      >
        {icon}
      </div>
      <p className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>{title}</p>
      {subtitle && (
        <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{subtitle}</p>
      )}
    </div>
  )
}