import { MapContainer, TileLayer, ZoomControl } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { useFleetStore } from '../../store/useFleetStore'
import { useVehicleDetail } from '../../hooks/useVehicleDetail'
import { VehiclePin } from './VehiclePin'
import { RouteLayer } from './RouteLayer'
import { FlyToVehicle } from './FlyToVehicle'

// Tooltip styling injected once
const TOOLTIP_STYLE = `
  .fleet-tooltip {
    background: #1e2530 !important;
    border: 1px solid #2a3344 !important;
    color: #f0f4f8 !important;
    font-size: 11px !important;
    font-family: 'JetBrains Mono', monospace !important;
    padding: 3px 8px !important;
    border-radius: 5px !important;
    box-shadow: 0 2px 8px rgba(0,0,0,0.4) !important;
  }
  .fleet-tooltip::before { display: none !important; }
  .leaflet-control-zoom a {
    background: #1e2530 !important;
    border-color: #2a3344 !important;
    color: #8b9ab0 !important;
  }
  .leaflet-control-zoom a:hover { background: #252d3a !important; color: #f0f4f8 !important; }
`

export function MapView() {
  const vehicles          = useFleetStore((s) => s.vehicles)
  const selectedVehicleId = useFleetStore((s) => s.selectedVehicleId)
  const selectedTripId    = useFleetStore((s) => s.selectedTripId)
  const selectVehicle     = useFleetStore((s) => s.selectVehicle)

  const selectedVehicle = vehicles.find((v) => v.id === selectedVehicleId) ?? null

  // Determine if selected trip is in-progress so RouteLayer can show correct end marker
  const { trips } = useVehicleDetail(selectedVehicleId)
  const selectedTrip = trips.find((t: { id: string; status: string }) => t.id === selectedTripId)
  const isInProgress = selectedTrip?.status === 'in_progress'
  
  return (
    <>
      <style>{TOOLTIP_STYLE}</style>
      <MapContainer
        center={[28.6, 77.2]}
        zoom={11}
        zoomControl={false}
        style={{ width: '100%', height: '100%', background: '#0f1117' }}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://carto.com">CARTO</a>'
          maxZoom={19}
        />
        <ZoomControl position="bottomright" />

        {/* Fly to selected vehicle */}
        <FlyToVehicle vehicle={selectedVehicle} />

        {/* Vehicle pins */}
        {vehicles.map((vehicle) => (
          <VehiclePin
            key={vehicle.id}
            vehicle={vehicle}
            isSelected={vehicle.id === selectedVehicleId}
            onClick={() => selectVehicle(vehicle.id === selectedVehicleId ? null : vehicle.id)}
          />
        ))}

        {/* Route overlay */}
        {selectedTripId && (
          <RouteLayer
            tripId={selectedTripId}
            isInProgress={isInProgress ?? false}
          />
        )}
      </MapContainer>
    </>
  )
}