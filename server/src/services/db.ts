import { createClient } from '@supabase/supabase-js'
import type { StudentProfile, University } from '../types.js'
import type { PlanResult } from './prompts.js'

export const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

// ─── Shortlists ─────────────────────────────────────────────────────────────

export async function saveShortlist(
  userId: string,
  profile: StudentProfile,
  universities: University[],
) {
  const { data, error } = await supabase
    .from('shortlists')
    .insert({ user_id: userId, profile, universities })
    .select()
    .single()

  if (error) throw new Error(`Failed to save shortlist: ${error.message}`)
  return data
}

export async function getShortlists(userId: string) {
  const { data, error } = await supabase
    .from('shortlists')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw new Error(`Failed to get shortlists: ${error.message}`)
  return data ?? []
}

// ─── Plans ───────────────────────────────────────────────────────────────────

export async function savePlan(userId: string, profile: StudentProfile, plan: PlanResult) {
  const { data, error } = await supabase
    .from('plans')
    .insert({ user_id: userId, university_name: plan.universityName, profile, plan })
    .select()
    .single()

  if (error) throw new Error(`Failed to save plan: ${error.message}`)
  return data
}

export async function getPlans(userId: string) {
  const { data, error } = await supabase
    .from('plans')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw new Error(`Failed to get plans: ${error.message}`)
  return data ?? []
}
