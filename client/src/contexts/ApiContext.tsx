import { createContext, useContext, useMemo, type ReactNode } from 'react'
import { createApi, type Api } from '../lib/api'
import { useAuth } from './AuthContext'

const ApiContext = createContext<Api | null>(null)

export function ApiProvider({ children }: { children: ReactNode }) {
  const { getToken } = useAuth()
  const api = useMemo(() => createApi(getToken), [getToken])
  return <ApiContext.Provider value={api}>{children}</ApiContext.Provider>
}

export function useApi() {
  const ctx = useContext(ApiContext)
  if (!ctx) throw new Error('useApi must be used inside ApiProvider')
  return ctx
}
