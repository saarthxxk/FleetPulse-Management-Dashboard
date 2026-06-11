import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { TripLocation } from '../types'

export function useRouteLayer(tripId: string | null) {
  const [locations, setLocations] = useState<TripLocation[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchRoute = async () => {
      if (!tripId) {
        setLocations([])
        return
      }

      setLoading(true)
      const { data, error } = await supabase
        .from('trip_locations')
        .select('*')
        .eq('trip_id', tripId)
        .order('recorded_at', { ascending: true })

      if (!error && data) setLocations(data)
      setLoading(false)
    }

    fetchRoute()
  }, [tripId])

  return { locations, loading }
}