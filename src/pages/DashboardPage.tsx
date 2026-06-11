import { useFleetStore } from '../store/useFleetStore'
import { useVehicles } from '../hooks/useVehicles'
import { useAlerts } from '../hooks/useAlerts'
import { useAuth } from '../hooks/useAuth'
import { AlertStrip } from '../components/layout/AlertStrip'
import { VehicleSidebar } from '../components/layout/VehicleSidebar'
import { ConnectionIndicator } from '../components/layout/ConnectionIndicator'
import { MapView } from '../components/map/MapView'
import { VehicleDetailPanel } from '../components/detail/VehicleDetailPanel'

function NavBar() {
  const auth     = useFleetStore((s) => s.auth)
  const vehicles = useFleetStore((s) => s.vehicles)
  const { signOut } = useAuth()

  const initials = auth.profile?.full_name
    ? auth.profile.full_name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
    : auth.user?.email?.slice(0, 2).toUpperCase() ?? 'OP'

  return (
    <nav
      className="flex items-center gap-4 px-4"
      style={{
        height: 48,
        background: 'var(--color-surface-1)',
        borderBottom: '1px solid var(--color-surface-border)',
        flexShrink: 0,
      }}
    >
      {/* Brand */}
      <div className="flex items-center gap-2">
        <span
          className="w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold"
          style={{ background: 'var(--color-brand)', color: '#fff' }}
        >
          F
        </span>
        <span className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
          FleetPulse
        </span>
      </div>

      {/* Vehicle count */}
      <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
        {vehicles.length} vehicles
      </span>

      <div className="flex-1" />

      {/* Connection indicator */}
      <ConnectionIndicator />

      {/* Divider */}
      <span style={{ width: 1, height: 20, background: 'var(--color-surface-border)' }} />

      {/* Avatar */}
      <div className="flex items-center gap-2">
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold"
          style={{ background: 'var(--color-surface-3)', color: 'var(--color-text-primary)' }}
          title={auth.profile?.full_name ?? auth.user?.email ?? ''}
        >
          {initials}
        </div>
        {auth.profile?.role && (
          <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
            {auth.profile.role}
          </span>
        )}
      </div>

      {/* Sign out */}
      <button
        onClick={signOut}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs transition-colors"
        style={{
          color: 'var(--color-text-secondary)',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--color-surface-2)'; e.currentTarget.style.color = 'var(--color-text-primary)' }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--color-text-secondary)' }}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
        Sign out
      </button>
    </nav>
  )
}

export function DashboardPage() {
  // Mount polling hooks — these run for the lifetime of the dashboard
  useVehicles()
  useAlerts()

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        background: 'var(--color-surface)',
        overflow: 'hidden',
      }}
    >
      {/* Top nav */}
      <NavBar />

      {/* Alert strip — always visible, fixed height */}
      <AlertStrip />

      {/* Body — sidebar + map */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative' }}>
        {/* Vehicle sidebar */}
        <VehicleSidebar />

        {/* Map area — fills remaining space, position relative for panel overlay */}
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
          <MapView />
          {/* Detail panel — absolute over map, not pushing layout */}
          <VehicleDetailPanel />
        </div>
      </div>
    </div>
  )
}