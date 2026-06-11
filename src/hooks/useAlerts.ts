import { useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { useFleetStore } from '../store/useFleetStore'

const POLL_INTERVAL = 15_000

export function useAlerts() {
  const setAlerts = useFleetStore((s) => s.setAlerts)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  async function fetchAlerts() {
    const { data, error } = await supabase
      .from('vehicle_alerts')
      .select('*')
      .eq('is_resolved', false)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[useAlerts] fetch error:', error.message)
      return
    }

    if (data) setAlerts(data)
  }

  useEffect(() => {
    fetchAlerts()
    intervalRef.current = setInterval(fetchAlerts, POLL_INTERVAL)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}