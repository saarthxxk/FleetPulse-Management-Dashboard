interface SkeletonBarProps {
  width?: string
  height?: number
}

function SkeletonBar({ width = '100%', height = 12 }: SkeletonBarProps) {
  return (
    <div
      style={{
        width,
        height,
        borderRadius: 6,
        background: 'var(--color-surface-3)',
        animation: 'skeleton-pulse 1.4s ease-in-out infinite',
      }}
    />
  )
}

export function SkeletonLoader() {
  return (
    <>
      <style>{`
        @keyframes skeleton-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>

      <div className="flex flex-col gap-4 p-4">
        {/* Header skeleton */}
        <div className="flex items-center gap-3 pb-3" style={{ borderBottom: '1px solid var(--color-surface-border)' }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--color-surface-3)', animation: 'skeleton-pulse 1.4s ease-in-out infinite' }} />
          <div className="flex flex-col gap-1.5 flex-1">
            <SkeletonBar width="60%" height={13} />
            <SkeletonBar width="40%" height={10} />
          </div>
        </div>

        {/* Telemetry grid skeleton */}
        <div className="grid grid-cols-2 gap-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-lg p-3" style={{ background: 'var(--color-surface-2)' }}>
              <SkeletonBar width="50%" height={9} />
              <div style={{ marginTop: 6 }}>
                <SkeletonBar width="70%" height={16} />
              </div>
            </div>
          ))}
        </div>

        {/* Trips skeleton */}
        <div className="flex flex-col gap-2">
          <SkeletonBar width="35%" height={10} />
          {[...Array(3)].map((_, i) => (
            <div key={i} className="rounded-lg p-3" style={{ background: 'var(--color-surface-2)' }}>
              <div className="flex justify-between mb-2">
                <SkeletonBar width="45%" height={11} />
                <SkeletonBar width="20%" height={11} />
              </div>
              <SkeletonBar width="60%" height={9} />
            </div>
          ))}
        </div>
      </div>
    </>
  )
}