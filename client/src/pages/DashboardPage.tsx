import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useProfile } from '../contexts/ProfileContext'
import { useApi } from '../contexts/ApiContext'
import { Navbar } from '../components/Navbar'
import type { ServerPlan } from '../types'
import { toClientPlan } from '../types'
import styles from './DashboardPage.module.css'

interface TaskWithPlan {
  taskId: string
  planId: string
  uniName: string
  title: string
  week?: number
  done: boolean
}

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

export function DashboardPage() {
  const { profile } = useProfile()
  const api = useApi()
  const { t } = useTranslation()
  const navigate = useNavigate()

  const [plans, setPlans] = useState<ServerPlan[]>([])
  const [loading, setLoading] = useState(true)

  const name = profile?.name ?? t('dashboard.nameFallback')

  useEffect(() => {
    void api
      .getPlans()
      .then(setPlans)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  // ── In-progress universities (have a plan) ──────────────────────────────────
  const inProgress = useMemo(
    () =>
      plans.map((sp) => {
        const university = {
          id: sp.university_name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          name: sp.university_name,
          program: '',
          city: '',
          country: '',
          language: '',
          tuition: 0,
          level: 'Match' as const,
          whyFit: '',
        }
        const plan = toClientPlan(sp, university)
        const done = plan.monthlyTasks.filter((t) => t.done).length
        const total = plan.monthlyTasks.length
        const deadlineDate = plan.applicationDeadline ? new Date(plan.applicationDeadline) : null
        const daysLeft = deadlineDate
          ? Math.ceil((deadlineDate.getTime() - Date.now()) / 86_400_000)
          : null
        return { sp, plan, done, total, daysLeft }
      }),
    [plans],
  )

  // ── Upcoming deadlines (future only, top 5) ─────────────────────────────────
  const upcomingDeadlines = useMemo(
    () =>
      plans
        .filter((sp) => sp.plan.applicationDeadline)
        .map((sp) => ({
          planId: sp.id,
          uniName: sp.university_name,
          deadline: new Date(sp.plan.applicationDeadline),
          daysLeft: Math.ceil(
            (new Date(sp.plan.applicationDeadline).getTime() - Date.now()) / 86_400_000,
          ),
        }))
        .filter((d) => d.daysLeft > 0)
        .sort((a, b) => a.daysLeft - b.daysLeft)
        .slice(0, 5),
    [plans],
  )

  // ── This month's tasks ──────────────────────────────────────────────────────
  const now = new Date()
  const currentMonthLabel = `${MONTH_NAMES[now.getMonth()]} ${now.getFullYear()}`

  const thisMonthTasks = useMemo((): TaskWithPlan[] => {
    const result: TaskWithPlan[] = []
    for (const sp of plans) {
      const university = {
        id: sp.university_name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        name: sp.university_name,
        program: '',
        city: '',
        country: '',
        language: '',
        tuition: 0,
        level: 'Match' as const,
        whyFit: '',
      }
      const plan = toClientPlan(sp, university)
      for (const task of plan.monthlyTasks) {
        if (task.month === currentMonthLabel) {
          result.push({
            taskId: task.id,
            planId: sp.id,
            uniName: sp.university_name,
            title: task.title,
            week: task.week,
            done: task.done,
          })
        }
      }
    }
    return result.sort((a, b) => (a.week ?? 5) - (b.week ?? 5))
  }, [plans, currentMonthLabel])

  const toggleTask = async (planId: string, taskId: string, currentDone: boolean) => {
    const newDone = !currentDone
    setPlans((prev) =>
      prev.map((sp) => {
        if (sp.id !== planId) return sp
        const completions = { ...sp.task_completions }
        if (newDone) completions[taskId] = true
        else delete completions[taskId]
        return { ...sp, task_completions: completions }
      }),
    )
    try {
      await api.updateTask(planId, taskId, newDone)
    } catch {
      setPlans((prev) =>
        prev.map((sp) => {
          if (sp.id !== planId) return sp
          const completions = { ...sp.task_completions }
          if (currentDone) completions[taskId] = true
          else delete completions[taskId]
          return { ...sp, task_completions: completions }
        }),
      )
    }
  }

  const weekGroups = useMemo(() => {
    const groups = new Map<number, TaskWithPlan[]>()
    for (const task of thisMonthTasks) {
      const w = task.week ?? 0
      if (!groups.has(w)) groups.set(w, [])
      groups.get(w)!.push(task)
    }
    return [...groups.entries()].sort(([a], [b]) => a - b)
  }, [thisMonthTasks])

  if (loading) {
    return (
      <div className={styles.page}>
        <Navbar showProfileActions />
        <div className={styles.container}>
          <p style={{ color: 'var(--color-muted)', fontSize: 'var(--text-sm)' }}>Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <Navbar showProfileActions />

      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.greeting}>{t('dashboard.greeting', { name })}</h1>
          <p className={styles.subtitle}>{t('dashboard.subtitle')}</p>
        </div>

        {/* ── In Progress ───────────────────────────────────────────────── */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>{t('dashboard.inProgress')}</h2>
          {inProgress.length === 0 ? (
            <div className={styles.emptyState}>
              <p className={styles.emptyTitle}>{t('dashboard.noPlansTitle')}</p>
              <p className={styles.emptyText}>{t('dashboard.noPlansText')}</p>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => navigate('/universities')}
              >
                {t('dashboard.viewUniversities')}
              </button>
            </div>
          ) : (
            <div className={styles.uniList}>
              {inProgress.map(({ sp, done, total, daysLeft }) => {
                const pct = total > 0 ? Math.round((done / total) * 100) : 0
                return (
                  <div
                    key={sp.id}
                    className={styles.uniCard}
                    onClick={() => navigate(`/plan/${sp.id}`)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && navigate(`/plan/${sp.id}`)}
                  >
                    <div className={styles.uniCardLeft}>
                      <p className={styles.uniName}>{sp.university_name}</p>
                      {daysLeft !== null && daysLeft > 0 && (
                        <p className={styles.uniProgram}>
                          {t('dashboard.daysUntilDeadline', { days: daysLeft })}
                        </p>
                      )}
                      <div className={styles.progressBar}>
                        <div className={styles.progressFill} style={{ width: `${pct}%` }} />
                      </div>
                      <p className={styles.taskCount}>{t('dashboard.tasks', { done, total })}</p>
                    </div>
                    <span className={styles.uniArrow}>→</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* ── Upcoming Deadlines ────────────────────────────────────────── */}
        {upcomingDeadlines.length > 0 && (
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>{t('dashboard.upcomingDeadlines')}</h2>
            <div className={styles.deadlineList}>
              {upcomingDeadlines.map((d) => (
                <div
                  key={d.planId}
                  className={styles.deadlineRow}
                  onClick={() => navigate(`/plan/${d.planId}`)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && navigate(`/plan/${d.planId}`)}
                >
                  <span className={styles.deadlineUni}>{d.uniName}</span>
                  <span className={styles.deadlineMeta}>
                    {d.deadline.toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                    <span
                      className={d.daysLeft <= 30 ? styles.deadlineUrgent : styles.deadlineDays}
                    >
                      {d.daysLeft}d
                    </span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── This Month ────────────────────────────────────────────────── */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>{currentMonthLabel}</h2>
          {weekGroups.length === 0 ? (
            <p className={styles.emptyText} style={{ padding: '16px 0' }}>
              {t('dashboard.noTasksThisMonth')}
            </p>
          ) : (
            <div className={styles.calendarGrid}>
              {weekGroups.map(([week, tasks]) => (
                <div key={week} className={styles.calendarWeek}>
                  <p className={styles.weekLabel}>
                    {week > 0 ? t('dashboard.week', { n: week }) : t('dashboard.ongoing')}
                  </p>
                  <div className={styles.calendarTasks}>
                    {tasks.map((task) => (
                      <label key={`${task.planId}-${task.taskId}`} className={styles.calendarTask}>
                        <input
                          type="checkbox"
                          checked={task.done}
                          onChange={() => void toggleTask(task.planId, task.taskId, task.done)}
                          className={styles.calendarCheckbox}
                        />
                        <div className={styles.calendarTaskBody}>
                          <span
                            className={`${styles.calendarTaskTitle} ${task.done ? styles.calendarTaskDone : ''}`}
                          >
                            {task.title}
                          </span>
                          <span className={styles.calendarTaskUni}>{task.uniName}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
