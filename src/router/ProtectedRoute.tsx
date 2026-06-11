import { Navigate } from 'react-router-dom'
import { useFleetStore } from '../store/useFleetStore'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const user = useFleetStore((s) => s.auth.user)

  if (!user) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}