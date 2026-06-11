interface LastSeenTagProps {
  lastSeenAt: string
  isActive: boolean
}

function timeAgo(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
  if (diff < 60)  return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

export function LastSeenTag({ lastSeenAt, isActive }: LastSeenTagProps) {
  const ago = timeAgo(lastSeenAt)
  const stale = !isActive

  return (
    <span
      className="text-xs"
      style={{ color: stale ? 'var(--color-offline)' : 'var(--color-text-muted)' }}
    >
      {stale ? `offline · ${ago}` : ago}
    </span>
  )
}