import { useEffect } from 'react'
import { useMap } from 'react-leaflet'
import type { Vehicle } from '../../types'

interface FlyToVehicleProps {
  vehicle: Vehicle | null
}

export function FlyToVehicle({ vehicle }: FlyToVehicleProps) {
  const map = useMap()

  useEffect(() => {
    if (!vehicle) return
    map.flyTo([vehicle.current_lat, vehicle.current_lng], 14, {
      duration: 0.8,
      easeLinearity: 0.25,
    })
  }, [vehicle, map])

  return null
}