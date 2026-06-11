import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://cktgmhcvffoywangwwvy.supabase.co'
const supabaseAnonKey = 'sb_publishable_rsDHNdtP8n7rby-QBHQudQ_yAWUSG1M'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function seedData() {
  console.log('🌱 Seeding FleetPulse test data...\n')

  // Sample vehicles
  const vehicles = [
    {
      id: 'veh-001',
      registration_number: 'MH-01-AB-1234',
      vehicle_type: 'truck',
      current_lat: 19.0760,
      current_lng: 72.8777,
      current_speed: 65,
      fuel_level: 85,
      battery_level: 92,
      health_status: 'ok',
      last_seen_at: new Date().toISOString(),
      is_active: true,
    },
    {
      id: 'veh-002',
      registration_number: 'MH-02-CD-5678',
      vehicle_type: 'van',
      current_lat: 19.1136,
      current_lng: 72.8697,
      current_speed: 45,
      fuel_level: 60,
      battery_level: 78,
      health_status: 'warning',
      last_seen_at: new Date().toISOString(),
      is_active: true,
    },
    {
      id: 'veh-003',
      registration_number: 'DL-03-EF-9012',
      vehicle_type: 'motorcycle',
      current_lat: 28.7041,
      current_lng: 77.1025,
      current_speed: 85,
      fuel_level: 40,
      battery_level: 55,
      health_status: 'critical',
      last_seen_at: new Date().toISOString(),
      is_active: true,
    },
    {
      id: 'veh-004',
      registration_number: 'KA-04-GH-3456',
      vehicle_type: 'truck',
      current_lat: 12.9716,
      current_lng: 77.5946,
      current_speed: 0,
      fuel_level: 15,
      battery_level: 20,
      health_status: 'offline',
      last_seen_at: new Date(Date.now() - 3600000).toISOString(),
      is_active: false,
    },
    {
      id: 'veh-005',
      registration_number: 'TN-05-IJ-7890',
      vehicle_type: 'van',
      current_lat: 13.0827,
      current_lng: 80.2707,
      current_speed: 55,
      fuel_level: 75,
      battery_level: 88,
      health_status: 'ok',
      last_seen_at: new Date().toISOString(),
      is_active: true,
    },
  ]

  // Insert vehicles
  try {
    const { error } = await supabase.from('vehicles').insert(vehicles)
    if (error) throw error
    console.log('✅ Added 5 test vehicles\n')
  } catch (err) {
    console.log('⚠️  Vehicles might already exist:', err)
  }

  // Sample trips
  const trips = [
    {
      id: 'trip-001',
      vehicle_id: 'veh-001',
      started_at: new Date(Date.now() - 86400000).toISOString(),
      ended_at: new Date(Date.now() - 82800000).toISOString(),
      start_lat: 19.0760,
      start_lng: 72.8777,
      end_lat: 19.1136,
      end_lng: 72.8697,
      distance_km: 12.5,
      duration_minutes: 60,
      status: 'completed',
    },
    {
      id: 'trip-002',
      vehicle_id: 'veh-002',
      started_at: new Date().toISOString(),
      ended_at: null,
      start_lat: 19.1136,
      start_lng: 72.8697,
      end_lat: null,
      end_lng: null,
      distance_km: null,
      duration_minutes: null,
      status: 'in_progress',
    },
  ]

  try {
    const { error } = await supabase.from('trips').insert(trips)
    if (error) throw error
    console.log('✅ Added 2 test trips\n')
  } catch (err) {
    console.log('⚠️  Trips might already exist:', err)
  }

  // Sample alerts
  const alerts = [
    {
      id: 'alert-001',
      vehicle_id: 'veh-002',
      trip_id: null,
      type: 'Low Fuel',
      severity: 'warning',
      message: 'Fuel level below 60%',
      is_resolved: false,
      created_at: new Date().toISOString(),
      resolved_at: null,
    },
    {
      id: 'alert-002',
      vehicle_id: 'veh-003',
      trip_id: null,
      type: 'Engine Temperature',
      severity: 'critical',
      message: 'Engine temperature critical',
      is_resolved: false,
      created_at: new Date().toISOString(),
      resolved_at: null,
    },
  ]

  try {
    const { error } = await supabase.from('vehicle_alerts').insert(alerts)
    if (error) throw error
    console.log('✅ Added 2 test alerts\n')
  } catch (err) {
    console.log('⚠️  Alerts might already exist:', err)
  }

  console.log('🎉 Seed data loaded!\n')
  console.log('📍 Vehicles across India:')
  console.log('   • MH-01-AB-1234 (Truck) - Mumbai')
  console.log('   • MH-02-CD-5678 (Van) - Mumbai')
  console.log('   • DL-03-EF-9012 (Motorcycle) - Delhi')
  console.log('   • KA-04-GH-3456 (Truck) - Bangalore')
  console.log('   • TN-05-IJ-7890 (Van) - Chennai\n')
}

seedData().catch(console.error)
