import type { Trip } from '../../types'
import { useFleetStore } from '../../store/useFleetStore'
import { EmptyState } from '../ui/EmptyState'

interface TripListProps {
  trips: Trip[]
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

function duration(startedAt: string, endedAt: string | null): string {
  const end = endedAt ? new Date(endedAt) : new Date()
  const mins = Math.round((end.getTime() - new Date(startedAt).getTime()) / 60000)
  if (mins < 60) return `${mins}m`
  return `${Math.floor(mins / 60)}h ${mins % 60}m`
}

export function TripList({ trips }: TripListProps) {
  const selectedTripId = useFleetStore((s) => s.selectedTripId)
  const selectTrip     = useFleetStore((s) => s.selectTrip)

  if (trips.length === 0) {
    return (
      <EmptyState
        compact
        icon={
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
            <path d="M3 12h18M12 3c0 0-4 4-4 9s4 9 4 9M12 3c0 0 4 4 4 9s-4 9-4 9" strokeLinecap="round" />
          </svg>
        }
        title="No trips yet"
        subtitle="Trips will appear here once the vehicle is active"
      />
    )
  }

  return (
    <div className="flex flex-col gap-1.5">
      {trips.map((trip) => {
        const isSelected    = trip.id === selectedTripId
        const isInProgress  = trip.status === 'in_progress'

        return (
          <button
            key={trip.id}
            onClick={() => selectTrip(isSelected ? null : trip.id)}
            className="w-full text-left rounded-lg px-3 py-2.5 flex flex-col gap-1 transition-colors"
            style={{
              background: isSelected
                ? 'rgba(16,185,129,0.10)'
                : 'var(--color-surface-2)',
              border: `1px solid ${isSelected ? 'var(--color-brand)' : 'transparent'}`,
              cursor: 'pointer',
              outline: 'none',
            }}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-medium" style={{ color: 'var(--color-text-primary)' }}>
                {formatDate(trip.started_at)}
              </span>
              {isInProgress ? (
                <span
                  className="text-xs px-1.5 py-0.5 rounded-full font-medium"
                  style={{ background: 'rgba(16,185,129,0.15)', color: 'var(--color-ok)', fontSize: 10 }}
                >
                  Live
                </span>
              ) : (
                <span className="text-xs" style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
                  {trip.distance_km != null ? `${trip.distance_km.toFixed(1)} km` : '—'}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                {duration(trip.started_at, trip.ended_at)}
              </span>
              {isSelected && (
                <span className="text-xs" style={{ color: 'var(--color-brand)' }}>
                  Route shown ↗
                </span>
              )}
            </div>
          </button>
        )
      })}
    </div>
  )
}