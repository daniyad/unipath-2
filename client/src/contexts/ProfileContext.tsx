import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { PartialProfile } from '../types'
import { useAuth } from './AuthContext'
import { useApi } from './ApiContext'

interface ProfileContextValue {
  profile: PartialProfile | null
  profileLoading: boolean
  hasStaleRecommendations: boolean
  setProfile: (p: PartialProfile) => void
  saveProfileToAPI: (p: PartialProfile) => Promise<{ staleFields: string[] }>
  clearProfile: () => void
}

const ProfileContext = createContext<ProfileContextValue | null>(null)

export function ProfileProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const api = useApi()
  const [profile, setProfileState] = useState<PartialProfile | null>(() => {
    const stored = localStorage.getItem('unipath_profile')
    return stored ? (JSON.parse(stored) as PartialProfile) : null
  })
  const [hasStaleRecommendations, setHasStaleRecommendations] = useState(false)
  const [profileLoading, setProfileLoading] = useState(true)

  // When user is authenticated, sync with API (API is source of truth)
  useEffect(() => {
    if (!user) {
      setProfileLoading(false)
      return
    }
    setProfileLoading(true)
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
      .finally(() => {
        setProfileLoading(false)
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      value={{
        profile,
        profileLoading,
        hasStaleRecommendations,
        setProfile,
        saveProfileToAPI,
        clearProfile,
      }}
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
