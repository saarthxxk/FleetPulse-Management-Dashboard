import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { VehicleAlert } from '../types'

interface UseVehicleDetailResult {
  trips: Array<any>
  healthEvents: VehicleAlert[]
  loading: boolean
}

export function useVehicleDetail(vehicleId: string | null): UseVehicleDetailResult {
  const [trips, setTrips] = useState<Array<any>>([])
  const [healthEvents, setHealthEvents] = useState<VehicleAlert[]>([])
  const [loading, setLoading] = useState(!!vehicleId)

  useEffect(() => {
    if (!vehicleId) {
      setTrips([])
      setHealthEvents([])
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)
    setTrips([])
    setHealthEvents([])

    async function fetchDetail() {
      const [tripsResult, alertsResult] = await Promise.all([
        supabase
          .from('trips')
          .select('*')
          .eq('vehicle_id', vehicleId!)
          .order('started_at', { ascending: false })
          .limit(20),
        supabase
          .from('vehicle_alerts')
          .select('*')
          .eq('vehicle_id', vehicleId!)
          .order('created_at', { ascending: false })
          .limit(50),
      ])

      if (cancelled) return

      if (tripsResult.error || alertsResult.error) {
        setLoading(false)
        return
      }

      setTrips(tripsResult.data ?? [])
      setHealthEvents(alertsResult.data ?? [])
      setLoading(false)
    }

    fetchDetail()

    return () => {
      cancelled = true
    }
  }, [vehicleId])

  return { trips, healthEvents, loading }
}