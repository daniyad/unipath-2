import { createClient } from '@supabase/supabase-js'
import type { University } from '../types.js'
import type { PlanResult, ShortlistResult } from './prompts.js'

export const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

// ─── Profiles ────────────────────────────────────────────────────────────────

export const getProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()
  if (error) throw new Error(`Failed to get profile: ${error.message}`)
  return data
}

export const upsertProfile = async (userId: string, profileData: Record<string, unknown>) => {
  const { data, error } = await supabase
    .from('profiles')
    .upsert({ user_id: userId, data: profileData }, { onConflict: 'user_id' })
    .select()
    .single()
  if (error) throw new Error(`Failed to upsert profile: ${error.message}`)
  return data
}

// ─── Stale marking ────────────────────────────────────────────────────────────

export const markAllStale = async (userId: string) => {
  const [a, b] = await Promise.all([
    supabase.from('shortlists').update({ is_stale: true }).eq('user_id', userId),
    supabase.from('plans').update({ is_stale: true }).eq('user_id', userId),
  ])
  if (a.error) throw new Error(`Failed to mark shortlists stale: ${a.error.message}`)
  if (b.error) throw new Error(`Failed to mark plans stale: ${b.error.message}`)
}

// ─── Shortlists ───────────────────────────────────────────────────────────────

export const saveShortlist = async (
  userId: string,
  profile: Record<string, unknown>,
  universities: ShortlistResult['universities'],
) => {
  const { data, error } = await supabase
    .from('shortlists')
    .insert({ user_id: userId, profile, universities })
    .select()
    .single()
  if (error) throw new Error(`Failed to save shortlist: ${error.message}`)
  return data
}

export const getShortlists = async (userId: string) => {
  const { data, error } = await supabase
    .from('shortlists')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw new Error(`Failed to get shortlists: ${error.message}`)
  return data ?? []
}

// ─── Plans ────────────────────────────────────────────────────────────────────

export const savePlan = async (userId: string, university: University, plan: PlanResult) => {
  const { data, error } = await supabase
    .from('plans')
    .insert({ user_id: userId, university_name: university.name, plan })
    .select()
    .single()
  if (error) throw new Error(`Failed to save plan: ${error.message}`)
  return data
}

export const getPlans = async (userId: string) => {
  const { data, error } = await supabase
    .from('plans')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw new Error(`Failed to get plans: ${error.message}`)
  return data ?? []
}

export const updateTaskCompletion = async (
  userId: string,
  planId: string,
  taskId: string,
  done: boolean,
) => {
  const { data: existing, error: fetchErr } = await supabase
    .from('plans')
    .select('task_completions')
    .eq('id', planId)
    .eq('user_id', userId)
    .single()
  if (fetchErr) throw new Error(`Plan not found: ${fetchErr.message}`)

  const completions = (existing.task_completions ?? {}) as Record<string, boolean>
  if (done) {
    completions[taskId] = true
  } else {
    delete completions[taskId]
  }

  const { data, error } = await supabase
    .from('plans')
    .update({ task_completions: completions })
    .eq('id', planId)
    .eq('user_id', userId)
    .select()
    .single()
  if (error) throw new Error(`Failed to update task: ${error.message}`)
  return data
}
