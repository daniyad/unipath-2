import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { PartialProfile } from '../types'

interface ProfileContextValue {
  profile: PartialProfile | null
  setProfile: (p: PartialProfile) => void
  clearProfile: () => void
}

const ProfileContext = createContext<ProfileContextValue | null>(null)

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfileState] = useState<PartialProfile | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem('unipath_profile')
    if (stored) {
      setProfileState(JSON.parse(stored) as PartialProfile)
    }
  }, [])

  const setProfile = (p: PartialProfile) => {
    const merged = { ...profile, ...p }
    localStorage.setItem('unipath_profile', JSON.stringify(merged))
    setProfileState(merged)
  }

  const clearProfile = () => {
    localStorage.removeItem('unipath_profile')
    setProfileState(null)
  }

  return (
    <ProfileContext.Provider value={{ profile, setProfile, clearProfile }}>
      {children}
    </ProfileContext.Provider>
  )
}

export function useProfile() {
  const ctx = useContext(ProfileContext)
  if (!ctx) throw new Error('useProfile must be used inside ProfileProvider')
  return ctx
}
