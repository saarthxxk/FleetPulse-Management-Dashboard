import type { VehicleAlert } from '../../types'
import { EmptyState } from '../ui/EmptyState'

interface HealthEventListProps {
  alerts: VehicleAlert[]
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

export function HealthEventList({ alerts }: HealthEventListProps) {
  if (alerts.length === 0) {
    return (
      <EmptyState
        compact
        icon={
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" strokeLinecap="round" />
            <path d="M22 4 12 14.01l-3-3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        }
        title="No health events"
        subtitle="This vehicle has no recorded alerts"
      />
    )
  }

  return (
    <div className="flex flex-col gap-1.5">
      {alerts.map((alert) => {
        const isCritical  = alert.severity === 'critical'
        const isResolved  = alert.is_resolved
        const color       = isResolved
          ? 'var(--color-text-muted)'
          : isCritical ? 'var(--color-critical)' : 'var(--color-warning)'

        return (
          <div
            key={alert.id}
            className="rounded-lg px-3 py-2.5 flex flex-col gap-1"
            style={{
              background: isResolved
                ? 'var(--color-surface-2)'
                : isCritical ? 'var(--color-critical-bg)' : 'var(--color-warning-bg)',
              border: `1px solid ${isResolved ? 'transparent' : isCritical ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.15)'}`,
              opacity: isResolved ? 0.6 : 1,
            }}
          >
            <div className="flex items-center gap-2">
              <span
                style={{ width: 6, height: 6, borderRadius: '50%', background: color, flexShrink: 0 }}
              />
              <span className="text-xs font-medium flex-1" style={{ color }}>
                {alert.message}
              </span>
              {isResolved && (
                <span className="text-xs" style={{ color: 'var(--color-text-muted)', fontSize: 10 }}>
                  resolved
                </span>
              )}
            </div>
            <span className="text-xs" style={{ color: 'var(--color-text-muted)', paddingLeft: 14 }}>
              {formatDate(alert.created_at)}
            </span>
          </div>
        )
      })}
    </div>
  )
}