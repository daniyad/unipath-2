import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useProfile } from '../contexts/ProfileContext'
import { useApi } from '../contexts/ApiContext'
import { Navbar } from '../components/Navbar'
import { ShareDialog } from '../components/ShareDialog'
import type {
  ServerPlan,
  ServerShortlist,
  ServerUniversity,
  ShareDetails,
  ShareSettings,
} from '../types'
import { toClientPlan, toClientUniversity, type UniversityPlan } from '../types'
import styles from './DashboardPage.module.css'

// ── Types ──────────────────────────────────────────────────────────────────────

interface UniEntry {
  key: string
  name: string
  serverUni?: ServerUniversity
  sp?: ServerPlan
  plan?: UniversityPlan
  done: number
  total: number
  daysLeft: number | null
}

interface DashTask {
  id: string
  planId: string
  uniName: string
  title: string
  date: Date
  urgency: 'urgent' | 'important' | 'later'
  done: boolean
  isDeadline?: boolean
}

// ── Helpers ───────────────────────────────────────────────────────────────────

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

const estimateTaskDate = (monthLabel: string, week: number | undefined): Date => {
  const parts = monthLabel.split(' ')
  const monthIdx = MONTH_NAMES.indexOf(parts[0])
  const year = parseInt(parts[1] ?? String(new Date().getFullYear()))
  if (monthIdx === -1) return new Date()
  const day = week ? Math.min((week - 1) * 7 + 4, 28) : 15
  return new Date(year, monthIdx, day)
}

const sameDay = (a: Date, b: Date): boolean =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate()

const daysBetween = (a: Date, b: Date): number => {
  const msA = new Date(a.getFullYear(), a.getMonth(), a.getDate()).getTime()
  const msB = new Date(b.getFullYear(), b.getMonth(), b.getDate()).getTime()
  return Math.round((msB - msA) / 86_400_000)
}

const fmtRelative = (date: Date, today: Date): { label: string; overdue: boolean } => {
  const d = daysBetween(today, date)
  if (d < 0) return { label: `${Math.abs(d)}d overdue`, overdue: true }
  if (d === 0) return { label: 'Today', overdue: false }
  if (d === 1) return { label: 'Tomorrow', overdue: false }
  if (d < 7)
    return { label: date.toLocaleDateString('en-US', { weekday: 'short' }), overdue: false }
  return { label: `${d}d`, overdue: false }
}

const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-')

// ── UniTileCard ───────────────────────────────────────────────────────────────

interface UniTileCardProps {
  entry: UniEntry
  selected: boolean
  dimmed: boolean
  onClick: () => void
  onNavigate: (name: string) => void
}

