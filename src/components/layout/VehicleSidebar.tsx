import { useState } from 'react'
import { useFleetStore } from '../../store/useFleetStore'
import { VehicleCard } from '../vehicle/VehicleCard'
import { EmptyState } from '../ui/EmptyState'
import type { Vehicle } from '../../types'

type FilterTab = 'ALL' | 'ACTIVE' | 'IDLE' | 'OFFLINE'

function matchesFilter(v: Vehicle, tab: FilterTab): boolean {
  if (tab === 'ALL') return true
  if (tab === 'ACTIVE') return v.is_active && v.health_status !== 'offline'
  if (tab === 'OFFLINE') return !v.is_active || v.health_status === 'offline'
  // IDLE: active but speed 0 or very low
  if (tab === 'IDLE') return v.is_active && (v.current_speed ?? 0) < 5 && v.health_status !== 'offline'
  return true
}

export function VehicleSidebar() {
  const vehicles          = useFleetStore((s) => s.vehicles)
  const selectedVehicleId = useFleetStore((s) => s.selectedVehicleId)
  const selectVehicle     = useFleetStore((s) => s.selectVehicle)
  const [query, setQuery] = useState('')
  const [tab, setTab]     = useState<FilterTab>('ALL')

  const filtered = vehicles
    .filter((v) => matchesFilter(v, tab))
    .filter((v) =>
      query.trim()
        ? v.registration_number.toLowerCase().includes(query.toLowerCase())
        : true
    )

  const tabs: FilterTab[] = ['ALL', 'ACTIVE', 'IDLE', 'OFFLINE']

  const tabCount = (t: FilterTab) => vehicles.filter((v) => matchesFilter(v, t)).length

  return (
    <aside
      className="flex flex-col"
      style={{
        width: 240,
        minWidth: 240,
        borderRight: '1px solid var(--color-surface-border)',
        background: 'var(--color-surface-1)',
        overflow: 'hidden',
      }}
    >
      {/* ── Header ── */}
      <div
        className="flex items-center justify-between px-3 py-2.5"
        style={{ borderBottom: '1px solid var(--color-surface-border)' }}
      >
        <span
          className="text-xs font-semibold uppercase tracking-widest"
          style={{ color: 'var(--color-text-muted)' }}
        >
          Fleet
        </span>
        <span
          className="text-xs font-semibold"
          style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}
        >
          {vehicles.length} units
        </span>
      </div>

      {/* ── Search ── */}
      <div className="px-2 pt-2 pb-1.5" style={{ borderBottom: '1px solid var(--color-surface-border)' }}>
        <div className="relative">
          <svg
            width="13"
            height="13"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: 'var(--color-text-muted)' }}
          >
            <circle cx="6.5" cy="6.5" r="4.5" />
            <path d="M10 10l3.5 3.5" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            placeholder="Search name, reg, driver…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-md pl-7 pr-3 py-1.5 text-xs outline-none"
            style={{
              background: 'var(--color-surface-2)',
              border: '1px solid var(--color-surface-border)',
              color: 'var(--color-text-primary)',
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--color-brand)')}
            onBlur={(e)  => (e.currentTarget.style.borderColor = 'var(--color-surface-border)')}
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2"
              style={{ color: 'var(--color-text-muted)', cursor: 'pointer', background: 'none', border: 'none', padding: 0 }}
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.75">
                <path d="M2 2l8 8M10 2l-8 8" strokeLinecap="round" />
              </svg>
            </button>
          )}
        </div>

        {/* Filter tabs */}
        <div className="flex gap-0.5 mt-2">
          {tabs.map((t) => {
            const active = t === tab
            return (
              <button
                key={t}
                onClick={() => setTab(t)}
                className="flex-1 text-xs py-1 rounded"
                style={{
                  background: active ? 'var(--color-surface-3)' : 'transparent',
                  color: active ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
                  border: active ? '1px solid var(--color-surface-border)' : '1px solid transparent',
                  cursor: 'pointer',
                  fontWeight: active ? 600 : 400,
                  fontFamily: 'var(--font-sans)',
                  transition: 'all 0.15s',
                }}
              >
                {t}
                {t !== 'ALL' && (
                  <span style={{ marginLeft: 3, opacity: 0.65, fontFamily: 'var(--font-mono)' }}>
                    {tabCount(t)}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Vehicle list ── */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {filtered.length === 0 ? (
          <EmptyState
            compact
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
              </svg>
            }
            title="No vehicles found"
            subtitle={query ? `No match for "${query}"` : `No ${tab.toLowerCase()} vehicles`}
          />
        ) : (
          filtered.map((vehicle) => (
            <VehicleCard
              key={vehicle.id}
              vehicle={vehicle}
              isSelected={vehicle.id === selectedVehicleId}
              onClick={() =>
                selectVehicle(vehicle.id === selectedVehicleId ? null : vehicle.id)
              }
            />
          ))
        )}
      </div>
    </aside>
  )
}
