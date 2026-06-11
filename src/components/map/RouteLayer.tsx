import { useEffect, useRef } from 'react'
import L from 'leaflet'
import { useMap } from 'react-leaflet'
import { useRouteLayer } from '../../hooks/useRouteLayer'

interface RouteLayerProps {
  tripId: string
  isInProgress: boolean
}

// ─── Marker factories ─────────────────────────────────────────────────────────

/** A solid circle marker with white ring — used for start / end */
function terminalMarker(
  latlng: L.LatLngExpression,
  fillColor: string,
  label: string
): L.CircleMarker {
  return L.circleMarker(latlng, {
    radius: 7,
    fillColor,
    color: '#fff',
    weight: 2.5,
    fillOpacity: 1,
    bubblingMouseEvents: false,
  }).bindTooltip(label, { direction: 'top', offset: [0, -10], className: 'leaflet-route-tooltip' })
}

/** A small hollow breadcrumb dot */
function breadcrumbMarker(latlng: L.LatLngExpression): L.CircleMarker {
  return L.circleMarker(latlng, {
    radius: 2.5,
    fillColor: '#10b981',
    color: 'transparent',
    weight: 0,
    fillOpacity: 0.55,
    bubblingMouseEvents: false,
  })
}

// ─── Component ────────────────────────────────────────────────────────────────

export function RouteLayer({ tripId, isInProgress }: RouteLayerProps) {
  const map = useMap()
  const { locations } = useRouteLayer(tripId)
  const layerGroupRef = useRef<L.LayerGroup | null>(null)

  useEffect(() => {
    // Clean up previous layer
    if (layerGroupRef.current) {
      layerGroupRef.current.clearLayers()
      layerGroupRef.current.remove()
      layerGroupRef.current = null
    }

    if (locations.length < 2) return

    const group = L.layerGroup()
    layerGroupRef.current = group

    const latlngs: L.LatLngExpression[] = locations.map((loc) => [loc.lat, loc.lng])

    // ── Shadow polyline (darker, wider — gives depth) ──
    L.polyline(latlngs, {
      color: '#065f46',
      weight: 6,
      opacity: 0.5,
      smoothFactor: 2,
      lineCap: 'round',
      lineJoin: 'round',
    }).addTo(group)

    // ── Main route polyline ──
    L.polyline(latlngs, {
      color: '#10b981',
      weight: 3,
      opacity: 0.9,
      smoothFactor: 2,
      lineCap: 'round',
      lineJoin: 'round',
      dashArray: isInProgress ? undefined : undefined, // solid for both; could use '6 4' for completed
    }).addTo(group)

    // ── Breadcrumb dots: every ~5th point, skip first and last ──
    const step = Math.max(1, Math.floor(latlngs.length / 20)) // at most ~20 dots
    for (let i = step; i < latlngs.length - 1; i += step) {
      breadcrumbMarker(latlngs[i]).addTo(group)
    }

    // ── Start marker ──
    terminalMarker(latlngs[0], '#6b7280', 'Start').addTo(group)

    // ── End / current position marker ──
    const endLabel  = isInProgress ? 'Current position' : 'End'
    const endColor  = isInProgress ? '#10b981' : '#6b7280'
    const lastPoint = latlngs[latlngs.length - 1]
    terminalMarker(lastPoint, endColor, endLabel).addTo(group)

    // ── Pulse ring for in-progress current position ──
    if (isInProgress) {
      L.circleMarker(lastPoint, {
        radius: 14,
        fillColor: 'transparent',
        color: '#10b981',
        weight: 1.5,
        opacity: 0.4,
        fillOpacity: 0,
        bubblingMouseEvents: false,
        // Leaflet doesn't support CSS animation natively; the outer ring is static
        // For a real pulse you'd use a custom DivIcon with CSS — kept simple here
      }).addTo(group)
    }

    group.addTo(map)

    // Fit map to route bounds with padding
    const bounds = L.latLngBounds(latlngs)
    map.fitBounds(bounds, { padding: [60, 60], maxZoom: 15, animate: true })

    return () => {
      group.clearLayers()
      group.remove()
    }
  }, [locations, map, isInProgress])

  return null
}
