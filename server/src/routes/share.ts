import { Router } from 'express'
import { authMiddleware } from '../middleware/auth.js'
import {
  getOrCreateShareLink,
  deleteShareLink,
  getShareDetails,
  updateShareSettings,
  incrementViewCount,
  getShareLinkByToken,
  type ShareSettings,
} from '../services/shareDb.js'
import { getProfile, getShortlists, getPlans } from '../services/db.js'

interface PlanData {
  applicationDeadline?: string
  parentTalkingPoints?: string[]
  monthlyChecklist?: Array<{
    month: string
    tasks: Array<{ week: number; task: string; importance?: string }>
  }>
}

const router = Router()

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const estimateTaskDate = (monthLabel: string, week: number): Date => {
  const parts = monthLabel.split(' ')
  const monthIdx = MONTH_NAMES.indexOf(parts[0])
  if (monthIdx === -1) return new Date(0)
  const year = parseInt(parts[1] ?? String(new Date().getFullYear()))
  const day = week ? Math.min((week - 1) * 7 + 4, 28) : 15
  return new Date(year, monthIdx, day)
}

const formatDueLabel = (date: Date, now: Date): string => {
  const msA = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  const msB = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()
  const diff = Math.round((msB - msA) / 86_400_000)
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Tomorrow'
  if (diff > 1 && diff < 7) return DAY_NAMES[date.getDay()]!
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const formatDueShort = (date: Date): string =>
  date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

// ─── GET /api/share/me — current user's share details ─────────────────────────

router.get('/me', authMiddleware, async (req, res, next) => {
  try {
    const details = await getShareDetails(req.user!.id)
    res.json({ success: true, data: details })
  } catch (err) {
    next(err)
  }
})

// ─── POST /api/share — create or return share link ────────────────────────────

router.post('/', authMiddleware, async (req, res, next) => {
  try {
    await getOrCreateShareLink(req.user!.id)
    const details = await getShareDetails(req.user!.id)
    res.json({ success: true, data: details })
  } catch (err) {
    next(err)
  }
})

// ─── PATCH /api/share — update share settings ─────────────────────────────────

router.patch('/', authMiddleware, async (req, res, next) => {
  try {
    const { settings } = req.body as { settings?: ShareSettings }
    if (!settings) {
      res.status(400).json({ success: false, error: 'settings required' })
      return
    }
    await updateShareSettings(req.user!.id, settings)
    const details = await getShareDetails(req.user!.id)
    res.json({ success: true, data: details })
  } catch (err) {
    next(err)
  }
})

// ─── DELETE /api/share — revoke share link ────────────────────────────────────

router.delete('/', authMiddleware, async (req, res, next) => {
  try {
    await deleteShareLink(req.user!.id)
    res.json({ success: true, data: null })
  } catch (err) {
    next(err)
  }
})

// ─── GET /api/share/:token — public shared dashboard view ─────────────────────

router.get('/:token', async (req, res, next) => {
  try {
    const { token } = req.params
    const linkData = await getShareLinkByToken(token)
    if (!linkData) {
      res.status(404).json({ success: false, error: 'Link not found or revoked' })
      return
    }

    const { userId, settings } = linkData

    // Increment view count — fire and forget, non-blocking
    void incrementViewCount(token).catch(() => undefined)

    const [profileRow, shortlistRows, planRows] = await Promise.all([
      getProfile(userId),
      getShortlists(userId),
      getPlans(userId),
    ])

    if (!profileRow?.data) {
      res.status(404).json({ success: false, error: 'Student data not found' })
      return
    }

    const profileData = profileRow.data as Record<string, unknown>
    const firstName =
      typeof profileData.name === 'string' ? profileData.name.split(' ')[0] : 'Student'

    const latestShortlist = shortlistRows[0]
    const shortlistUnis = (latestShortlist?.universities ?? []) as Array<Record<string, unknown>>

    const now = new Date()
    const weekEnd = new Date(now.getTime() + 7 * 86_400_000)

    interface UniShareData {
      universityName: string
      program: string
      country: string
      language: string
      tuition: number
      level: 'Reach' | 'Match' | 'Safety'
      deadline: string
      totalTasks: number
      completedTasks: number
      dueThisWeek: number
      hasPlan: boolean
    }

    interface FlatTask {
      id: string
      title: string
      uniName: string
      month: string
      week: number
      importance: string
      done: boolean
      date: Date
    }

    const universities: UniShareData[] = []
    const allFlatTasks: FlatTask[] = []
    const allTalkingPoints: string[] = []

    // Build plan lookup by university name
    const planByName = new Map(planRows.map((p) => [p.university_name, p]))

    // Iterate shortlist as the primary source; merge plan data if available
    for (const su of shortlistUnis) {
      const uniName = su.name as string
      const level = ((su.tier as string | undefined) ?? 'Match') as 'Reach' | 'Match' | 'Safety'
      const planRow = planByName.get(uniName)

      if (!planRow) {
        universities.push({
          universityName: uniName,
          program: (su.program as string | undefined) ?? '',
          country: (su.country as string | undefined) ?? '',
          language: (su.language as string | undefined) ?? '',
          tuition: (su.tuitionUSD as number | undefined) ?? 0,
          level,
          deadline: '',
          totalTasks: 0,
          completedTasks: 0,
          dueThisWeek: 0,
          hasPlan: false,
        })
        continue
      }

      const planData = planRow.plan as PlanData
      const completions = (planRow.task_completions ?? {}) as Record<string, boolean>

      // Collect parent talking points
      if (Array.isArray(planData.parentTalkingPoints)) {
        for (const pt of planData.parentTalkingPoints) {
          if (typeof pt === 'string' && !allTalkingPoints.includes(pt)) {
            allTalkingPoints.push(pt)
          }
        }
      }

      const tasks: FlatTask[] = []
      planData.monthlyChecklist?.forEach(
        (
          month: {
            month: string
            tasks: Array<{ week: number; task: string; importance?: string }>
          },
          mi: number,
        ) => {
          month.tasks.forEach(
            (t: { week: number; task: string; importance?: string }, ti: number) => {
              const id = `m${mi}-t${ti}`
              tasks.push({
                id,
                title: t.task,
                uniName,
                month: month.month,
                week: t.week,
                importance: t.importance ?? 'important',
                done: !!completions[id],
                date: estimateTaskDate(month.month, t.week),
              })
            },
          )
        },
      )

      // Collect incomplete tasks that fall within this week for the weekTasks list
      for (const t of tasks) {
        if (!t.done) allFlatTasks.push(t)
      }

      const totalTasks = tasks.length
      const completedTasks = tasks.filter((t) => t.done).length
      const dueThisWeek = tasks.filter((t) => {
        if (t.done) return false
        return t.date >= now && t.date <= weekEnd
      }).length

      universities.push({
        universityName: uniName,
        program: (su.program as string | undefined) ?? '',
        country: (su.country as string | undefined) ?? '',
        language: (su.language as string | undefined) ?? '',
        tuition: (su.tuitionUSD as number | undefined) ?? 0,
        level,
        deadline: planData.applicationDeadline ?? '',
        totalTasks,
        completedTasks,
        dueThisWeek,
        hasPlan: true,
      })
    }

    // Include plans whose university is no longer in the shortlist
    for (const planRow of planRows) {
      if (shortlistUnis.some((u) => u.name === planRow.university_name)) continue

      const planData = planRow.plan as PlanData
      const completions = (planRow.task_completions ?? {}) as Record<string, boolean>

      if (Array.isArray(planData.parentTalkingPoints)) {
        for (const pt of planData.parentTalkingPoints) {
          if (typeof pt === 'string' && !allTalkingPoints.includes(pt)) {
            allTalkingPoints.push(pt)
          }
        }
      }

      const tasks: FlatTask[] = []
      planData.monthlyChecklist?.forEach(
        (
          month: {
            month: string
            tasks: Array<{ week: number; task: string; importance?: string }>
          },
          mi: number,
        ) => {
          month.tasks.forEach(
            (t: { week: number; task: string; importance?: string }, ti: number) => {
              const id = `m${mi}-t${ti}`
              tasks.push({
                id,
                title: t.task,
                uniName: planRow.university_name,
                month: month.month,
                week: t.week,
                importance: t.importance ?? 'important',
                done: !!completions[id],
                date: estimateTaskDate(month.month, t.week),
              })
            },
          )
        },
      )

      for (const t of tasks) {
        if (!t.done) allFlatTasks.push(t)
      }

      const totalTasks = tasks.length
      const completedTasks = tasks.filter((t) => t.done).length
      const dueThisWeek = tasks.filter((t) => {
        if (t.done) return false
        return t.date >= now && t.date <= weekEnd
      }).length

      universities.push({
        universityName: planRow.university_name,
        program: '',
        country: '',
        language: '',
        tuition: 0,
        level: 'Match',
        deadline: planData.applicationDeadline ?? '',
        totalTasks,
        completedTasks,
        dueThisWeek,
        hasPlan: true,
      })
    }

    // Build week tasks: incomplete tasks in the next 7 days, sorted by date asc then urgency desc
    const urgencyOrder: Record<string, number> = { critical: 0, important: 1, 'nice-to-have': 2 }
    const weekTasks = allFlatTasks
      .filter((t) => t.date >= now && t.date <= weekEnd)
      .sort((a, b) => {
        const dateDiff = a.date.getTime() - b.date.getTime()
        if (dateDiff !== 0) return dateDiff
        return (urgencyOrder[a.importance] ?? 1) - (urgencyOrder[b.importance] ?? 1)
      })
      .slice(0, 5)
      .map((t) => ({
        title: t.title,
        uniName: t.uniName,
        urgency:
          t.importance === 'critical'
            ? ('urgent' as const)
            : t.importance === 'important'
              ? ('important' as const)
              : ('later' as const),
        dueLabel: formatDueLabel(t.date, now),
        dueShort: formatDueShort(t.date),
      }))

    // Build help items
    const DEFAULT_HELP_ITEMS = [
      'Ask about the nearest upcoming deadline and how you can help prepare',
      'Offer to help with paperwork — translations, notarizations, or printing take time',
      "Just ask how it's going — not about grades, but about the process itself",
    ]
    const helpItems =
      allTalkingPoints.slice(0, 3).length > 0 ? allTalkingPoints.slice(0, 3) : DEFAULT_HELP_ITEMS

    res.json({
      success: true,
      data: { student: { firstName }, settings, universities, weekTasks, helpItems },
    })
  } catch (err) {
    next(err)
  }
})

export default router
