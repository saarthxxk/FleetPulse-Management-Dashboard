import { useFleetStore } from '../../store/useFleetStore'
import type { Vehicle } from '../../types'

interface VehicleCardProps {
  vehicle: Vehicle
  isSelected: boolean
  onClick: () => void
}

function vehicleTypeIcon(type: string) {
  if (type === 'truck')
    return (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <rect x="1" y="3" width="15" height="13" rx="1" />
        <path d="M16 8h4l3 4v4h-7V8z" />
        <circle cx="5.5" cy="18.5" r="2.5" />
        <circle cx="18.5" cy="18.5" r="2.5" />
      </svg>
    )
  if (type === 'van')
    return (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path d="M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v9h-2" />
        <circle cx="9" cy="17" r="2" />
        <circle cx="18" cy="17" r="2" />
      </svg>
    )
  // motorcycle / default
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <circle cx="5.5" cy="17.5" r="3.5" />
      <circle cx="18.5" cy="17.5" r="3.5" />
      <path d="M15 6h-5l-3 5.5h10L15 6z" />
    </svg>
  )
}

function healthColor(status: string): string {
  if (status === 'critical') return 'var(--color-critical)'
  if (status === 'warning')  return 'var(--color-warning)'
  if (status === 'offline')  return 'var(--color-offline)'
  return 'var(--color-ok)'
}

function HealthBadge({ status }: { status: string }) {
  const color = healthColor(status)
  const label = status.charAt(0).toUpperCase() + status.slice(1)
  return (
    <span
      className="text-xs font-bold px-1.5 py-0.5 rounded"
      style={{
        color,
        background: `color-mix(in srgb, ${color} 15%, transparent)`,
        border: `1px solid color-mix(in srgb, ${color} 35%, transparent)`,
        fontFamily: 'var(--font-mono)',
        fontSize: 10,
      }}
    >
      {label}
    </span>
  )
}

function relativeTime(iso: string | null): string {
  if (!iso) return 'Unknown'
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (diff < 60) return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  return `${Math.floor(diff / 3600)}h ago`
}

export function VehicleCard({ vehicle, isSelected, onClick }: VehicleCardProps) {
  const alerts     = useFleetStore((s) => s.alerts)
  const alertCount = alerts.filter((a) => a.vehicle_id === vehicle.id).length

  const isOffline = !vehicle.is_active || vehicle.health_status === 'offline'
  const statusColor = isOffline
    ? 'var(--color-offline)'
    : vehicle.health_status === 'critical'
    ? 'var(--color-critical)'
    : vehicle.health_status === 'warning'
    ? 'var(--color-warning)'
    : 'var(--color-ok)'

  return (
    <div
      onClick={onClick}
      style={{
        borderBottom: '1px solid var(--color-surface-border)',
        borderLeft: isSelected ? '3px solid var(--color-brand)' : '3px solid transparent',
        background: isSelected ? 'var(--color-surface-2)' : 'transparent',
        paddingLeft: isSelected ? 9 : 11,
        cursor: 'pointer',
        transition: 'background 0.15s, border-color 0.15s',
      }}
      className="px-3 py-2.5"
    >
      {/* ── Row 1: icon + reg + status dot + alert badge ── */}
      <div className="flex items-center gap-2 mb-1">
        {/* Status dot */}
        <span
          className="shrink-0 w-2 h-2 rounded-full"
          style={{
            background: statusColor,
            boxShadow: !isOffline && vehicle.health_status !== 'warning' && vehicle.health_status !== 'critical'
              ? `0 0 0 2px color-mix(in srgb, ${statusColor} 25%, transparent)`
              : undefined,
          }}
        />

        {/* Type icon */}
        <span style={{ color: 'var(--color-text-muted)' }}>
          {vehicleTypeIcon(vehicle.vehicle_type)}
        </span>

        {/* Registration */}
        <span
          className="flex-1 text-xs font-bold truncate"
          style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-mono)' }}
        >
          {vehicle.registration_number}
        </span>

        {/* Alert count badge */}
        {alertCount > 0 && (
          <span
            className="shrink-0 text-xs font-bold w-5 h-5 rounded flex items-center justify-center"
            style={{
              background: vehicle.health_status === 'critical' ? 'var(--color-critical-bg)' : 'var(--color-warning-bg)',
              color: vehicle.health_status === 'critical' ? 'var(--color-critical)' : 'var(--color-warning)',
              border: `1px solid ${vehicle.health_status === 'critical' ? 'var(--color-critical)' : 'var(--color-warning)'}`,
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
            }}
          >
            {alertCount}
          </span>
        )}
      </div>

      {/* ── Row 2: health badge + speed ── */}
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <HealthBadge status={vehicle.health_status} />
        {!isOffline && (
          <span className="text-xs" style={{ color: 'var(--color-text-secondary)', fontFamily: 'var(--font-mono)' }}>
            {vehicle.current_speed ?? 0} km/h
          </span>
        )}
      </div>

      {/* ── Row 3: fuel bar + last seen ── */}
      <div className="flex items-center justify-between gap-3">
        {/* Fuel indicator */}
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--color-text-muted)', flexShrink: 0 }}>
            <path d="M3 22V9a2 2 0 012-2h10a2 2 0 012 2v13" />
            <path d="M3 9V5a2 2 0 012-2h10a2 2 0 012 2v4" />
            <path d="M17 4h2a2 2 0 012 2v3a1 1 0 01-1 1h-3" />
          </svg>
          <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: 'var(--color-surface-3)' }}>
            <div
              className="h-full rounded-full"
              style={{
                width: `${vehicle.fuel_level ?? 0}%`,
                background:
                  (vehicle.fuel_level ?? 100) < 20
                    ? 'var(--color-critical)'
                    : (vehicle.fuel_level ?? 100) < 40
                    ? 'var(--color-warning)'
                    : 'var(--color-ok)',
                transition: 'width 0.3s',
              }}
            />
          </div>
          <span
            className="text-xs shrink-0"
            style={{
              color:
                (vehicle.fuel_level ?? 100) < 20
                  ? 'var(--color-critical)'
                  : (vehicle.fuel_level ?? 100) < 40
                  ? 'var(--color-warning)'
                  : 'var(--color-text-muted)',
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
            }}
          >
            {vehicle.fuel_level ?? '--'}%
          </span>
        </div>

        {/* Last seen */}
        <span
          className="text-xs shrink-0"
          style={{
            color: isOffline ? 'var(--color-offline)' : 'var(--color-text-muted)',
            fontSize: 10,
          }}
        >
          {relativeTime(vehicle.last_seen_at)}
        </span>
      </div>
    </div>
  )
}
