import { Router } from 'express'
import { Telegraf } from 'telegraf'
import { authMiddleware } from '../middleware/auth.js'
import {
  createLinkToken,
  consumeLinkToken,
  linkTelegramAccount,
  findUserByTelegramId,
  getTelegramLinkByUserId,
  unlinkTelegramAccount,
  getChatSession,
  upsertChatSession,
  setRemindersEnabled,
} from '../services/telegramDb.js'
import { getProfile, getShortlists, getPlans } from '../services/db.js'
import { toStudentProfile } from '../services/profileAdapter.js'
import { runAgent } from '../services/agent.js'
import type { ChatMessage } from '../types.js'

const router = Router()
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN!)

// ─── Per-user rate limiting (10 messages/day) ─────────────────────────────────

const chatUsageToday = new Map<string, { count: number; resetAt: number }>()
const CHAT_DAILY_LIMIT = 10

const checkAndIncrementUsage = (userId: string): boolean => {
  const now = Date.now()
  const entry = chatUsageToday.get(userId)
  const midnight = new Date()
  midnight.setUTCHours(24, 0, 0, 0)
  const resetAt = midnight.getTime()

  if (!entry || entry.resetAt <= now) {
    chatUsageToday.set(userId, { count: 1, resetAt })
    return true
  }
  if (entry.count >= CHAT_DAILY_LIMIT) return false
  entry.count++
  return true
}

// ─── Bot: /start <token> ───────────────────────────────────────────────────────

bot.start(async (ctx) => {
  const token = ctx.startPayload
  const telegramUserId = ctx.from.id
  const chatId = ctx.chat.id

  if (!token) return

  let userId: string | null
  try {
    userId = await consumeLinkToken(token)
  } catch {
    await ctx.reply('Something went wrong. Please try again from the Unipath web app.')
    return
  }

  if (!userId) {
    await ctx.reply(
      'This link has expired or already been used. Please generate a new one from the Unipath web app.',
    )
    return
  }

  await linkTelegramAccount(telegramUserId, userId)
  await upsertChatSession(userId, chatId, [])
  await ctx.reply(
    'Your Unipath account is now connected! Ask me anything about your universities, deadlines, or application steps.',
  )
})

// ─── Bot: /stop ───────────────────────────────────────────────────────────────

bot.command('stop', async (ctx) => {
  const userId = await findUserByTelegramId(ctx.from.id)
  if (!userId) return
  await setRemindersEnabled(ctx.from.id, false)
  await ctx.reply('Deadline reminders paused. Send /resume any time to turn them back on.')
})

// ─── Bot: /resume ─────────────────────────────────────────────────────────────

bot.command('resume', async (ctx) => {
  const userId = await findUserByTelegramId(ctx.from.id)
  if (!userId) return
  await setRemindersEnabled(ctx.from.id, true)
  await ctx.reply("Reminders are back on. I'll notify you 7 days and 1 day before each deadline.")
})

// ─── Bot: text messages ────────────────────────────────────────────────────────

