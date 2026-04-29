import { useState, useMemo, useEffect } from 'react'
import { useParams, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useApi } from '../contexts/ApiContext'
import { Navbar } from '../components/Navbar'
import type { University, UniversityPlan, PlanTask, ServerPlan } from '../types'
import { toClientPlan } from '../types'
import styles from './PlanPage.module.css'

const urgencyStyles: Record<string, string> = {
  high: styles.urgencyHigh,
  medium: styles.urgencyMed,
  low: styles.urgencyLow,
}

interface LocationState {
  university?: University
}

export function PlanPage() {
  const { id } = useParams<{ id: string }>()
  const location = useLocation()
  const { t } = useTranslation()
  const api = useApi()

  const state = location.state as LocationState | null
  const passedUniversity = state?.university

  const [plan, setPlan] = useState<UniversityPlan | null>(null)
  const [serverPlan, setServerPlan] = useState<ServerPlan | null>(null)
  const [loading, setLoading] = useState(true)
  const [docsDone, setDocsDone] = useState<Set<string>>(new Set())
  const [parentsOpen, setParentsOpen] = useState(false)

  useEffect(() => {
    if (!id) return
    void api
      .getPlans()
      .then((plans) => {
        const match = plans.find((p) => p.id === id)
        if (match) {
          setServerPlan(match)
          const university = passedUniversity ?? {
            id: match.university_name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            name: match.university_name,
            program: '',
            city: '',
            country: '',
            language: '',
            tuition: 0,
            level: 'Match' as const,
            whyFit: '',
          }
          setPlan(toClientPlan(match, university))
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [id])

  const toggleTask = async (taskId: string) => {
    if (!plan || !serverPlan) return
    const currentDone = !!serverPlan.task_completions[taskId]
    const newDone = !currentDone

    // Optimistic update
    setPlan((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        monthlyTasks: prev.monthlyTasks.map((t) => (t.id === taskId ? { ...t, done: newDone } : t)),
      }
    })
    setServerPlan((prev) => {
      if (!prev) return prev
      const completions = { ...prev.task_completions }
      if (newDone) completions[taskId] = true
      else delete completions[taskId]
      return { ...prev, task_completions: completions }
    })

    try {
      await api.updateTask(serverPlan.id, taskId, newDone)
    } catch {
      // Revert on failure
      setPlan((prev) => {
        if (!prev) return prev
        return {
          ...prev,
          monthlyTasks: prev.monthlyTasks.map((t) =>
            t.id === taskId ? { ...t, done: currentDone } : t,
          ),
        }
      })
    }
  }

  const toggleDoc = (name: string) => {
    setDocsDone((prev) => {
      const next = new Set(prev)
      if (next.has(name)) next.delete(name)
      else next.add(name)
      return next
    })
  }

  const months = useMemo(
    () => (plan ? [...new Set(plan.monthlyTasks.map((t: PlanTask) => t.month))] : []),
    [plan],
  )

  const completedCount = plan?.monthlyTasks.filter((t) => t.done).length ?? 0
  const totalCount = plan?.monthlyTasks.length ?? 0
  const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0
  const focusTasks = plan?.monthlyTasks.filter((t) => !t.done).slice(0, 3) ?? []

  const daysUntilDeadline = useMemo(() => {
    if (!plan?.applicationDeadline) return 0
    const deadline = new Date(plan.applicationDeadline)
    const today = new Date()
    return Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  }, [plan?.applicationDeadline])

  const formattedDeadline = useMemo(() => {
    if (!plan?.applicationDeadline) return ''
    return new Date(plan.applicationDeadline).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }, [plan?.applicationDeadline])

  if (loading) {
    return (
      <div className={styles.page}>
        <Navbar showBack />
        <div className={styles.container}>
          <p style={{ color: 'var(--color-muted)', fontSize: 'var(--text-sm)' }}>Loading plan...</p>
        </div>
      </div>
    )
  }

  if (!plan) {
    return (
      <div className={styles.page}>
        <Navbar showBack />
        <div className={styles.container}>
          <p style={{ color: 'var(--color-muted)' }}>Plan not found.</p>
        </div>
      </div>
    )
  }

  const uniName = passedUniversity?.name ?? serverPlan?.university_name ?? 'University'
  const program = passedUniversity?.program
  const city = passedUniversity?.city
  const country = passedUniversity?.country

  return (
    <div className={styles.page}>
      <Navbar showBack />

      <div className={styles.container}>
        {/* ── Header ── */}
        <div className={styles.header}>
          <h1 className={styles.uniName}>{uniName}</h1>
          <p className={styles.programLine}>
            {[program, city && country ? `${city}, ${country}` : null].filter(Boolean).join(' · ')}
            {plan.portalUrl && (
              <>
                {' · '}
                <a
                  href={plan.portalUrl}
                  className={styles.portalLink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t('plan.portal')} ↗
                </a>
              </>
            )}
          </p>
          {formattedDeadline && (
            <p className={styles.headerMeta}>
              {t('plan.deadline')}: {formattedDeadline}
              {daysUntilDeadline > 0 && ` · ${t('plan.daysLeft', { days: daysUntilDeadline })}`}
              {plan.tuition > 0 && ` · ${t('plan.tuition')}: $${plan.tuition.toLocaleString()}/yr`}
            </p>
          )}
        </div>

        {/* ── Overview ── */}
        {plan.overview && (
          <div className={styles.overviewCard}>
            <p className={styles.overviewText}>{plan.overview}</p>
          </div>
        )}

        {/* ── Focus right now ── */}
        {focusTasks.length > 0 && (
          <div className={styles.focusCard}>
            <div className={styles.focusHeader}>
              <h3 className={styles.focusTitle}>{t('plan.focusNow')}</h3>
              <span className={styles.focusSubtitle}>{t('plan.focusSubtitle')}</span>
            </div>
            <div className={styles.focusList}>
              {focusTasks.map((task) => (
                <label key={task.id} className={styles.focusTask}>
                  <input
                    type="checkbox"
                    checked={task.done}
                    onChange={() => void toggleTask(task.id)}
                    className={styles.checkbox}
                  />
                  <div className={styles.focusTaskContent}>
                    <span className={styles.focusTaskTitle}>{task.title}</span>
                    <span className={styles.focusTaskMonth}>{task.month}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* ── Progress bar ── */}
        <div className={styles.progressSection}>
          <div className={styles.progressHeader}>
            <span className={styles.progressLabel}>{t('plan.progressLabel')}</span>
            <span className={styles.progressCount}>
              {t('plan.progress', { done: completedCount, total: totalCount })}
            </span>
          </div>
          <div className={styles.progressTrack}>
            <div className={styles.progressFill} style={{ width: `${progressPct}%` }} />
          </div>
        </div>

        {/* ── Action plan table ── */}
        <section className={styles.tableSection}>
          <h2 className={styles.sectionHeading}>{t('plan.actionPlan')}</h2>
          <div className={styles.tableWrap}>
            <table className={styles.planTable}>
              <thead>
                <tr>
                  <th className={styles.thMonth}>{t('plan.monthCol')}</th>
                  <th className={styles.thWeek}>{t('plan.weekCol')}</th>
                  <th className={styles.thTask}>{t('plan.taskCol')}</th>
                  <th className={styles.thDone}>{t('plan.doneCol')}</th>
                </tr>
              </thead>
              <tbody>
                {months.map((month) => {
                  const monthTasks = plan.monthlyTasks.filter((t) => t.month === month)
                  return monthTasks.map((task, i) => (
                    <tr
                      key={task.id}
                      className={`${styles.planRow} ${task.done ? styles.rowDone : ''}`}
                    >
                      {i === 0 && (
                        <td rowSpan={monthTasks.length} className={styles.monthCell}>
                          {month}
                        </td>
                      )}
                      <td className={styles.weekCell}>
                        {task.week != null ? `Wk ${task.week}` : '—'}
                      </td>
                      <td className={styles.taskCell}>{task.title}</td>
                      <td className={styles.checkCell}>
                        <input
                          type="checkbox"
                          checked={task.done}
                          onChange={() => void toggleTask(task.id)}
                          className={styles.checkbox}
                        />
                      </td>
                    </tr>
                  ))
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* ── Documents table ── */}
        <section className={styles.tableSection}>
          <h2 className={styles.sectionHeading}>{t('plan.docs')}</h2>
          <div className={styles.tableWrap}>
            <table className={styles.docsTable}>
              <thead>
                <tr>
                  <th className={styles.thDocName}>{t('plan.taskCol')}</th>
                  <th className={styles.thDocHow}>{t('plan.how')}</th>
                  <th className={styles.thDocUrgency}>{t('plan.urgency')}</th>
                  <th className={styles.thDocGot}>{t('plan.gotIt')}</th>
                </tr>
              </thead>
              <tbody>
                {plan.documents.map((doc) => (
                  <tr
                    key={doc.name}
                    className={`${styles.docRow} ${docsDone.has(doc.name) ? styles.rowDone : ''}`}
                  >
                    <td className={styles.docNameCell}>{doc.name}</td>
                    <td className={styles.docHowCell}>{doc.howToGet}</td>
                    <td className={styles.docUrgencyCell}>
                      <span className={`${styles.urgencyBadge} ${urgencyStyles[doc.urgency]}`}>
                        {t(`plan.urgencyLabels.${doc.urgency}`)}
                      </span>
                    </td>
                    <td className={styles.docGotCell}>
                      <input
                        type="checkbox"
                        checked={docsDone.has(doc.name)}
                        onChange={() => toggleDoc(doc.name)}
                        className={styles.checkbox}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ── Tests required ── */}
        {plan.tests.length > 0 && (
          <section className={styles.tableSection}>
            <h2 className={styles.sectionHeading}>{t('plan.testsRequired')}</h2>
            <div className={styles.testsGrid}>
              {plan.tests.map((test) => (
                <div key={test.name} className={styles.testCard}>
                  <span className={styles.testName}>{test.name}</span>
                  <div className={styles.testMeta}>
                    <div className={styles.testMetaItem}>
                      <span className={styles.testMetaLabel}>{t('plan.prepTime')}</span>
                      <span className={styles.testMetaValue}>{test.prepTime}</span>
                    </div>
                    <div className={styles.testMetaItem}>
                      <span className={styles.testMetaLabel}>{t('plan.startBy')}</span>
                      <span className={styles.testMetaValue}>{test.startBy}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Parent talking points (collapsible) ── */}
        {plan.parentTalkingPoints.length > 0 && (
          <section className={styles.section}>
            <button className={styles.sectionToggle} onClick={() => setParentsOpen((v) => !v)}>
              <span className={styles.sectionTitle}>{t('plan.parents')}</span>
              <span className={styles.sectionCaret}>{parentsOpen ? '▲' : '▼'}</span>
            </button>
            {parentsOpen && (
              <div className={styles.sectionBody}>
                <ul className={styles.parentList}>
                  {plan.parentTalkingPoints.map((point, idx) => (
                    <li key={idx} className={styles.parentPoint}>
                      <span className={styles.parentNum}>{idx + 1}</span>
                      <span className={styles.parentText}>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  )
}
