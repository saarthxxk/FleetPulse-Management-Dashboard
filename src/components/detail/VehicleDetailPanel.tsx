import { useState } from 'react'
import { useFleetStore } from '../../store/useFleetStore'
import { useVehicleDetail } from '../../hooks/useVehicleDetail'
import { SkeletonLoader } from '../ui/SkeletonLoader'
import { EmptyState } from '../ui/EmptyState'
import type { Trip, VehicleAlert, Vehicle } from '../../types'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function relativeTime(iso: string | null): string {
  if (!iso) return '—'
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (diff < 60) return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

function formatDate(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('en-IN', {
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
  })
}

// ─── Stat row ────────────────────────────────────────────────────────────────

function StatRow({ label, value, accent }: { label: string; value: React.ReactNode; accent?: string }) {
  return (
    <div className="flex items-center justify-between py-2" style={{ borderBottom: '1px solid var(--color-surface-border)' }}>
      <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{label}</span>
      <span className="text-xs font-semibold" style={{ color: accent ?? 'var(--color-text-primary)', fontFamily: 'var(--font-mono)' }}>
        {value}
      </span>
    </div>
  )
}

// ─── Gauge bar ───────────────────────────────────────────────────────────────

function GaugeBar({ label, value, accent }: { label: string; value: number; accent: string }) {
  return (
    <div
      className="flex flex-col gap-1.5 p-3 rounded-md"
      style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-surface-border)' }}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
          {label}
        </span>
        <span
          className="text-sm font-bold"
          style={{ color: accent, fontFamily: 'var(--font-mono)' }}
        >
          {value}%
        </span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--color-surface-3)' }}>
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${value}%`, background: accent }}
        />
      </div>
    </div>
  )
}

// ─── Overview tab ────────────────────────────────────────────────────────────

function OverviewTab({ vehicle }: { vehicle: Vehicle }) {
  const fuelColor =
    (vehicle.fuel_level ?? 100) < 20
      ? 'var(--color-critical)'
      : (vehicle.fuel_level ?? 100) < 40
      ? 'var(--color-warning)'
      : 'var(--color-ok)'

  const battColor =
    (vehicle.battery_level ?? 100) < 20
      ? 'var(--color-critical)'
      : (vehicle.battery_level ?? 100) < 40
      ? 'var(--color-warning)'
      : 'var(--color-ok)'

  return (
    <div className="flex flex-col gap-3 p-3">
      {/* Speed + last seen */}
      <div
        className="grid gap-2"
        style={{ gridTemplateColumns: '1fr 1fr' }}
      >
        <div
          className="flex flex-col gap-1 p-3 rounded-md"
          style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-surface-border)' }}
        >
          <span className="text-xs uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>Speed</span>
          <span className="text-xl font-bold" style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-mono)' }}>
            {vehicle.current_speed ?? 0}
          </span>
          <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>km/h</span>
        </div>
        <div
          className="flex flex-col gap-1 p-3 rounded-md"
          style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-surface-border)' }}
        >
          <span className="text-xs uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>Last seen</span>
          <span className="text-sm font-bold" style={{ color: 'var(--color-ok)', fontFamily: 'var(--font-mono)' }}>
            {relativeTime(vehicle.last_seen_at)}
          </span>
          <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
            {vehicle.is_active ? 'active' : 'inactive'}
          </span>
        </div>
      </div>

      {/* Fuel + Battery gauges */}
      <GaugeBar label="Fuel" value={vehicle.fuel_level ?? 0} accent={fuelColor} />
      <GaugeBar label="Battery" value={vehicle.battery_level ?? 0} accent={battColor} />

      {/* Vehicle section */}
      <div className="mt-1">
        <span
          className="text-xs uppercase tracking-widest block mb-2"
          style={{ color: 'var(--color-text-muted)' }}
        >
          Vehicle
        </span>
        <StatRow label="Position" value={`${vehicle.current_lat?.toFixed(5) ?? '—'}, ${vehicle.current_lng?.toFixed(5) ?? '—'}`} />
        <StatRow label="Type" value={vehicle.vehicle_type} />
        <StatRow label="Status" value={vehicle.is_active ? 'Active' : 'Inactive'} accent={vehicle.is_active ? 'var(--color-ok)' : 'var(--color-offline)'} />
      </div>
    </div>
  )
}

// ─── Trips tab ───────────────────────────────────────────────────────────────

function TripsTab({ trips, selectedTripId, onTripClick }: {
  trips: Trip[]
  selectedTripId: string | null
  onTripClick: (id: string) => void
}) {
  if (trips.length === 0) {
    return (
      <div className="p-3">
        <EmptyState
          compact
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
              <path d="M3 12h18M12 3l9 9-9 9" strokeLinecap="round" />
            </svg>
          }
          title="No trips"
          subtitle="No trip history for this vehicle"
        />
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      {trips.map((trip) => {
        const isLive     = trip.status === 'in_progress' || trip.ended_at === null
        const isSelected = trip.id === selectedTripId

        return (
          <button
            key={trip.id}
            onClick={() => onTripClick(trip.id)}
            className="w-full text-left px-3 py-3"
            style={{
              borderBottom: '1px solid var(--color-surface-border)',
              background: isSelected ? 'var(--color-surface-3)' : 'transparent',
              borderLeft: isSelected ? '3px solid var(--color-brand)' : '3px solid transparent',
              cursor: 'pointer',
              transition: 'background 0.15s',
            }}
          >
            {/* Date + live badge */}
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="text-xs font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                {formatDate(trip.started_at)}
              </span>
              {isLive ? (
                <span
                  className="text-xs font-bold px-1.5 py-0.5 rounded"
                  style={{ background: 'var(--color-ok-bg)', color: 'var(--color-ok)', border: '1px solid var(--color-ok)', fontFamily: 'var(--font-mono)' }}
                >
                  Live
                </span>
              ) : (
                <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  {trip.duration_minutes ? `${trip.duration_minutes}m` : '—'}
                </span>
              )}
            </div>

            {/* Distance + route shown indicator */}
            <div className="flex items-center gap-2">
              {trip.distance_km && (
                <span className="text-xs" style={{ color: 'var(--color-text-secondary)', fontFamily: 'var(--font-mono)' }}>
                  {trip.distance_km.toFixed(1)} km
                </span>
              )}
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

// ─── Alerts tab ──────────────────────────────────────────────────────────────

function AlertsTab({ alerts }: { alerts: VehicleAlert[] }) {
  if (alerts.length === 0) {
    return (
      <div className="p-3">
        <EmptyState
          compact
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          }
          title="No alerts"
          subtitle="This vehicle has no open alerts"
        />
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      {alerts.map((alert) => {
        const isCrit = alert.severity === 'critical'
        const isWarn = alert.severity === 'warning'
        const color  = isCrit ? 'var(--color-critical)' : isWarn ? 'var(--color-warning)' : 'var(--color-info)'
        const bg     = isCrit ? 'var(--color-critical-bg)' : isWarn ? 'var(--color-warning-bg)' : 'var(--color-info-bg)'

        return (
          <div
            key={alert.id}
            className="px-3 py-2.5"
            style={{
              borderBottom: '1px solid var(--color-surface-border)',
              borderLeft: `3px solid ${color}`,
              background: bg,
              marginBottom: 1,
            }}
          >
            <div className="flex items-center justify-between gap-2 mb-1">
              <span
                className="text-xs font-bold"
                style={{ color, fontFamily: 'var(--font-mono)' }}
              >
                {alert.severity.toUpperCase()}
              </span>
              <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                {relativeTime(alert.created_at)}
              </span>
            </div>
            <p className="text-xs leading-snug" style={{ color: 'var(--color-text-secondary)' }}>
              {alert.message}
            </p>
            {alert.is_resolved && (
              <span
                className="text-xs mt-1 inline-block"
                style={{ color: 'var(--color-ok)' }}
              >
                ✓ Resolved
              </span>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

type Tab = 'overview' | 'trips' | 'alerts'

export function VehicleDetailPanel() {
  const vehicles          = useFleetStore((s) => s.vehicles)
  const selectedVehicleId = useFleetStore((s) => s.selectedVehicleId)
  const selectedTripId    = useFleetStore((s) => s.selectedTripId)
  const selectVehicle     = useFleetStore((s) => s.selectVehicle)
  const selectTrip = useFleetStore((s) => s.selectTrip ?? ((_id: string | null) => {}))
  const allAlerts         = useFleetStore((s) => s.alerts)

  const [activeTab, setActiveTab] = useState<Tab>('overview')

  const vehicle = vehicles.find((v) => v.id === selectedVehicleId)
  const { trips, healthEvents, loading } = useVehicleDetail(selectedVehicleId)

  // Alerts for this vehicle from the store (real-time)
  const vehicleAlerts = allAlerts.filter((a) => a.vehicle_id === selectedVehicleId)
  // Combine store alerts with detail-fetched health events, deduplicating by id
  const allVehicleAlerts = [
    ...vehicleAlerts,
    ...healthEvents.filter((he) => !vehicleAlerts.find((a) => a.id === he.id)),
  ]

  if (!selectedVehicleId || !vehicle) return null

  const healthColor = (status: string) => {
    if (status === 'critical') return 'var(--color-critical)'
    if (status === 'warning')  return 'var(--color-warning)'
    if (status === 'offline')  return 'var(--color-offline)'
    return 'var(--color-ok)'
  }

  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'trips',    label: 'Trips',  count: trips.length },
    { id: 'alerts',   label: 'Alerts', count: allVehicleAlerts.length },
  ]

  function handleTripClick(tripId: string) {
    selectTrip(tripId === selectedTripId ? null : tripId)
  }

  return (
    <div
      className="flex flex-col"
      style={{
        position: 'absolute',
        top: 0,
        right: 0,
        width: 300,
        height: '100%',
        background: 'var(--color-surface-1)',
        borderLeft: '1px solid var(--color-surface-border)',
        zIndex: 20,
        overflow: 'hidden',
      }}
    >
      {/* ── Header ── */}
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{ borderBottom: '1px solid var(--color-surface-border)' }}
      >
        <div className="flex flex-col gap-0.5 min-w-0">
          <div className="flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ background: healthColor(vehicle.health_status) }}
            />
            <span
              className="text-sm font-bold truncate"
              style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-mono)' }}
            >
              {vehicle.registration_number}
            </span>
            {vehicle.health_status !== 'ok' && (
              <span
                className="shrink-0 text-xs font-bold px-1.5 py-0.5 rounded"
                style={{
                  color: healthColor(vehicle.health_status),
                  background: `color-mix(in srgb, ${healthColor(vehicle.health_status)} 15%, transparent)`,
                  border: `1px solid color-mix(in srgb, ${healthColor(vehicle.health_status)} 35%, transparent)`,
                  fontFamily: 'var(--font-mono)',
                  fontSize: 10,
                }}
              >
                {vehicle.health_status.toUpperCase()}
              </span>
            )}
          </div>
          <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
            {vehicle.vehicle_type.toUpperCase()}
          </span>
        </div>

        <button
          onClick={() => selectVehicle(null)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', padding: 4 }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75">
            <path d="M3 3l10 10M13 3L3 13" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* ── Tabs ── */}
      <div
        className="flex"
        style={{ borderBottom: '1px solid var(--color-surface-border)' }}
      >
        {tabs.map((tab) => {
          const active = tab.id === activeTab
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex-1 py-2.5 text-xs font-semibold relative"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: active ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
                borderBottom: active ? '2px solid var(--color-brand)' : '2px solid transparent',
                transition: 'color 0.15s, border-color 0.15s',
              }}
            >
              {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span
                  className="ml-1 text-xs"
                  style={{ color: active ? 'var(--color-brand)' : 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}
                >
                  {tab.count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* ── Tab body ── */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {loading ? (
          <div className="p-3">
            <SkeletonLoader />
          </div>
        ) : (
          <>
            {activeTab === 'overview' && <OverviewTab vehicle={vehicle} />}
            {activeTab === 'trips'    && (
              <TripsTab
                trips={trips}
                selectedTripId={selectedTripId}
                onTripClick={handleTripClick}
              />
            )}
            {activeTab === 'alerts'   && <AlertsTab alerts={allVehicleAlerts} />}
          </>
        )}
      </div>
    </div>
  )
}
