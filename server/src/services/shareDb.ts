import { randomBytes } from 'crypto'
import { supabase } from './db.js'

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

export const getShareLinkByToken = async (token: string): Promise<string | null> => {
  const { data, error } = await supabase
    .from('share_links')
    .select('user_id')
    .eq('token', token)
    .maybeSingle()
  if (error) throw new Error(`Failed to look up share token: ${error.message}`)
  return (data?.user_id as string | undefined) ?? null
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
