export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export interface Database {
  public: {
    Tables: {
      vehicles: {
        Row: {
          id: string
          registration_number: string
          vehicle_type: 'truck' | 'van' | 'motorcycle'
          current_lat: number
          current_lng: number
          current_speed: number
          fuel_level: number
          battery_level: number
          health_status: 'ok' | 'warning' | 'critical' | 'offline'
          last_seen_at: string
          is_active: boolean
        }
        Insert: Omit<Database['public']['Tables']['vehicles']['Row'], 'id'>
        Update: Partial<Database['public']['Tables']['vehicles']['Row']>
      }
      trips: {
        Row: {
          id: string
          vehicle_id: string
          started_at: string
          ended_at: string | null
          start_lat: number
          start_lng: number
          end_lat: number | null
          end_lng: number | null
          distance_km: number | null
          duration_minutes: number | null
          status: 'in_progress' | 'completed' | 'cancelled'
        }
        Insert: Omit<Database['public']['Tables']['trips']['Row'], 'id'>
        Update: Partial<Database['public']['Tables']['trips']['Row']>
      }
      trip_locations: {
        Row: {
          id: string
          trip_id: string
          lat: number
          lng: number
          speed: number
          recorded_at: string
        }
        Insert: Omit<Database['public']['Tables']['trip_locations']['Row'], 'id'>
        Update: Partial<Database['public']['Tables']['trip_locations']['Row']>
      }
      vehicle_alerts: {
        Row: {
          id: string
          vehicle_id: string
          trip_id: string | null
          type: string
          severity: 'warning' | 'critical'
          message: string
          is_resolved: boolean
          created_at: string
          resolved_at: string | null
        }
        Insert: Omit<Database['public']['Tables']['vehicle_alerts']['Row'], 'id'>
        Update: Partial<Database['public']['Tables']['vehicle_alerts']['Row']>
      }
      profiles: {
        Row: {
          id: string
          full_name: string
          role: 'admin' | 'operator'
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'id'>
        Update: Partial<Database['public']['Tables']['profiles']['Row']>
      }
    }
  }
}