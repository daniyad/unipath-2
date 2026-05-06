import { Router } from 'express'
import { authMiddleware } from '../middleware/auth.js'
import {
  getOrCreateShareLink,
  deleteShareLink,
  getShareLinkByUserId,
  getShareLinkByToken,
} from '../services/shareDb.js'
import { getOrGenerateSummary, type PlanSummaryInfo } from '../services/summaryService.js'
import { getProfile, getShortlists, getPlans } from '../services/db.js'

interface PlanData {
  applicationDeadline?: string
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

const estimateTaskDate = (monthLabel: string, week: number): Date => {
  const parts = monthLabel.split(' ')
  const monthIdx = MONTH_NAMES.indexOf(parts[0])
  if (monthIdx === -1) return new Date(0)
  const year = parseInt(parts[1] ?? String(new Date().getFullYear()))
  const day = week ? Math.min((week - 1) * 7 + 4, 28) : 15
  return new Date(year, monthIdx, day)
}

// ─── GET /api/share/me — current user's share link ────────────────────────────

router.get('/me', authMiddleware, async (req, res, next) => {
  try {
    const token = await getShareLinkByUserId(req.user!.id)
    res.json({ success: true, data: token ? { token } : null })
  } catch (err) {
    next(err)
  }
})

// ─── POST /api/share — create or return share link ────────────────────────────

router.post('/', authMiddleware, async (req, res, next) => {
  try {
    const token = await getOrCreateShareLink(req.user!.id)
    res.json({ success: true, data: { token } })
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
    const userId = await getShareLinkByToken(token)
    if (!userId) {
      res.status(404).json({ success: false, error: 'Link not found or revoked' })
      return
    }

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
    const lang = (profileData.lang as 'en' | 'ru' | undefined) ?? 'en'

    const latestShortlist = shortlistRows[0]
    const shortlistUnis = (latestShortlist?.universities ?? []) as Array<Record<string, unknown>>

    const now = new Date()
    const weekEnd = new Date(now.getTime() + 7 * 86_400_000)

    const universities: Array<{
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
    }> = []

    const planInfos: PlanSummaryInfo[] = []

    for (const planRow of planRows) {
      const planData = planRow.plan as PlanData
      const completions = (planRow.task_completions ?? {}) as Record<string, boolean>
      const shortlistUni = shortlistUnis.find((u) => u.name === planRow.university_name)

      interface FlatTask {
        id: string
        title: string
        month: string
        week: number
        importance: string
        done: boolean
      }

      const allTasks: FlatTask[] = []
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
              allTasks.push({
                id,
                title: t.task,
                month: month.month,
                week: t.week,
                importance: t.importance ?? 'important',
                done: !!completions[id],
              })
            },
          )
        },
      )

      const totalTasks = allTasks.length
      const completedTasks = allTasks.filter((t) => t.done).length

      const dueThisWeek = allTasks.filter((t) => {
        if (t.done) return false
        const d = estimateTaskDate(t.month, t.week)
        return d >= now && d <= weekEnd
      }).length

      const urgentIncompleteTasks = allTasks
        .filter((t) => !t.done && t.importance === 'critical')
        .slice(0, 2)
        .map((t) => ({ title: t.title, month: t.month }))

      if (urgentIncompleteTasks.length < 2) {
        for (const t of allTasks.filter((t) => !t.done && t.importance !== 'critical')) {
          if (urgentIncompleteTasks.length >= 2) break
          urgentIncompleteTasks.push({ title: t.title, month: t.month })
        }
      }

      const level = ((shortlistUni?.tier as string | undefined) ?? 'Match') as
        | 'Reach'
        | 'Match'
        | 'Safety'

      universities.push({
        universityName: planRow.university_name,
        program: (shortlistUni?.program as string | undefined) ?? '',
        country: (shortlistUni?.country as string | undefined) ?? '',
        language: (shortlistUni?.language as string | undefined) ?? '',
        tuition: (shortlistUni?.tuitionUSD as number | undefined) ?? 0,
        level,
        deadline: planData.applicationDeadline ?? '',
        totalTasks,
        completedTasks,
        dueThisWeek,
      })

      planInfos.push({
        universityName: planRow.university_name,
        level,
        completedTasks,
        totalTasks,
        deadline: planData.applicationDeadline ?? '',
        urgentIncompleteTasks,
      })
    }

    let summary = ''
    if (planInfos.length > 0) {
      try {
        summary = await getOrGenerateSummary(userId, planInfos, firstName, lang)
      } catch (err) {
        console.error('[share] Summary generation failed:', err)
      }
    }

    res.json({
      success: true,
      data: { student: { firstName }, summary, universities },
    })
  } catch (err) {
    next(err)
  }
})

export default router
