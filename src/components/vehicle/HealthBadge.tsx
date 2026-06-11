import type { HealthStatus } from '../../types'

interface HealthBadgeProps {
  status: HealthStatus
  size?: 'sm' | 'md'
}

const config: Record<HealthStatus, { label: string; color: string; bg: string }> = {
  ok:       { label: 'Healthy',  color: 'var(--color-ok)',      bg: 'var(--color-ok-bg)' },
  warning:  { label: 'Warning',  color: 'var(--color-warning)', bg: 'var(--color-warning-bg)' },
  critical: { label: 'Critical', color: 'var(--color-critical)', bg: 'var(--color-critical-bg)' },
  offline:  { label: 'Offline',  color: 'var(--color-offline)', bg: 'var(--color-offline-bg)' },
}

export function HealthBadge({ status, size = 'sm' }: HealthBadgeProps) {
  const { label, color, bg } = config[status]

  return (
    <span
      className="inline-flex items-center gap-1 font-medium rounded-full"
      style={{
        color,
        background: bg,
        fontSize: size === 'sm' ? 10 : 12,
        padding: size === 'sm' ? '2px 7px' : '3px 9px',
      }}
    >
      <span
        style={{
          width: size === 'sm' ? 5 : 6,
          height: size === 'sm' ? 5 : 6,
          borderRadius: '50%',
          background: color,
          display: 'inline-block',
          flexShrink: 0,
        }}
      />
      {label}
    </span>
  )
}