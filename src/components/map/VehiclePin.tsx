import { useEffect, useRef } from 'react'
import L from 'leaflet'
import { useMap } from 'react-leaflet'
import type { Vehicle } from '../../types'

interface VehiclePinProps {
  vehicle: Vehicle
  isSelected: boolean
  onClick: () => void
}

function getPinColor(vehicle: Vehicle): string {
  if (!vehicle.is_active || vehicle.health_status === 'offline') return '#6b7280'
  if (vehicle.health_status === 'critical') return '#ef4444'
  if (vehicle.health_status === 'warning')  return '#f59e0b'
  return '#10b981'
}

function createPinIcon(vehicle: Vehicle, isSelected: boolean): L.DivIcon {
  const color = getPinColor(vehicle)
  const isOffline = !vehicle.is_active || vehicle.health_status === 'offline'
  const isCritical = vehicle.health_status === 'critical' && !isOffline

  const size = isSelected ? 14 : 11
  const ringSize = isSelected ? 24 : 20

  const pulse = isCritical
    ? `<span style="
        position:absolute;inset:-4px;border-radius:50%;
        background:${color};opacity:0.3;
        animation:pin-ping 1.5s ease-in-out infinite;
      "></span>`
    : ''

  const html = `
    <style>
      @keyframes pin-ping {
        0%,100%{transform:scale(1);opacity:0.3}
        50%{transform:scale(1.8);opacity:0}
      }
    </style>
    <div style="
      position:relative;
      width:${ringSize}px;height:${ringSize}px;
      display:flex;align-items:center;justify-content:center;
      opacity:${isOffline ? 0.45 : 1};
    ">
      ${pulse}
      <div style="
        width:${ringSize}px;height:${ringSize}px;border-radius:50%;
        background:${color}22;
        border:1.5px solid ${color}66;
        display:flex;align-items:center;justify-content:center;
        box-shadow:${isSelected ? `0 0 0 2px ${color}` : 'none'};
      ">
        <div style="
          width:${size}px;height:${size}px;border-radius:50%;
          background:${color};
        "></div>
      </div>
    </div>
  `

  return L.divIcon({
    html,
    className: '',
    iconSize:   [ringSize, ringSize],
    iconAnchor: [ringSize / 2, ringSize / 2],
  })
}

export function VehiclePin({ vehicle, isSelected, onClick }: VehiclePinProps) {
  const map     = useMap()
  const markerRef = useRef<L.Marker | null>(null)

  useEffect(() => {
    const icon   = createPinIcon(vehicle, isSelected)
    const marker = L.marker([vehicle.current_lat, vehicle.current_lng], { icon })
      .bindTooltip(vehicle.registration_number, {
        permanent: false,
        direction: 'top',
        offset: [0, -12],
        className: 'fleet-tooltip',
      })
      .on('click', onClick)

    marker.addTo(map)
    markerRef.current = marker

    return () => {
      marker.remove()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vehicle.current_lat, vehicle.current_lng, vehicle.health_status, vehicle.is_active, isSelected])

  return null
}