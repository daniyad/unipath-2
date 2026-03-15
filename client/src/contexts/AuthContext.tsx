import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { User } from '../types'

interface AuthContextValue {
  user: User | null
  loading: boolean
  login: (email: string) => Promise<void>
  signup: (email: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('unipath_user')
    if (stored) {
      setUser(JSON.parse(stored) as User)
    }
    setLoading(false)
  }, [])

  const login = async (email: string) => {
    // TODO: replace with Supabase Auth
    const u: User = { id: crypto.randomUUID(), email }
    localStorage.setItem('unipath_user', JSON.stringify(u))
    setUser(u)
  }

  const signup = async (email: string) => {
    // TODO: replace with Supabase Auth
    const u: User = { id: crypto.randomUUID(), email }
    localStorage.setItem('unipath_user', JSON.stringify(u))
    setUser(u)
  }

  const logout = () => {
    localStorage.removeItem('unipath_user')
    localStorage.removeItem('unipath_profile')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
