import type { Vehicle } from '../../types'

interface TelemetryGridProps {
  vehicle: Vehicle
}

interface TileProps {
  label: string
  value: string
  sub?: string
  color?: string
  barPercent?: number
  barColor?: string
}

function TelemetryTile({ label, value, sub, color, barPercent, barColor }: TileProps) {
  return (
    <div
      className="flex flex-col gap-1 rounded-lg p-3"
      style={{ background: 'var(--color-surface-2)' }}
    >
      <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{label}</span>
      <span className="text-sm font-semibold" style={{ color: color ?? 'var(--color-text-primary)', fontFamily: 'var(--font-mono)' }}>
        {value}
      </span>
      {sub && <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{sub}</span>}
      {barPercent !== undefined && (
        <div style={{ height: 3, background: 'var(--color-surface-3)', borderRadius: 2, marginTop: 2 }}>
          <div
            style={{
              height: '100%',
              width: `${Math.max(0, Math.min(100, barPercent))}%`,
              background: barColor ?? 'var(--color-brand)',
              borderRadius: 2,
              transition: 'width 0.4s ease',
            }}
          />
        </div>
      )}
    </div>
  )
}

function fuelColor(pct: number): string {
  if (pct > 50) return 'var(--color-ok)'
  if (pct > 20) return 'var(--color-warning)'
  return 'var(--color-critical)'
}

function battColor(pct: number): string {
  if (pct > 60) return 'var(--color-ok)'
  if (pct > 30) return 'var(--color-warning)'
  return 'var(--color-critical)'
}

function timeAgo(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
  if (diff < 60)   return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  return `${Math.floor(diff / 3600)}h ago`
}

export function TelemetryGrid({ vehicle }: TelemetryGridProps) {
  const fuel    = Math.round(vehicle.fuel_level)
  const battery = Math.round(vehicle.battery_level)
  const speed   = Math.round(vehicle.current_speed)

  return (
    <div className="grid grid-cols-2 gap-2">
      <TelemetryTile
        label="Speed"
        value={vehicle.is_active ? `${speed} km/h` : '—'}
        sub={vehicle.is_active ? 'current' : 'offline'}
        color={speed > 80 ? 'var(--color-warning)' : undefined}
      />
      <TelemetryTile
        label="Last seen"
        value={timeAgo(vehicle.last_seen_at)}
        sub={vehicle.is_active ? 'active' : 'offline'}
        color={vehicle.is_active ? 'var(--color-ok)' : 'var(--color-offline)'}
      />
      <TelemetryTile
        label="Fuel"
        value={`${fuel}%`}
        barPercent={fuel}
        barColor={fuelColor(fuel)}
        color={fuelColor(fuel)}
      />
      <TelemetryTile
        label="Battery"
        value={`${battery}%`}
        barPercent={battery}
        barColor={battColor(battery)}
        color={battColor(battery)}
      />
    </div>
  )
}