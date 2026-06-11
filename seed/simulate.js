// seed/simulate.js
// Run: node seed/simulate.js

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
config({ path: join(__dirname, '../.env.local') })

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
)

const ROUTES = {
  r1: [
    [28.6315, 77.2167], [28.6252, 77.2295], [28.5930, 77.2272],
    [28.5274, 77.2167], [28.5205, 77.2149], [28.5274, 77.2167],
    [28.5930, 77.2272], [28.6252, 77.2295],
  ],
  r2: [
    [28.5823, 77.0580], [28.6219, 77.0825], [28.6412, 77.1185],
    [28.6514, 77.1894], [28.6412, 77.1185], [28.6219, 77.0825],
  ],
  r3: [
    [28.5709, 77.3219], [28.6279, 77.3719], [28.6596, 77.4038],
    [28.6279, 77.3719], [28.5709, 77.3219],
  ],
  r4: [
    [28.4946, 77.0887], [28.4797, 77.0882], [28.4232, 77.0280],
    [28.3891, 77.0456], [28.4232, 77.0280], [28.4797, 77.0882],
  ],
  r5: [
    [28.4089, 77.3178], [28.5035, 77.3019], [28.5416, 77.2938],
    [28.5518, 77.2749], [28.5416, 77.2938], [28.5035, 77.3019],
  ],
}

const VEHICLE_CONFIGS = [
  { reg: 'DL01CA1234', type: 'truck',      health: 'ok',       routeKey: 'r1', speed: 45, fuel: 78, battery: 92, active: true },
  { reg: 'DL02CB5678', type: 'van',        health: 'ok',       routeKey: 'r2', speed: 52, fuel: 65, battery: 88, active: true },
  { reg: 'DL03CC9012', type: 'motorcycle', health: 'ok',       routeKey: 'r3', speed: 60, fuel: 55, battery: 95, active: true },
  { reg: 'HR26DA3456', type: 'truck',      health: 'ok',       routeKey: 'r4', speed: 38, fuel: 82, battery: 90, active: true },
  { reg: 'UP16DB7890', type: 'van',        health: 'ok',       routeKey: 'r5', speed: 44, fuel: 71, battery: 87, active: true },
  { reg: 'DL04DC2345', type: 'van',        health: 'ok',       routeKey: 'r1', speed: 30, fuel: 90, battery: 93, active: true },
  { reg: 'DL05DD6789', type: 'truck',      health: 'ok',       routeKey: 'r2', speed: 55, fuel: 61, battery: 89, active: true },
  { reg: 'DL06DE0123', type: 'van',        health: 'warning',  routeKey: 'r3', speed: 25, fuel: 18, battery: 85, active: true },
  { reg: 'HR29DF4567', type: 'truck',      health: 'warning',  routeKey: 'r4', speed: 40, fuel: 73, battery: 28, active: true },
  { reg: 'UP78DG8901', type: 'motorcycle', health: 'warning',  routeKey: 'r5', speed: 35, fuel: 45, battery: 72, active: true },
  { reg: 'DL07DH2345', type: 'van',        health: 'critical', routeKey: 'r1', speed: 10, fuel:  8, battery: 15, active: true },
  { reg: 'DL08DI6789', type: 'truck',      health: 'offline',  routeKey: 'r2', speed:  0, fuel: 50, battery: 60, active: false },
]

// ─── Alert thresholds ─────────────────────────────────────────────────────────
// Alerts are only active when the vehicle's telemetry actually breaches these.
// When a vehicle recovers, its open alerts are resolved automatically.
const THRESHOLDS = {
  fuel_critical:    5,   // fuel% → critical
  fuel_warning:    20,   // fuel% → warning
  battery_critical: 15,  // battery% → critical
  battery_warning:  30,  // battery% → warning
}

const vehicleState = {}
const vehicleIds   = {}
let tick = 0

// ─── Seed vehicles ────────────────────────────────────────────────────────────
async function seedVehicles() {
  console.log('[seed] Seeding 12 vehicles…')

  // Clear stale unresolved alerts from previous seeder runs to start clean
  await supabase
    .from('vehicle_alerts')
    .update({ is_resolved: true, resolved_at: new Date().toISOString() })
    .eq('is_resolved', false)
  console.log('[seed] Cleared stale open alerts')

  for (const cfg of VEHICLE_CONFIGS) {
    const route = ROUTES[cfg.routeKey]
    const [lat, lng] = route[0]

    const { data, error } = await supabase
      .from('vehicles')
      .upsert(
        {
          registration_number: cfg.reg,
          vehicle_type: cfg.type,
          current_lat: lat,
          current_lng: lng,
          current_speed: cfg.speed,
          fuel_level: cfg.fuel,
          battery_level: cfg.battery,
          health_status: cfg.health,
          last_seen_at: new Date().toISOString(),
          is_active: cfg.active,
        },
        { onConflict: 'registration_number', ignoreDuplicates: false }
      )
      .select('id')
      .single()

    if (error) {
      console.error(`[seed] Failed to upsert ${cfg.reg}:`, error.message)
      continue
    }

    vehicleIds[cfg.reg] = data.id
    vehicleState[data.id] = { stepIndex: 0, tripId: null, routeKey: cfg.routeKey }
    console.log(`[seed] ✓ ${cfg.reg} → ${data.id}`)
  }

  // Seed one in_progress trip per active vehicle
  for (const cfg of VEHICLE_CONFIGS.filter((c) => c.active)) {
    const vid = vehicleIds[cfg.reg]
    if (!vid) continue

    const route = ROUTES[cfg.routeKey]
    const { data: trip, error } = await supabase
      .from('trips')
      .insert({
        vehicle_id: vid,
        started_at: new Date(Date.now() - Math.random() * 3_600_000).toISOString(),
        ended_at: null,
        start_lat: route[0][0],
        start_lng: route[0][1],
        end_lat: null,
        end_lng: null,
        distance_km: null,
        duration_minutes: null,
        status: 'in_progress',
      })
      .select('id')
      .single()

    if (!error && trip) {
      vehicleState[vid].tripId = trip.id
    }
  }

  console.log('[seed] Vehicles and trips seeded. Starting simulation…')
}

