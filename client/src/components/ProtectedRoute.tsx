import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useProfile } from '../contexts/ProfileContext'
import type { ReactNode } from 'react'

interface Props {
  children: ReactNode
  requireProfile?: boolean
}

export function ProtectedRoute({ children, requireProfile = false }: Props) {
  const { user, loading: authLoading } = useAuth()
  const { profile, profileLoading } = useProfile()

  if (authLoading) return null
  if (!user) return <Navigate to="/login" replace />
  if (requireProfile && profileLoading) return null
  if (requireProfile && !profile?.name) return <Navigate to="/setup" replace />

  return <>{children}</>
}