function UniTileCard({ entry, selected, dimmed, onClick, onNavigate }: UniTileCardProps) {
  const { t, i18n } = useTranslation()
  const { name, serverUni, sp, done, total, daysLeft } = entry
  const pct = total > 0 ? Math.round((done / total) * 100) : 0
  const soon = daysLeft !== null && daysLeft > 0 && daysLeft <= 30
  const hasPlan = !!sp

  const tierChipClass: Record<string, string> = {
    Reach: 'chip chip-amber',
    Match: 'chip',
    Safety: 'chip chip-success',
    Unlikely: 'chip chip-danger',
  }

  const tileClass = [styles.uniTile, selected ? styles.featured : '', dimmed ? styles.dimmed : '']
    .filter(Boolean)
    .join(' ')

  const locale = i18n.language === 'ru' ? 'ru-RU' : 'en-US'

  return (
    <div
      className={tileClass}
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-pressed={selected}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
    >
      <span className={styles.uniTileArrow}>→</span>

      <div>
        {serverUni?.tier && (
          <div className={styles.uniTileTop}>
            <span className={tierChipClass[serverUni.tier] ?? 'chip'}>{serverUni.tier}</span>
          </div>
        )}
        <div className={styles.uniTileName} style={{ marginTop: serverUni?.tier ? 12 : 0 }}>
          {name}
        </div>
        {(serverUni?.program || serverUni?.city) && (
          <div className={styles.uniTileProg}>
            {serverUni.program}
            {serverUni.program && serverUni.city && <span className={styles.dot}> · </span>}
            {serverUni.city}
          </div>
        )}
      </div>

      {hasPlan ? (
        <>
          <div className={styles.tileProgress}>
            <div className={styles.tileProgressRow}>
              <span>{t('dashboard.tasks', { done, total })}</span>
              <span className={styles.tilePct}>{pct}%</span>
            </div>
            <div className={styles.tileTrack}>
              <div style={{ width: `${pct}%` }} />
            </div>
          </div>

          {daysLeft !== null && sp?.plan.applicationDeadline && (
            <div className={styles.uniTileDeadline}>
              <span className={styles.uniTileDeadlineLabel}>{t('plan.deadline')}</span>
              <span className={`${styles.uniTileDeadlineVal}${soon ? ` ${styles.soon}` : ''}`}>
                {new Date(sp.plan.applicationDeadline).toLocaleDateString(locale, {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
                {' · '}
                {daysLeft > 0
                  ? t('dashboard.daysLeft', { days: daysLeft })
                  : t('dashboard.deadlinePassed')}
              </span>
            </div>
          )}
        </>
      ) : (
        <div className={styles.noPlanHint}>
          {t('dashboard.noPlanHint')}
          <button
            type="button"
            className={styles.noPlanLink}
            onClick={(e) => {
              e.stopPropagation()
              onNavigate(name)
            }}
          >
            {t('dashboard.noPlanCta')}
          </button>
        </div>
      )}

      <button
        type="button"
        className={styles.noPlanLink}
        style={{ marginTop: 8 }}
        onClick={(e) => {
          e.stopPropagation()
          onNavigate(name)
        }}
      >
        {t('dashboard.viewDetails')}
      </button>
    </div>
  )
}

// ── ThisWeekPanel ─────────────────────────────────────────────────────────────

interface ThisWeekPanelProps {
  tasks: DashTask[]
  today: Date
  onToggle: (planId: string, taskId: string, done: boolean) => void
  filterUni: string | null
  unisWithPlans: Set<string>
}

function ThisWeekPanel({ tasks, today, onToggle, filterUni, unisWithPlans }: ThisWeekPanelProps) {
  const { t, i18n } = useTranslation()
  const urgencyOrder: Record<string, number> = { urgent: 0, important: 1, later: 2 }
  const weekEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7)

  const filterHasPlan = !filterUni || unisWithPlans.has(filterUni)

  const items = tasks
    .filter(
      (task) =>
        !task.done &&
        !task.isDeadline &&
        task.date <= weekEnd &&
        (!filterUni || task.uniName === filterUni),
    )
    .sort((a, b) => {
      const dateDiff = a.date.getTime() - b.date.getTime()
      if (dateDiff !== 0) return dateDiff
      return (urgencyOrder[a.urgency] ?? 1) - (urgencyOrder[b.urgency] ?? 1)
    })
    .slice(0, 5)

  const urgentCount = items.filter((task) => task.urgency === 'urgent').length
  const locale = i18n.language === 'ru' ? 'ru-RU' : 'en-US'

  const urgencyKeyMap: Record<string, string> = {
    urgent: 'plan.urgencyLabels.high',
    important: 'plan.urgencyLabels.medium',
    later: 'plan.urgencyLabels.low',
  }

  return (
    <div className={styles.weekCard}>
      <div className={styles.weekHead}>
        <span className={styles.weekEyebrow}>{t('dashboard.thisWeekEyebrow')}</span>
        <span className={`${styles.weekEyebrow} ${styles.weekEyebrowMuted}`}>
          {t('dashboard.urgentCount', { urgent: urgentCount, total: items.length })}
        </span>
      </div>
      <h2 className={styles.weekTitle}>{t('dashboard.thisWeekTitle')}</h2>
      <p className={styles.weekSub}>{t('dashboard.thisWeekSub')}</p>

      <div className={styles.weekList}>
        {!filterHasPlan ? (
          <div className={styles.weekEmpty}>{t('dashboard.noPlanFilter', { uni: filterUni })}</div>
        ) : items.length === 0 ? (
          <div className={styles.weekEmpty}>{t('dashboard.allClearWeek')}</div>
        ) : (
          items.map((task) => {
            const rel = fmtRelative(task.date, today)
            const urgencyClass =
              task.urgency === 'urgent'
                ? `${styles.urgBadge} ${styles.urgHigh}`
                : task.urgency === 'important'
                  ? `${styles.urgBadge} ${styles.urgMed}`
                  : `${styles.urgBadge} ${styles.urgLow}`
            const urgencyLabel = t(urgencyKeyMap[task.urgency] ?? 'plan.urgencyLabels.low')

            return (
              <div key={`${task.planId}-${task.id}`} className={styles.weekItem}>
                <button
                  type="button"
                  className={`${styles.weekCheck}${task.done ? ` ${styles.checked}` : ''}`}
                  onClick={() => onToggle(task.planId, task.id, task.done)}
                  aria-label={task.done ? t('dashboard.markUndone') : t('dashboard.markDone')}
                />
                <div className={styles.weekTaskMain}>
                  <span
                    className={`${styles.weekTaskTitle}${task.done ? ` ${styles.weekTaskDone}` : ''}`}
                  >
                    {task.title}
                  </span>
                  <span className={styles.weekTaskMeta}>
                    <span className={styles.uniNamePill}>{task.uniName}</span>
                    <span className={styles.metaDot} />
                    <span className={urgencyClass}>{urgencyLabel}</span>
                  </span>
                </div>
                <span className={`${styles.weekDue}${rel.overdue ? ` ${styles.overdue}` : ''}`}>
                  <strong>{rel.label}</strong>
                  <br />
                  <span className={styles.weekDueDate}>
                    {task.date.toLocaleDateString(locale, { month: 'short', day: 'numeric' })}
                  </span>
                </span>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

// ── MonthViewPanel ────────────────────────────────────────────────────────────

interface MonthViewPanelProps {
  tasks: DashTask[]
  today: Date
  filterUni: string | null
  unisWithPlans: Set<string>
}

function MonthViewPanel({ tasks, today, filterUni, unisWithPlans }: MonthViewPanelProps) {
  const { t, i18n } = useTranslation()
  const [viewMonth, setViewMonth] = useState({ year: today.getFullYear(), month: today.getMonth() })
  const [selectedDay, setSelectedDay] = useState<{
    year: number
    month: number
    day: number
  } | null>(null)

  // Calendar bounds: current month → current month + 3
  const minView = { year: today.getFullYear(), month: today.getMonth() }
  const maxViewDate = new Date(today.getFullYear(), today.getMonth() + 3, 1)
  const maxView = { year: maxViewDate.getFullYear(), month: maxViewDate.getMonth() }

  const isAtMin = viewMonth.year === minView.year && viewMonth.month === minView.month
  const isAtMax = viewMonth.year === maxView.year && viewMonth.month === maxView.month

  const filterHasPlan = !filterUni || unisWithPlans.has(filterUni)

  const filteredTasks = useMemo(
    () => tasks.filter((t) => !filterUni || t.uniName === filterUni),
    [tasks, filterUni],
  )

  const tasksByDay = useMemo(() => {
    const m = new Map<string, DashTask[]>()
    filteredTasks.forEach((t) => {
      const key = `${t.date.getFullYear()}-${t.date.getMonth()}-${t.date.getDate()}`
      if (!m.has(key)) m.set(key, [])
      m.get(key)!.push(t)
    })
    return m
  }, [filteredTasks])

  const getDayTasks = (d: Date) =>
    tasksByDay.get(`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`) ?? []

  const navigate = (delta: number) => {
    if (delta < 0 && isAtMin) return
    if (delta > 0 && isAtMax) return
    setViewMonth((prev) => {
      let m = prev.month + delta
      let y = prev.year
      if (m < 0) {
        m = 11
        y -= 1
      }
      if (m > 11) {
        m = 0
        y += 1
      }
      return { year: y, month: m }
    })
    setSelectedDay(null)
  }

  // Build 42-cell grid (Mon-first)
  const firstOfMonth = new Date(viewMonth.year, viewMonth.month, 1)
  const lastOfMonth = new Date(viewMonth.year, viewMonth.month + 1, 0)
  const startWeekday = (firstOfMonth.getDay() + 6) % 7
  const firstCell = new Date(viewMonth.year, viewMonth.month, 1 - startWeekday)
  const cells: Date[] = Array.from(
    { length: 42 },
    (_, i) => new Date(firstCell.getFullYear(), firstCell.getMonth(), firstCell.getDate() + i),
  )
  const showRows = cells[35].getMonth() === viewMonth.month || cells[35] <= lastOfMonth ? 6 : 5
  const visible = cells.slice(0, showRows * 7)

  const locale = i18n.language === 'ru' ? 'ru-RU' : 'en-US'
  // Jan 6 2025 is a Monday — generate day abbreviations starting from it
  const dows = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(2025, 0, 6 + i)
    return new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(d)
  })
  const monthLabel = new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(
    new Date(viewMonth.year, viewMonth.month, 1),
  )
  const selectedDate = selectedDay
    ? new Date(selectedDay.year, selectedDay.month, selectedDay.day)
    : null
  const selectedTasks = selectedDate ? getDayTasks(selectedDate) : []

  return (
    <div className={styles.monthCard}>
      <div className={styles.monthHead}>
        <h2 className={styles.monthTitle}>{t('dashboard.whatsComingTitle')}</h2>
        <div className={styles.monthNav}>
          <button
            type="button"
            className={`${styles.monthNavBtn}${isAtMin ? ` ${styles.monthNavBtnDisabled}` : ''}`}
            onClick={() => navigate(-1)}
            disabled={isAtMin}
            aria-label={t('nav.back')}
          >
            ←
          </button>
          <span className={styles.monthNavLabel}>{monthLabel}</span>
          <button
            type="button"
            className={`${styles.monthNavBtn}${isAtMax ? ` ${styles.monthNavBtnDisabled}` : ''}`}
            onClick={() => navigate(1)}
            disabled={isAtMax}
            aria-label={t('nav.back')}
          >
            →
          </button>
        </div>
      </div>

      {!filterHasPlan ? (
        <div className={styles.calNoPlan}>{t('dashboard.calNoPlan', { uni: filterUni })}</div>
      ) : (
        <>
          <div className={styles.cal}>
            {dows.map((d) => (
              <div key={d} className={styles.calDow}>
                {d}
              </div>
            ))}
            {visible.map((d, i) => {
              const inMonth = d.getMonth() === viewMonth.month
              const isToday = sameDay(d, today)
              const items = getDayTasks(d)
              const hasDeadline = items.some((t) => t.isDeadline)
              const hasUrgent = items.some((t) => t.urgency === 'urgent' && !t.isDeadline)
              const hasAny = items.length > 0
              const isSel =
                selectedDay !== null &&
                d.getFullYear() === selectedDay.year &&
                d.getMonth() === selectedDay.month &&
                d.getDate() === selectedDay.day

              const cls = [
                styles.calDay,
                !inMonth ? styles.muted : '',
                isToday ? styles.today : '',
                hasDeadline ? styles.calDeadline : hasAny ? styles.hasTask : '',
                isSel ? styles.calSelected : '',
              ]
                .filter(Boolean)
                .join(' ')

              return (
                <div
                  key={i}
                  className={cls}
                  style={{ cursor: hasAny ? 'pointer' : 'default' }}
                  onClick={() =>
                    hasAny &&
                    setSelectedDay(
                      isSel
                        ? null
                        : { year: d.getFullYear(), month: d.getMonth(), day: d.getDate() },
                    )
                  }
                >
                  <span className={styles.calDayNum}>{d.getDate()}</span>
                  <div className={styles.calDots}>
                    {hasDeadline && <span className={`${styles.calDot} ${styles.deadlineMark}`} />}
                    {!hasDeadline && hasUrgent && (
                      <span className={`${styles.calDot} ${styles.urgentDot}`} />
                    )}
                    {!hasDeadline && !hasUrgent && hasAny && <span className={styles.calDot} />}
                  </div>
                </div>
              )
            })}
          </div>

          {selectedDate && selectedTasks.length > 0 && (
            <div className={styles.calDetail}>
              <div className={styles.calDetailHead}>
                {selectedDate.toLocaleDateString(locale, {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                })}
              </div>
              <div className={styles.calDetailList}>
                {selectedTasks.map((task) => (
                  <div key={`${task.planId}-${task.id}`} className={styles.calDetailRow}>
                    <span style={{ flex: 1 }}>{task.title}</span>
                    <span className={styles.calDetailUni}>{task.uniName}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className={styles.calLegend}>
            <span className={styles.calLegendItem}>
              <span className={`${styles.calLegendSwatch} ${styles.swatchToday}`} />{' '}
              {t('dashboard.calToday')}
            </span>
            <span className={styles.calLegendItem}>
              <span className={`${styles.calLegendSwatch} ${styles.swatchTask}`} />{' '}
              {t('dashboard.calTask')}
            </span>
            <span className={styles.calLegendItem}>
              <span className={`${styles.calLegendSwatch} ${styles.swatchUrgent}`} />{' '}
              {t('dashboard.calUrgent')}
            </span>
            <span className={styles.calLegendItem}>
              <span className={`${styles.calLegendSwatch} ${styles.swatchDeadline}`} />{' '}
              {t('dashboard.calDeadline')}
            </span>
          </div>
        </>
      )}
    </div>
  )
}

// ── DashboardPage ─────────────────────────────────────────────────────────────

export function DashboardPage() {
  const { profile } = useProfile()
  const api = useApi()
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()

  const [plans, setPlans] = useState<ServerPlan[]>([])
  const [shortlists, setShortlists] = useState<ServerShortlist[]>([])
  const [loading, setLoading] = useState(true)
  const [filterUni, setFilterUni] = useState<string | null>(null)

  // Share state: undefined = loading, null = no active link, ShareDetails = active
  const [shareDetails, setShareDetails] = useState<ShareDetails | null | undefined>(undefined)
  const [showShareDialog, setShowShareDialog] = useState(false)

  const name = profile?.name ?? t('dashboard.nameFallback')

  useEffect(() => {
    void Promise.all([api.getPlans(), api.getShortlists()])
      .then(([p, s]) => {
        setPlans(p)
        setShortlists(s)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [api])

  useEffect(() => {
    void api
      .getShareDetails()
      .then((data) => setShareDetails(data))
      .catch(() => setShareDetails(null))
  }, [api])

  const handleShare = async () => {
    try {
      const data = await api.createShareLink()
      setShareDetails(data)
      setShowShareDialog(true)
    } catch {
      // ignore
    }
  }

  const handleRevoke = async () => {
    try {
      await api.deleteShareLink()
      setShareDetails(null)
      setShowShareDialog(false)
    } catch {
      // ignore
    }
  }

  const handleSettingsChange = async (settings: ShareSettings) => {
    try {
      const updated = await api.updateShareSettings(settings)
      setShareDetails(updated)
    } catch {
      // ignore
    }
  }

  const now = new Date()

  // All universities to display: shortlist unis + any plans not in shortlist
  const allUnis = useMemo((): UniEntry[] => {
    const latest = [...shortlists].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    )[0]

    const makeEntry = (
      uniName: string,
      serverUni: ServerUniversity | undefined,
      sp: ServerPlan | undefined,
    ): UniEntry => {
      const key = sp?.id ?? slugify(uniName)
      if (!sp) {
        return {
          key,
          name: uniName,
          serverUni,
          sp: undefined,
          plan: undefined,
          done: 0,
          total: 0,
          daysLeft: null,
        }
      }
      const university = {
        id: slugify(uniName),
        name: uniName,
        program: serverUni?.program ?? '',
        city: serverUni?.city ?? '',
        country: serverUni?.country ?? '',
        language: serverUni?.language ?? '',
        tuition: serverUni?.tuitionUSD ?? 0,
        level: (serverUni?.tier ?? 'Match') as 'Reach' | 'Match' | 'Safety' | 'Unlikely',
        whyFit: serverUni?.rationale ?? '',
      }
      const plan = toClientPlan(sp, university)
      const done = plan.monthlyTasks.filter((t) => t.done).length
      const total = plan.monthlyTasks.length
      const deadlineDate = plan.applicationDeadline ? new Date(plan.applicationDeadline) : null
      const daysLeft = deadlineDate
        ? Math.ceil((deadlineDate.getTime() - Date.now()) / 86_400_000)
        : null
      return { key, name: uniName, serverUni, sp, plan, done, total, daysLeft }
    }

    if (latest) {
      const entries = latest.universities.map((serverUni) => {
        const sp = plans.find((p) => p.university_name === serverUni.name)
        return makeEntry(serverUni.name, serverUni, sp)
      })
      // Append plans whose university isn't in the shortlist
      const shortlistNames = new Set(latest.universities.map((u) => u.name))
      for (const sp of plans) {
        if (!shortlistNames.has(sp.university_name)) {
          entries.push(makeEntry(sp.university_name, undefined, sp))
        }
      }
      return entries
    }

    // No shortlist yet — show plans only
    return plans.map((sp) => makeEntry(sp.university_name, undefined, sp))
  }, [plans, shortlists])

  // Set of university names that have an action plan (for panel empty-state logic)
  const unisWithPlans = useMemo(
    () => new Set(allUnis.filter((u) => !!u.sp).map((u) => u.name)),
    [allUnis],
  )

  // Flat task list with estimated dates — only from unis that have plans
  const dashTasks = useMemo((): DashTask[] => {
    const result: DashTask[] = []
    for (const { name: uniName, sp, plan } of allUnis) {
      if (!sp || !plan) continue
      if (plan.applicationDeadline) {
        result.push({
          id: `deadline-${sp.id}`,
          planId: sp.id,
          uniName,
          title: `${uniName} deadline`,
          date: new Date(plan.applicationDeadline),
          urgency: 'urgent',
          done: false,
          isDeadline: true,
        })
      }
      for (const task of plan.monthlyTasks) {
        result.push({
          id: task.id,
          planId: sp.id,
          uniName,
          title: task.title,
          date: estimateTaskDate(task.month, task.week),
          urgency:
            task.importance === 'critical'
              ? 'urgent'
              : task.importance === 'important'
                ? 'important'
                : 'later',
          done: task.done,
        })
      }
    }
    return result
  }, [allUnis])

  const weekEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7)
  const urgentThisWeek = dashTasks.filter(
    (t) => !t.done && !t.isDeadline && t.urgency === 'urgent' && t.date <= weekEnd,
  ).length

  const activeCount = allUnis.filter((u) => !!u.sp).length

  const nextDeadline = useMemo(
    () =>
      allUnis
        .filter((e) => e.daysLeft !== null && e.daysLeft > 0)
        .sort((a, b) => (a.daysLeft ?? Infinity) - (b.daysLeft ?? Infinity))[0] ?? null,
    [allUnis],
  )

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

  if (loading) {
    return (
      <div className={styles.page}>
        <Navbar showProfileActions />
        <div className={styles.dashPage}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
            {t('dashboard.loading')}
          </p>
        </div>
      </div>
    )
  }

  const locale = i18n.language === 'ru' ? 'ru-RU' : 'en-US'
  const dayStr = now.toLocaleDateString(locale, { weekday: 'long', month: 'long', day: 'numeric' })

  return (
    <div className={styles.page}>
      <Navbar showProfileActions />

      <div className={styles.dashPage}>
        {/* ── Header ──────────────────────────────────────────────────── */}
        <header className={styles.dashHeader}>
          <div>
            <h1 className={styles.dashGreet}>{t('dashboard.greeting', { name })}</h1>
            <p className={styles.dashSub}>
              {activeCount > 0 ? (
                <>
                  {"You're juggling"}{' '}
                  <strong>
                    {activeCount} active application{activeCount !== 1 ? 's' : ''}
                  </strong>
                  .{' '}
                  {urgentThisWeek > 0 ? (
                    <>
                      <strong>
                        {urgentThisWeek} urgent thing{urgentThisWeek !== 1 ? 's' : ''}
                      </strong>{' '}
                      this week
                      {nextDeadline && (
                        <>
                          {' '}
                          — {nextDeadline.name.split(' ')[0]} closes in {nextDeadline.daysLeft}d
                        </>
                      )}
                      . Stay on it.
                    </>
                  ) : (
                    <>{"Nothing urgent this week — you're in good shape."}</>
                  )}
                </>
              ) : (
                t('dashboard.subtitle')
              )}
            </p>
          </div>

          <div className={styles.dashStats}>
            <div className={styles.dashStat}>
              <span className={styles.dashStatLabel}>{t('dashboard.calToday')}</span>
              <span className={`${styles.dashStatValue} ${styles.dashStatDate}`}>{dayStr}</span>
            </div>
            {nextDeadline && (
              <div className={styles.dashStat}>
                <span className={styles.dashStatLabel}>{t('dashboard.upcomingDeadlines')}</span>
                <span className={styles.dashStatValue}>
                  {nextDeadline.daysLeft}
                  <span className={styles.unit}>days · {nextDeadline.name.split(' ')[0]}</span>
                </span>
              </div>
            )}
          </div>
        </header>

        {/* ── Your universities ────────────────────────────────────────── */}
        <section className={styles.dashSection}>
          <div className={styles.secHead}>
            <h2 className={styles.secTitle}>{t('dashboard.yourUnis')}</h2>
            <span className={styles.secMeta}>
              {filterUni ? (
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault()
                    setFilterUni(null)
                  }}
                >
                  {t('dashboard.showAll')}
                </a>
              ) : (
                t('dashboard.filterHint')
              )}
            </span>
          </div>

          {allUnis.length === 0 ? (
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
            <div className={styles.uniRow}>
              {allUnis.map((entry) => (
                <UniTileCard
                  key={entry.key}
                  entry={entry}
                  selected={filterUni === entry.name}
                  dimmed={filterUni !== null && filterUni !== entry.name}
                  onClick={() => setFilterUni(filterUni === entry.name ? null : entry.name)}
                  onNavigate={(uniName) => {
                    const entry = allUnis.find((u) => u.name === uniName)
                    if (entry?.serverUni) {
                      const clientUni = toClientUniversity(entry.serverUni, entry.sp?.id)
                      navigate(`/university/${slugify(uniName)}`, {
                        state: { university: clientUni, serverUniversity: entry.serverUni },
                      })
                    }
                  }}
                />
              ))}
            </div>
          )}
        </section>

        {/* ── This week + Calendar ─────────────────────────────────────── */}
        {allUnis.length > 0 && (
          <section className={styles.dashSection}>
            <div className={styles.dashSplit}>
              <ThisWeekPanel
                tasks={dashTasks}
                today={now}
                onToggle={toggleTask}
                filterUni={filterUni}
                unisWithPlans={unisWithPlans}
              />
              <MonthViewPanel
                tasks={dashTasks}
                today={now}
                filterUni={filterUni}
                unisWithPlans={unisWithPlans}
              />
            </div>
          </section>
        )}

        {/* ── Share section ────────────────────────────────────────────── */}
        {shareDetails !== undefined && (
          <section className={styles.shareSection}>
            <div className={styles.shareSectionLeft}>
              <div className={styles.shareSectionTitle}>{t('dashboard.shareTitle')}</div>
              <p className={styles.shareSectionSub}>{t('dashboard.shareSub')}</p>
            </div>
            <div className={styles.shareSectionRight}>
              {shareDetails ? (
                <button
                  type="button"
                  className={styles.shareSectionBtn}
                  onClick={() => setShowShareDialog(true)}
                >
                  {t('dashboard.manageLink')}
                </button>
              ) : (
                <button
                  type="button"
                  className={styles.shareSectionBtn}
                  onClick={() => void handleShare()}
                >
                  {t('dashboard.createLink')}
                </button>
              )}
              {shareDetails && (
                <span className={styles.shareSectionActive}>{t('dashboard.linkActive')}</span>
              )}
            </div>
          </section>
        )}
      </div>

      {showShareDialog && shareDetails && (
        <ShareDialog
          details={shareDetails}
          onClose={() => setShowShareDialog(false)}
          onRevoke={() => void handleRevoke()}
          onSettingsChange={(settings) => void handleSettingsChange(settings)}
        />
      )}
    </div>
  )
}
