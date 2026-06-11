import type { Database } from './database'

// Row aliases — use these throughout the app
export type Vehicle = Database['public']['Tables']['vehicles']['Row']
export type Trip = Database['public']['Tables']['trips']['Row']
export type TripLocation = Database['public']['Tables']['trip_locations']['Row']
export type VehicleAlert = Database['public']['Tables']['vehicle_alerts']['Row']
export type UserProfile = Database['public']['Tables']['profiles']['Row']

// Enums matching DB check constraints
export type HealthStatus = 'ok' | 'warning' | 'critical' | 'offline'
export type VehicleStatus = 'active' | 'idle' | 'offline'
export type VehicleType = 'truck' | 'van' | 'motorcycle'
export type TripStatus = 'in_progress' | 'completed' | 'cancelled'
export type AlertSeverity = 'warning' | 'critical'

// Auth shape stored in Zustand
export interface AuthState {
  user: { id: string; email: string } | null
  profile: UserProfile | null
}

// Detail panel data shape returned by useVehicleDetail
export interface VehicleDetail {
  trips: Trip[]
  alerts: VehicleAlert[]
}