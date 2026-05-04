import { randomBytes } from 'crypto'
import { supabase } from './db.js'
import type { ChatMessage } from '../types.js'

// ─── Link tokens ──────────────────────────────────────────────────────────────

export const createLinkToken = async (userId: string, ttlSeconds: number): Promise<string> => {
  const token = randomBytes(32).toString('hex')
  const expiresAt = new Date(Date.now() + ttlSeconds * 1000).toISOString()

  const { error } = await supabase
    .from('link_tokens')
    .insert({ token, user_id: userId, expires_at: expiresAt })
  if (error) throw new Error(`Failed to create link token: ${error.message}`)
  return token
}

// Single atomic UPDATE to prevent TOCTOU race condition
export const consumeLinkToken = async (token: string): Promise<string | null> => {
  const { data, error } = await supabase.rpc('consume_link_token', { p_token: token })
  if (error) throw new Error(`Failed to consume link token: ${error.message}`)
  return (data as string | null) ?? null
}

// ─── Account linking ───────────────────────────────────────────────────────────

export const linkTelegramAccount = async (
  telegramUserId: number,
  userId: string,
): Promise<void> => {
  const { error } = await supabase
    .from('telegram_accounts')
    .upsert(
      { telegram_user_id: telegramUserId, user_id: userId, linked_at: new Date().toISOString() },
      { onConflict: 'telegram_user_id' },
    )
  if (error) throw new Error(`Failed to link Telegram account: ${error.message}`)
}

export const findUserByTelegramId = async (telegramUserId: number): Promise<string | null> => {
  const { data, error } = await supabase
    .from('telegram_accounts')
    .select('user_id')
    .eq('telegram_user_id', telegramUserId)
    .maybeSingle()
  if (error) throw new Error(`Failed to find user by Telegram ID: ${error.message}`)
  return (data?.user_id as string | undefined) ?? null
}

export const getTelegramLinkByUserId = async (
  userId: string,
): Promise<{ telegram_user_id: number; linked_at: string } | null> => {
  const { data, error } = await supabase
    .from('telegram_accounts')
    .select('telegram_user_id, linked_at')
    .eq('user_id', userId)
    .maybeSingle()
  if (error) throw new Error(`Failed to get Telegram link: ${error.message}`)
  return data as { telegram_user_id: number; linked_at: string } | null
}

export const unlinkTelegramAccount = async (userId: string): Promise<void> => {
  const { error } = await supabase.from('telegram_accounts').delete().eq('user_id', userId)
  if (error) throw new Error(`Failed to unlink Telegram account: ${error.message}`)
}

export const setRemindersEnabled = async (
  telegramUserId: number,
  enabled: boolean,
): Promise<void> => {
  const { error } = await supabase
    .from('telegram_accounts')
    .update({ reminders_enabled: enabled })
    .eq('telegram_user_id', telegramUserId)
  if (error) throw new Error(`Failed to update reminders_enabled: ${error.message}`)
}

// ─── Chat sessions ─────────────────────────────────────────────────────────────

export const getChatSession = async (userId: string): Promise<ChatMessage[]> => {
  const { data, error } = await supabase
    .from('chat_sessions')
    .select('messages')
    .eq('user_id', userId)
    .maybeSingle()
  if (error) throw new Error(`Failed to get chat session: ${error.message}`)
  return (data?.messages as ChatMessage[]) ?? []
}

export const upsertChatSession = async (
  userId: string,
  telegramChatId: number,
  messages: ChatMessage[],
): Promise<void> => {
  const { error } = await supabase.from('chat_sessions').upsert(
    {
      user_id: userId,
      telegram_chat_id: telegramChatId,
      messages,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' },
  )
  if (error) throw new Error(`Failed to upsert chat session: ${error.message}`)
}

// ─── Deadline queries for cron ─────────────────────────────────────────────────

interface DeadlineRow {
  userId: string
  telegramChatId: number
  universityName: string
  applicationDeadline: string
}

export const getUsersWithDeadlineInDays = async (days: number): Promise<DeadlineRow[]> => {
  // Join plans → telegram_accounts → chat_sessions
  // Filter plans where the applicationDeadline parses to exactly `current_date + days`
  const { data, error } = await supabase.rpc('get_users_with_deadline_in_days', { p_days: days })
  if (error) {
    console.error(`[telegramDb] Deadline query failed (days=${days}): ${error.message}`)
    return []
  }
  return ((data as unknown[]) ?? []).map((row) => {
    const r = row as Record<string, unknown>
    return {
      userId: r.user_id as string,
      telegramChatId: Number(r.telegram_chat_id),
      universityName: r.university_name as string,
      applicationDeadline: r.application_deadline as string,
    }
  })
}
