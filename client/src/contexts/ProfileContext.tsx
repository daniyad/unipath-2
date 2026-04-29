import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { PartialProfile } from '../types'
import { useAuth } from './AuthContext'
import { useApi } from './ApiContext'

interface ProfileContextValue {
  profile: PartialProfile | null
  hasStaleRecommendations: boolean
  setProfile: (p: PartialProfile) => void
  saveProfileToAPI: (p: PartialProfile) => Promise<{ staleFields: string[] }>
  clearProfile: () => void
}

const ProfileContext = createContext<ProfileContextValue | null>(null)

export function ProfileProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const api = useApi()
  const [profile, setProfileState] = useState<PartialProfile | null>(null)
  const [hasStaleRecommendations, setHasStaleRecommendations] = useState(false)

  // Load from localStorage on mount (fast, no flash)
  useEffect(() => {
    const stored = localStorage.getItem('unipath_profile')
    if (stored) {
      setProfileState(JSON.parse(stored) as PartialProfile)
    }
  }, [])

  // When user is authenticated, sync with API (API is source of truth)
  useEffect(() => {
    if (!user) return
    void api
      .getProfile()
      .then((apiProfile) => {
        if (apiProfile) {
          localStorage.setItem('unipath_profile', JSON.stringify(apiProfile))
          setProfileState(apiProfile)
        }
      })
      .catch(() => {
        // Network error — keep localStorage data
      })
  }, [user])

  const setProfile = (p: PartialProfile) => {
    const merged = { ...(profile ?? {}), ...p }
    localStorage.setItem('unipath_profile', JSON.stringify(merged))
    setProfileState(merged)
  }

  const saveProfileToAPI = async (p: PartialProfile): Promise<{ staleFields: string[] }> => {
    const merged = { ...(profile ?? {}), ...p }
    setProfile(p) // optimistic local update
    const result = await api.patchProfile(merged)
    if (result.staleFields.length > 0) {
      setHasStaleRecommendations(true)
    }
    return result
  }

  const clearProfile = () => {
    localStorage.removeItem('unipath_profile')
    setProfileState(null)
    setHasStaleRecommendations(false)
  }

  return (
    <ProfileContext.Provider
      value={{ profile, hasStaleRecommendations, setProfile, saveProfileToAPI, clearProfile }}
    >
      {children}
    </ProfileContext.Provider>
  )
}

export function useProfile() {
  const ctx = useContext(ProfileContext)
  if (!ctx) throw new Error('useProfile must be used inside ProfileProvider')
  return ctx
}
