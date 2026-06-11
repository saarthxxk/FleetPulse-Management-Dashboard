import { useState, useEffect } from 'react'
import { useFleetStore } from '../../store/useFleetStore'

type ConnState = 'live' | 'stale' | 'disconnected'

function getState(lastUpdatedAt: Date | null): ConnState {
  if (!lastUpdatedAt) return 'disconnected'
  const elapsed = (Date.now() - lastUpdatedAt.getTime()) / 1000
  if (elapsed < 20)  return 'live'
  if (elapsed < 60)  return 'stale'
  return 'disconnected'
}

const config: Record<ConnState, { label: string; color: string }> = {
  live:         { label: 'Live',         color: 'var(--color-ok)' },
  stale:        { label: 'Stale',        color: 'var(--color-warning)' },
  disconnected: { label: 'Disconnected', color: 'var(--color-critical)' },
}

export function ConnectionIndicator() {
  const lastUpdatedAt = useFleetStore((s) => s.lastUpdatedAt)
  const [state, setState] = useState<ConnState>(getState(lastUpdatedAt))

  useEffect(() => {
    const id = setInterval(() => setState(getState(lastUpdatedAt)), 1000)
    return () => clearInterval(id)
  }, [lastUpdatedAt])

  const { label, color } = config[state]

  return (
    <div className="flex items-center gap-1.5">
      <span
        style={{
          width: 7,
          height: 7,
          borderRadius: '50%',
          background: color,
          flexShrink: 0,
          boxShadow: state === 'live' ? `0 0 6px ${color}` : 'none',
          transition: 'background 0.3s',
        }}
      />
      <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
        {label}
      </span>
    </div>
  )
}