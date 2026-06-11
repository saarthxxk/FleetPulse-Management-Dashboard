import type { Trip } from '../../types'
import { useFleetStore } from '../../store/useFleetStore'
import { EmptyState } from '../ui/EmptyState'

interface TripListProps {
  trips: Trip[]
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

function duration(startedAt: string, endedAt: string | null): string {
  const end  = endedAt ? new Date(endedAt) : new Date()
  const mins = Math.round((end.getTime() - new Date(startedAt).getTime()) / 60000)
  if (mins < 1)  return '<1m'
  if (mins < 60) return `${mins}m`
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

function formatCoord(lat: number | null, lng: number | null): string {
  if (lat == null || lng == null) return '—'
  return `${lat.toFixed(4)}, ${lng.toFixed(4)}`
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function IconRoute() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12h18M12 3c0 0-4 4-4 9s4 9 4 9M12 3c0 0 4 4 4 9s-4 9-4 9" />
    </svg>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export function TripList({ trips }: TripListProps) {
  const selectedTripId = useFleetStore((s) => s.selectedTripId)
  const selectTrip     = useFleetStore((s) => s.selectTrip)

  if (trips.length === 0) {
    return (
      <EmptyState
        compact
        icon={<IconRoute />}
        title="No trips yet"
        subtitle="Trips appear once the vehicle is active"
      />
    )
  }

  return (
    <div className="flex flex-col gap-2">
      {trips.map((trip) => {
        const isSelected   = trip.id === selectedTripId
        const isInProgress = trip.status === 'in_progress'

        return (
          <button
            key={trip.id}
            onClick={() => selectTrip(isSelected ? null : trip.id)}
            className="w-full text-left rounded-lg flex flex-col transition-colors"
            style={{
              background: isSelected ? 'rgba(16,185,129,0.08)' : 'var(--color-surface-2)',
              border: `1px solid ${isSelected ? 'var(--color-brand)' : 'transparent'}`,
              cursor: 'pointer',
              outline: 'none',
              overflow: 'hidden',
            }}
          >
            {/* ── Header bar ── */}
            <div
              className="flex items-center justify-between px-3 py-2"
              style={{ borderBottom: `1px solid var(--color-surface-border)` }}
            >
              <div className="flex items-center gap-2">
                {isInProgress ? (
                  <span
                    className="text-xs font-semibold px-1.5 py-0.5 rounded-full"
                    style={{ background: 'rgba(16,185,129,0.15)', color: 'var(--color-ok)', fontSize: 10 }}
                  >
                    LIVE
                  </span>
                ) : (
                  <span
                    className="text-xs font-medium px-1.5 py-0.5 rounded-full"
                    style={{ background: 'var(--color-surface-3)', color: 'var(--color-text-muted)', fontSize: 10 }}
                  >
                    {trip.status === 'cancelled' ? 'CANCELLED' : 'DONE'}
                  </span>
                )}
                <span className="text-xs font-medium" style={{ color: 'var(--color-text-primary)' }}>
                  {formatDateTime(trip.started_at)}
                </span>
              </div>

              {/* Distance */}
              {trip.distance_km != null ? (
                <span className="text-xs font-semibold" style={{ color: 'var(--color-text-secondary)', fontFamily: 'var(--font-mono)' }}>
                  {trip.distance_km.toFixed(1)} km
                </span>
              ) : isInProgress ? (
                <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>in progress</span>
              ) : null}
            </div>

            {/* ── Body: start → end ── */}
            <div className="px-3 py-2.5 flex flex-col gap-2">

              {/* Start row */}
              <div className="flex items-start gap-2">
                <div className="flex flex-col items-center pt-0.5" style={{ minWidth: 14 }}>
                  <span style={{
                    width: 8, height: 8, borderRadius: '50%',
                    background: '#6b7280', border: '2px solid #fff', flexShrink: 0, display: 'block'
                  }} />
                  <span style={{ width: 1, height: 14, background: 'var(--color-surface-border)', display: 'block', margin: '2px auto' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                    Start · {formatTime(trip.started_at)}
                  </div>
                  <div className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)', fontSize: 10 }}>
                    {formatCoord(trip.start_lat, trip.start_lng)}
                  </div>
                </div>
              </div>

              {/* End row */}
              <div className="flex items-start gap-2">
                <div className="flex flex-col items-center" style={{ minWidth: 14 }}>
                  <span style={{
                    width: 8, height: 8, borderRadius: '50%',
                    background: isInProgress ? 'var(--color-ok)' : '#6b7280',
                    border: '2px solid #fff', flexShrink: 0, display: 'block'
                  }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                    {isInProgress ? 'Current position' : `End · ${trip.ended_at ? formatTime(trip.ended_at) : '—'}`}
                  </div>
                  <div className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)', fontSize: 10 }}>
                    {isInProgress
                      ? 'Route updating live'
                      : formatCoord(trip.end_lat, trip.end_lng)}
                  </div>
                </div>
              </div>
            </div>

            {/* ── Footer: duration + route indicator ── */}
            <div
              className="flex items-center justify-between px-3 py-1.5"
              style={{ borderTop: '1px solid var(--color-surface-border)', background: 'rgba(0,0,0,0.15)' }}
            >
              <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                ⏱ {duration(trip.started_at, trip.ended_at)}
              </span>
              {isSelected ? (
                <span className="text-xs font-medium" style={{ color: 'var(--color-brand)' }}>
                  Route shown on map ↗
                </span>
              ) : (
                <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  Click to show route
                </span>
              )}
            </div>
          </button>
        )
      })}
    </div>
  )
}
