import { useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { useFleetStore } from '../store/useFleetStore'

const POLL_INTERVAL = 15_000

export function useVehicles() {
  const setVehicles = useFleetStore((s) => s.setVehicles)
  const setLastUpdatedAt = useFleetStore((s) => s.setLastUpdatedAt)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  async function fetchVehicles() {
    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .order('registration_number', { ascending: true })

    if (error) {
      console.error('[useVehicles] fetch error:', error.message)
      return
    }

    if (data) {
      setVehicles(data)
      setLastUpdatedAt(new Date())
    }
  }

  useEffect(() => {
    fetchVehicles()
    intervalRef.current = setInterval(fetchVehicles, POLL_INTERVAL)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}