// ─── Alert reconciliation ─────────────────────────────────────────────────────
// For a given vehicle, checks telemetry and ensures alerts are consistent:
// - Creates a new alert if a threshold is breached and no open alert of that type exists
// - Resolves open alerts whose condition has cleared
async function reconcileAlerts(vid, cfg) {
  const now = new Date().toISOString()

  // Determine which alert types should currently be active
  const shouldBeActive = []

  if (cfg.fuel <= THRESHOLDS.fuel_critical) {
    shouldBeActive.push({ type: 'low_fuel', severity: 'critical', message: `[${cfg.reg}] Fuel critically low — less than 5% remaining` })
  } else if (cfg.fuel <= THRESHOLDS.fuel_warning) {
    shouldBeActive.push({ type: 'low_fuel', severity: 'warning', message: `[${cfg.reg}] Fuel level below 20% — refuel required` })
  }

  if (cfg.battery <= THRESHOLDS.battery_critical) {
    shouldBeActive.push({ type: 'low_battery', severity: 'critical', message: `[${cfg.reg}] Battery critically low — vehicle may stall` })
  } else if (cfg.battery <= THRESHOLDS.battery_warning) {
    shouldBeActive.push({ type: 'low_battery', severity: 'warning', message: `[${cfg.reg}] Battery voltage dropping — check alternator` })
  }

  // Fetch all currently open alerts for this vehicle
  const { data: openAlerts } = await supabase
    .from('vehicle_alerts')
    .select('id, type, severity')
    .eq('vehicle_id', vid)
    .eq('is_resolved', false)

  const openByType = Object.fromEntries((openAlerts ?? []).map((a) => [a.type, a]))

  // Resolve alerts whose condition has cleared
  for (const open of openAlerts ?? []) {
    const stillActive = shouldBeActive.some((s) => s.type === open.type)
    if (!stillActive) {
      await supabase
        .from('vehicle_alerts')
        .update({ is_resolved: true, resolved_at: now })
        .eq('id', open.id)
      console.log(`[seed] ✓ Resolved ${open.type} alert for ${cfg.reg}`)
    }
  }

  // Create new alerts for newly breached conditions
  for (const alert of shouldBeActive) {
    if (!openByType[alert.type]) {
      const state = vehicleState[vid]
      await supabase.from('vehicle_alerts').insert({
        vehicle_id: vid,
        trip_id: state?.tripId ?? null,
        type: alert.type,
        severity: alert.severity,
        message: alert.message,
        is_resolved: false,
        created_at: now,
        resolved_at: null,
      })
      console.log(`[seed] ⚠ New alert: ${cfg.reg} — ${alert.message}`)
    }
  }

  // Derive health_status from active conditions
  const hasCritical = shouldBeActive.some((s) => s.severity === 'critical')
  const hasWarning  = shouldBeActive.some((s) => s.severity === 'warning')
  const newHealth   = hasCritical ? 'critical' : hasWarning ? 'warning' : 'ok'

  // Only update if health changed (avoids unnecessary writes)
  if (newHealth !== cfg.health) {
    await supabase.from('vehicles').update({ health_status: newHealth }).eq('id', vid)
    cfg.health = newHealth
    console.log(`[seed] Health ${cfg.reg}: ${newHealth}`)
  }
}

// ─── Tick ─────────────────────────────────────────────────────────────────────
async function simulateTick() {
  tick++

  const updates = []

  for (const cfg of VEHICLE_CONFIGS) {
    const vid = vehicleIds[cfg.reg]
    if (!vid || !cfg.active) continue

    const state = vehicleState[vid]
    const route = ROUTES[cfg.routeKey]

    state.stepIndex = (state.stepIndex + 1) % route.length
    const [lat, lng] = route[state.stepIndex]
    const speed = Math.max(0, cfg.speed + (Math.random() * 10 - 5))

    // Degrade telemetry each tick
    cfg.fuel    = Math.max(0, cfg.fuel    - 0.3)
    cfg.battery = Math.max(0, cfg.battery - 0.05)

    updates.push(
      supabase
        .from('vehicles')
        .update({
          current_lat: lat,
          current_lng: lng,
          current_speed: Math.round(speed),
          fuel_level: parseFloat(cfg.fuel.toFixed(1)),
          battery_level: parseFloat(cfg.battery.toFixed(1)),
          last_seen_at: new Date().toISOString(),
        })
        .eq('id', vid)
    )

    if (state.tripId) {
      updates.push(
        supabase.from('trip_locations').insert({
          trip_id: state.tripId,
          lat,
          lng,
          speed: Math.round(speed),
          recorded_at: new Date().toISOString(),
        })
      )
    }
  }

  await Promise.all(updates)

  // Every tick: reconcile alerts based on actual telemetry
  // Run sequentially (not Promise.all) to avoid hammering Supabase
  for (const cfg of VEHICLE_CONFIGS.filter((c) => c.active && vehicleIds[c.reg])) {
    await reconcileAlerts(vehicleIds[cfg.reg], cfg)
  }

  console.log(`[seed] tick ${tick} — ${new Date().toLocaleTimeString()}`)
}

// ─── Main ─────────────────────────────────────────────────────────────────────
await seedVehicles()
setInterval(simulateTick, 10_000)