bot.on('text', async (ctx) => {
  const telegramUserId = ctx.from.id
  const chatId = ctx.chat.id
  const userMessage = ctx.message.text

  const userId = await findUserByTelegramId(telegramUserId)
  if (!userId) return

  if (!checkAndIncrementUsage(userId)) {
    await ctx.reply("You've reached the daily chat limit (10 messages). It resets at midnight UTC.")
    return
  }

  const [profileRow, shortlistRows, planRows, history] = await Promise.all([
    getProfile(userId),
    getShortlists(userId),
    getPlans(userId),
    getChatSession(userId),
  ])

  if (!profileRow?.data) {
    await ctx.reply(
      "It looks like you haven't set up your Unipath profile yet. Go to the web app to complete your profile first.",
    )
    return
  }

  let profile
  try {
    profile = toStudentProfile(profileRow.data as Record<string, unknown>)
  } catch {
    await ctx.reply(
      'Your profile is incomplete. Please finish setting it up on the Unipath web app.',
    )
    return
  }

  // Minimal shortlist context — name, tier, tuition only
  const latestShortlist = shortlistRows[0]
  const shortlistUniversities = (
    (latestShortlist?.universities ?? []) as Array<Record<string, unknown>>
  ).map((u) => ({
    name: u.name as string,
    tier: u.tier as string,
    tuitionUSD: u.tuitionUSD as number,
  }))

  // Upcoming deadlines only — no checklist data
  const now = new Date()
  const upcomingDeadlines = planRows
    .map((p) => {
      const plan = p.plan as Record<string, unknown>
      return {
        universityName: p.university_name as string,
        applicationDeadline: plan.applicationDeadline as string,
      }
    })
    .filter((d) => {
      try {
        return new Date(d.applicationDeadline) > now
      } catch {
        return false
      }
    })

  const trimmedHistory = history.slice(-10)

  await ctx.sendChatAction('typing')

  let reply: string
  try {
    const output = await runAgent({
      type: 'chat',
      profile,
      shortlistUniversities,
      upcomingDeadlines,
      history: trimmedHistory,
      userMessage,
    })
    if (output.type !== 'chat') throw new Error('Unexpected agent output')
    reply = output.result.answer
  } catch (err) {
    console.error('[telegram] Chat agent error:', err)
    reply = 'Sorry, something went wrong. Please try again in a moment.'
  }

  const updatedHistory: ChatMessage[] = [
    ...trimmedHistory,
    { role: 'user' as const, content: userMessage },
    { role: 'assistant' as const, content: reply },
  ].slice(-10)

  await upsertChatSession(userId, chatId, updatedHistory)
  await ctx.reply(reply)
})

// ─── HTTP: generate link token ─────────────────────────────────────────────────

router.post('/telegram/link-token', authMiddleware, async (req, res, next) => {
  try {
    const ttl = Number(process.env.LINK_TOKEN_TTL_SECONDS ?? 600)
    const token = await createLinkToken(req.user!.id, ttl)
    const botUsername = process.env.TELEGRAM_BOT_USERNAME ?? 'UnipathBot'
    const deeplinkUrl = `https://t.me/${botUsername}?start=${token}`
    res.json({ success: true, data: { token, deeplinkUrl } })
  } catch (err) {
    next(err)
  }
})

// ─── HTTP: check link status ───────────────────────────────────────────────────

router.get('/telegram/link', authMiddleware, async (req, res, next) => {
  try {
    const data = await getTelegramLinkByUserId(req.user!.id)
    res.json({ success: true, data })
  } catch (err) {
    next(err)
  }
})

// ─── HTTP: toggle reminders ────────────────────────────────────────────────────

router.patch('/telegram/reminder', authMiddleware, async (req, res, next) => {
  try {
    const { enabled } = req.body as { enabled: boolean }
    const link = await getTelegramLinkByUserId(req.user!.id)
    if (!link) {
      res.status(404).json({ success: false, error: 'Telegram not linked' })
      return
    }
    await setRemindersEnabled(link.telegram_user_id, enabled)
    res.json({ success: true, data: { reminders_enabled: enabled } })
  } catch (err) {
    next(err)
  }
})

// ─── HTTP: unlink ──────────────────────────────────────────────────────────────

router.delete('/telegram/link', authMiddleware, async (req, res, next) => {
  try {
    await unlinkTelegramAccount(req.user!.id)
    res.json({ success: true, data: null })
  } catch (err) {
    next(err)
  }
})

// ─── HTTP: webhook ─────────────────────────────────────────────────────────────

router.post('/telegram/webhook', async (req, res) => {
  const secret = req.headers['x-telegram-bot-api-secret-token']
  if (secret !== process.env.TELEGRAM_WEBHOOK_SECRET) {
    res.status(403).send('Forbidden')
    return
  }
  try {
    await bot.handleUpdate(req.body as Parameters<typeof bot.handleUpdate>[0])
  } catch (err) {
    console.error('[telegram] Webhook error:', err)
  }
  // Always 200 — prevents Telegram retry storms
  res.sendStatus(200)
})

export default router
