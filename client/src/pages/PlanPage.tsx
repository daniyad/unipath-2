import { useState, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Navbar } from '../components/Navbar'
import type { UniversityPlan } from '../types'
import styles from './PlanPage.module.css'

// Mock data — replace with API call
const MOCK_PLAN: UniversityPlan = {
  universityId: '1',
  overview:
    "You have ~18 months until the application deadline. That's enough time to prepare well.",
  portalUrl: 'https://is.cuni.cz/studium/eng/prijimacky/',
  applicationDeadline: '2026-02-28',
  tuition: 3500,
  level: 'Match',
  documents: [
    {
      name: 'Official Transcript',
      howToGet: 'Request from your school registrar',
      urgency: 'high',
    },
    {
      name: 'Passport copy',
      howToGet: 'Make a colour copy of your current passport',
      urgency: 'medium',
    },
    {
      name: 'Motivation letter',
      howToGet: 'Write yourself — we can help you outline it',
      urgency: 'high',
    },
    {
      name: 'Recommendation letters',
      howToGet: 'Ask 2 teachers who know you well',
      urgency: 'medium',
    },
    {
      name: 'IELTS certificate',
      howToGet: 'Obtained after passing the IELTS exam',
      urgency: 'high',
    },
    { name: 'CV / Résumé', howToGet: 'Prepare a 1-page academic CV', urgency: 'low' },
  ],
  tests: [{ name: 'IELTS', prepTime: '3–4 months', startBy: 'September 2025' }],
  monthlyTasks: [
    {
      id: 't1',
      month: 'March 2025',
      week: 1,
      title: 'Research IELTS test centres near you',
      done: false,
    },
    {
      id: 't2',
      month: 'March 2025',
      week: 2,
      title: 'Request official transcript from school',
      done: false,
    },
    {
      id: 't3',
      month: 'April 2025',
      week: 1,
      title: 'Register for IELTS preparation course',
      done: false,
    },
    { id: 't4', month: 'April 2025', week: 3, title: 'Book your IELTS exam date', done: false },
    {
      id: 't5',
      month: 'May 2025',
      week: 2,
      title: 'Ask teachers for recommendation letters',
      done: false,
    },
    { id: 't6', month: 'June 2025', week: 1, title: 'Draft your motivation letter', done: false },
    {
      id: 't7',
      month: 'June 2025',
      week: 3,
      title: 'Get feedback on motivation letter draft',
      done: false,
    },
    { id: 't8', month: 'July 2025', week: 2, title: 'Take IELTS exam', done: false },
    {
      id: 't9',
      month: 'August 2025',
      week: 1,
      title: 'Collect and finalize all documents',
      done: false,
    },
    {
      id: 't10',
      month: 'August 2025',
      week: 3,
      title: 'Review full application package',
      done: false,
    },
    {
      id: 't11',
      month: 'September 2025',
      week: 1,
      title: 'Create account on the university portal',
      done: false,
    },
    {
      id: 't12',
      month: 'September 2025',
      week: 2,
      title: 'Fill in personal information on the portal',
      done: false,
    },
    {
      id: 't13',
      month: 'September 2025',
      week: 3,
      title: 'Upload all documents to the portal',
      done: false,
    },
    {
      id: 't14',
      month: 'October 2025',
      week: 1,
      title: 'Pay the application fee ($30)',
      done: false,
    },
    {
      id: 't15',
      month: 'October 2025',
      week: 2,
      title: 'Submit complete application',
      done: false,
    },
    {
      id: 't16',
      month: 'November 2025',
      week: 1,
      title: 'Attend online interview if invited',
      done: false,
    },
  ],
  parentTalkingPoints: [
    'Charles University is one of the oldest and most respected universities in Central Europe, founded in 1348.',
    'The program is taught in English and tuition is only $3,500/year — far less than private universities in the region.',
    'Czech Republic is an EU country with strong safety standards and a stable economy.',
  ],
}

const urgencyStyles: Record<string, string> = {
  high: styles.urgencyHigh,
  medium: styles.urgencyMed,
  low: styles.urgencyLow,
}

export function PlanPage() {
  const { id } = useParams<{ id: string }>()
  const { t } = useTranslation()
  const [tasks, setTasks] = useState(MOCK_PLAN.monthlyTasks)
  const [docsDone, setDocsDone] = useState<Set<string>>(new Set())
  const [parentsOpen, setParentsOpen] = useState(false)

  const toggleTask = (taskId: string) => {
    setTasks((prev) =>
      prev.map((task) => (task.id === taskId ? { ...task, done: !task.done } : task)),
    )
  }

  const toggleDoc = (name: string) => {
    setDocsDone((prev) => {
      const next = new Set(prev)
      if (next.has(name)) next.delete(name)
      else next.add(name)
      return next
    })
  }

  const months = useMemo(() => [...new Set(MOCK_PLAN.monthlyTasks.map((t) => t.month))], [])
  const completedCount = tasks.filter((t) => t.done).length
  const totalCount = tasks.length
  const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0
  const focusTasks = tasks.filter((t) => !t.done).slice(0, 3)

  const daysUntilDeadline = useMemo(() => {
    const deadline = new Date(MOCK_PLAN.applicationDeadline)
    const today = new Date()
    return Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  }, [])

  const formattedDeadline = useMemo(
    () =>
      new Date(MOCK_PLAN.applicationDeadline).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
    [],
  )

  void id

  return (
    <div className={styles.page}>
      <Navbar showBack />

      <div className={styles.container}>
        {/* ── Header ── */}
        <div className={styles.header}>
          <h1 className={styles.uniName}>Charles University</h1>
          <p className={styles.programLine}>
            Computer Science · Prague, Czech Republic ·{' '}
            <a
              href={MOCK_PLAN.portalUrl}
              className={styles.portalLink}
              target="_blank"
              rel="noopener noreferrer"
            >
              {t('plan.portal')} ↗
            </a>
          </p>
          <p className={styles.headerMeta}>
            {t('plan.deadline')}: {formattedDeadline}
            {daysUntilDeadline > 0 && ` · ${t('plan.daysLeft', { days: daysUntilDeadline })}`}
            {' · '}
            {t('plan.tuition')}: ${MOCK_PLAN.tuition.toLocaleString()}/yr
          </p>
        </div>

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
                    onChange={() => toggleTask(task.id)}
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
                  const monthTasks = tasks.filter((t) => t.month === month)
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
                          onChange={() => toggleTask(task.id)}
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
                {MOCK_PLAN.documents.map((doc) => (
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
        <section className={styles.tableSection}>
          <h2 className={styles.sectionHeading}>{t('plan.testsRequired')}</h2>
          <div className={styles.testsGrid}>
            {MOCK_PLAN.tests.map((test) => (
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

        {/* ── Parent talking points (collapsible) ── */}
        <section className={styles.section}>
          <button className={styles.sectionToggle} onClick={() => setParentsOpen((v) => !v)}>
            <span className={styles.sectionTitle}>{t('plan.parents')}</span>
            <span className={styles.sectionCaret}>{parentsOpen ? '▲' : '▼'}</span>
          </button>
          {parentsOpen && (
            <div className={styles.sectionBody}>
              <ul className={styles.parentList}>
                {MOCK_PLAN.parentTalkingPoints.map((point, idx) => (
                  <li key={idx} className={styles.parentPoint}>
                    <span className={styles.parentNum}>{idx + 1}</span>
                    <span className={styles.parentText}>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
