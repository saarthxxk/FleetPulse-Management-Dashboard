import { create } from 'zustand'
import type { Vehicle, VehicleAlert, AuthState } from '../types'

interface FleetStore {
  // Auth slice
  auth: AuthState
  setAuth: (auth: AuthState) => void
  clearAuth: () => void

  // Fleet data
  vehicles: Vehicle[]
  setVehicles: (vehicles: Vehicle[]) => void

  alerts: VehicleAlert[]
  setAlerts: (alerts: VehicleAlert[]) => void

  // Selection — always use selectVehicle(), never set these directly
  selectedVehicleId: string | null
  selectedTripId: string | null

  // Atomic action: selecting a vehicle always resets selectedTripId
  selectVehicle: (id: string | null) => void
  selectTrip: (id: string | null) => void

  // Polling health
  lastUpdatedAt: Date | null
  setLastUpdatedAt: (date: Date) => void
}

export const useFleetStore = create<FleetStore>((set) => ({
  auth: { user: null, profile: null },
  setAuth: (auth) => set({ auth }),
  clearAuth: () => set({ auth: { user: null, profile: null } }),

  vehicles: [],
  setVehicles: (vehicles) => set({ vehicles }),

  alerts: [],
  setAlerts: (alerts) => set({ alerts }),

  // Critical: selectedTripId is ALWAYS reset when vehicle changes
  selectedVehicleId: null,
  selectedTripId: null,
  selectVehicle: (id) => set({ selectedVehicleId: id, selectedTripId: null }),
  selectTrip: (id) => set({ selectedTripId: id }),

  lastUpdatedAt: null,
  setLastUpdatedAt: (date) => set({ lastUpdatedAt: date }),
}))