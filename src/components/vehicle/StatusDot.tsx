interface StatusDotProps {
  isActive: boolean
  healthStatus: string
}

export function StatusDot({ isActive, healthStatus }: StatusDotProps) {
  const isOffline = !isActive || healthStatus === 'offline'

  if (isOffline) {
    return (
      <span
        style={{
          display: 'inline-block',
          width: 7,
          height: 7,
          borderRadius: '50%',
          background: 'var(--color-offline)',
          flexShrink: 0,
        }}
      />
    )
  }

  // Active: green pulse
  return (
    <span style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 10, height: 10, flexShrink: 0 }}>
      <span
        className="animate-ping-slow"
        style={{
          position: 'absolute',
          width: 10,
          height: 10,
          borderRadius: '50%',
          background: 'var(--color-ok)',
          opacity: 0.4,
        }}
      />
      <span
        style={{
          width: 7,
          height: 7,
          borderRadius: '50%',
          background: 'var(--color-ok)',
          position: 'relative',
        }}
      />
    </span>
  )
}