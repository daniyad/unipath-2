import { randomBytes } from 'crypto'
import { supabase } from './db.js'

export interface ShareSettings {
  expiresIn: '24h' | '7d' | '30d' | 'never'
  showTuition: boolean
}

const DEFAULT_SETTINGS: ShareSettings = { expiresIn: 'never', showTuition: true }

export interface ShareDetails {
  token: string
  viewCount: number
  settings: ShareSettings
}

export const getOrCreateShareLink = async (userId: string): Promise<string> => {
  const { data: existing } = await supabase
    .from('share_links')
    .select('token')
    .eq('user_id', userId)
    .maybeSingle()

  if (existing?.token) return existing.token as string

  const token = randomBytes(32).toString('hex')
  const { error } = await supabase.from('share_links').insert({ token, user_id: userId })

  if (error) {
    if (error.code === '23505') {
      const { data: retry } = await supabase
        .from('share_links')
        .select('token')
        .eq('user_id', userId)
        .maybeSingle()
      if (retry?.token) return retry.token as string
    }
    throw new Error(`Failed to create share link: ${error.message}`)
  }

  return token
}

export const deleteShareLink = async (userId: string): Promise<void> => {
  const { error } = await supabase.from('share_links').delete().eq('user_id', userId)
  if (error) throw new Error(`Failed to delete share link: ${error.message}`)
}

export const getShareLinkByUserId = async (userId: string): Promise<string | null> => {
  const { data, error } = await supabase
    .from('share_links')
    .select('token')
    .eq('user_id', userId)
    .maybeSingle()
  if (error) throw new Error(`Failed to get share link: ${error.message}`)
  return (data?.token as string | undefined) ?? null
}

export const getShareDetails = async (userId: string): Promise<ShareDetails | null> => {
  const { data, error } = await supabase
    .from('share_links')
    .select('token, view_count, settings')
    .eq('user_id', userId)
    .maybeSingle()
  if (error) throw new Error(`Failed to get share details: ${error.message}`)
  if (!data) return null
  const row = data as { token: string; view_count?: number; settings?: unknown }
  return {
    token: row.token,
    viewCount: row.view_count ?? 0,
    settings: (row.settings as ShareSettings | null) ?? DEFAULT_SETTINGS,
  }
}

export const updateShareSettings = async (
  userId: string,
  settings: ShareSettings,
): Promise<void> => {
  const { error } = await supabase.from('share_links').update({ settings }).eq('user_id', userId)
  if (error) throw new Error(`Failed to update share settings: ${error.message}`)
}

export const incrementViewCount = async (token: string): Promise<void> => {
  // Try the RPC (requires migration 006 to have run); silently ignore if function missing
  try {
    await supabase.rpc('increment_share_view_count', { p_token: token })
  } catch {
    // Silently swallow — view count is non-critical and migration may not be applied yet
  }
}

export const getShareLinkByToken = async (
  token: string,
): Promise<{ userId: string; settings: ShareSettings } | null> => {
  const { data, error } = await supabase
    .from('share_links')
    .select('user_id, settings')
    .eq('token', token)
    .maybeSingle()
  if (error) throw new Error(`Failed to look up share token: ${error.message}`)
  if (!data) return null
  const row = data as { user_id: string; settings?: unknown }
  return {
    userId: row.user_id,
    settings: (row.settings as ShareSettings | null) ?? DEFAULT_SETTINGS,
  }
}

export const getSummary = async (
  userId: string,
): Promise<{ summary: string; generated_at: string } | null> => {
  const { data, error } = await supabase
    .from('share_summaries')
    .select('summary, generated_at')
    .eq('user_id', userId)
    .maybeSingle()
  if (error) throw new Error(`Failed to get summary: ${error.message}`)
  return data as { summary: string; generated_at: string } | null
}

export const saveSummary = async (userId: string, summary: string): Promise<void> => {
  const { error } = await supabase
    .from('share_summaries')
    .upsert(
      { user_id: userId, summary, generated_at: new Date().toISOString() },
      { onConflict: 'user_id' },
    )
  if (error) throw new Error(`Failed to save summary: ${error.message}`)
}
