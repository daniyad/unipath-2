import type { PartialProfile, ServerUniversity, ServerShortlist, ServerPlan } from '../types'

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

const request = async <T>(
  getToken: () => Promise<string | null>,
  method: string,
  path: string,
  body?: unknown,
): Promise<T> => {
  const token = await getToken()
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(path, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  if (!res.ok) {
    const payload = (await res.json().catch(() => ({ error: res.statusText }))) as {
      error?: string
    }
    throw new ApiError(res.status, payload.error ?? 'Request failed')
  }

  const json = (await res.json()) as { success: boolean; data: T }
  return json.data
}

export const createApi = (getToken: () => Promise<string | null>) => {
  const r = <T>(method: string, path: string, body?: unknown) =>
    request<T>(getToken, method, path, body)

  return {
    // Profile
    getProfile: () => r<PartialProfile | null>('GET', '/api/profile'),
    patchProfile: (profile: PartialProfile) =>
      r<{ profile: PartialProfile; staleFields: string[] }>('PATCH', '/api/profile', profile),

    // Shortlist
    generateShortlist: (profile: PartialProfile) =>
      r<{ id: string } & { universities: ServerUniversity[] }>('POST', '/api/shortlist', profile),
    getShortlists: () => r<ServerShortlist[]>('GET', '/api/shortlists'),

    // Plans
    generatePlan: (profile: PartialProfile, university: ServerUniversity) =>
      r<{ id: string } & ServerPlan['plan']>('POST', '/api/plan', { profile, university }),
    getPlans: () => r<ServerPlan[]>('GET', '/api/plans'),
    updateTask: (planId: string, taskId: string, done: boolean) =>
      r<ServerPlan>('PATCH', `/api/plans/${planId}/tasks`, { taskId, done }),
  }
}

export type Api = ReturnType<typeof createApi>
