import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useLang } from '../contexts/LangContext'
import { LanguageToggle } from '../components/LanguageToggle'
import type { UniversityPlan } from '../types'
import styles from './PlanPage.module.css'

// Mock data — replace with API call
const MOCK_PLAN: UniversityPlan = {
  universityId: '1',
  overview:
    "You have ~18 months until the application deadline. That's enough time to prepare well.",
  documents: [
    { name: 'Transcript', howToGet: 'Request from your school registrar', urgency: 'high' },
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
  ],
  tests: [{ name: 'IELTS', prepTime: '3–4 months', startBy: 'September 2025' }],
  applicationSteps: [
    'Create an account on the university application portal',
    'Fill in the personal information form',
    'Upload all required documents',
    'Pay the application fee ($30)',
    'Submit and await confirmation email',
    'Attend online interview if invited',
  ],
  monthlyTasks: [
    { id: 't1', month: 'March 2025', title: 'Research IELTS test centres near you', done: false },
    {
      id: 't2',
      month: 'March 2025',
      title: 'Request your official transcript from school',
      done: false,
    },
    { id: 't3', month: 'April 2025', title: 'Start IELTS preparation course', done: false },
    { id: 't4', month: 'May 2025', title: 'Ask teachers for recommendation letters', done: false },
    { id: 't5', month: 'June 2025', title: 'Draft your motivation letter', done: false },
    { id: 't6', month: 'July 2025', title: 'Take IELTS exam', done: false },
    { id: 't7', month: 'August 2025', title: 'Finalize and review all documents', done: false },
    {
      id: 't8',
      month: 'September 2025',
      title: 'Create portal account and start application',
      done: false,
    },
    { id: 't9', month: 'October 2025', title: 'Submit complete application', done: false },
  ],
  parentTalkingPoints: [
    'Charles University is one of the oldest and most respected universities in Central Europe, founded in 1348.',
    'The program is taught in English and tuition is only $3,500/year — far less than private universities in the region.',
    'Czech Republic is an EU country with strong safety standards and a stable economy.',
  ],
}

const urgencyColors = {
  high: styles.urgencyHigh,
  medium: styles.urgencyMed,
  low: styles.urgencyLow,
}
const urgencyLabels = {
  high: { ru: 'Срочно', en: 'Urgent' },
  medium: { ru: 'Важно', en: 'Important' },
  low: { ru: 'Позже', en: 'Later' },
}

export function PlanPage() {
  const { id } = useParams<{ id: string }>()
  const { lang } = useLang()
  const navigate = useNavigate()
  const [tasks, setTasks] = useState(MOCK_PLAN.monthlyTasks)
  const [activeSection, setActiveSection] = useState<string | null>(null)

  const toggleTask = (taskId: string) => {
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, done: !t.done } : t)))
  }

  const toggleSection = (s: string) => setActiveSection((prev) => (prev === s ? null : s))

  const months = [...new Set(tasks.map((t) => t.month))]
  const completedCount = tasks.filter((t) => t.done).length
  const totalCount = tasks.length

  const t = {
    back: lang === 'ru' ? '← Назад' : '← Back',
    overview: lang === 'ru' ? 'Обзор' : 'Overview',
    docs: lang === 'ru' ? 'Документы' : 'Documents needed',
    tests: lang === 'ru' ? 'Тесты' : 'Tests',
    steps: lang === 'ru' ? 'Как подавать' : 'How to apply',
    monthly: lang === 'ru' ? 'Твой план по месяцам' : 'Your monthly plan',
    parents: lang === 'ru' ? 'Как объяснить родителям' : 'Talking to your parents',
    progress:
      lang === 'ru'
        ? `${completedCount} из ${totalCount} выполнено`
        : `${completedCount} of ${totalCount} done`,
    how: lang === 'ru' ? 'Как получить' : 'How to get it',
    urgency: lang === 'ru' ? 'Приоритет' : 'Priority',
    prepTime: lang === 'ru' ? 'Время подготовки' : 'Prep time',
    startBy: lang === 'ru' ? 'Начать до' : 'Start by',
  }

  void id // used via MOCK_PLAN for now

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <div className={styles.topBarLeft}>
          <button className={styles.backBtn} onClick={() => navigate('/shortlist')}>
            {t.back}
          </button>
        </div>
        <LanguageToggle />
      </div>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.uniName}>Charles University</h1>
          <p className={styles.programLine}>Computer Science · Prague, Czech Republic</p>
          <p className={styles.overviewLine}>{MOCK_PLAN.overview}</p>
        </div>

        {/* Documents */}
        <section className={styles.section}>
          <button className={styles.sectionToggle} onClick={() => toggleSection('docs')}>
            <span className={styles.sectionTitle}>{t.docs}</span>
            <span className={styles.sectionCaret}>{activeSection === 'docs' ? '▲' : '▼'}</span>
          </button>
          {activeSection === 'docs' && (
            <div className={styles.sectionBody}>
              {MOCK_PLAN.documents.map((doc) => (
                <div key={doc.name} className={styles.docRow}>
                  <div className={styles.docInfo}>
                    <span className={styles.docName}>{doc.name}</span>
                    <span className={styles.docHow}>{doc.howToGet}</span>
                  </div>
                  <span className={`${styles.urgencyBadge} ${urgencyColors[doc.urgency]}`}>
                    {urgencyLabels[doc.urgency][lang]}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Tests */}
        <section className={styles.section}>
          <button className={styles.sectionToggle} onClick={() => toggleSection('tests')}>
            <span className={styles.sectionTitle}>{t.tests}</span>
            <span className={styles.sectionCaret}>{activeSection === 'tests' ? '▲' : '▼'}</span>
          </button>
          {activeSection === 'tests' && (
            <div className={styles.sectionBody}>
              {MOCK_PLAN.tests.map((test) => (
                <div key={test.name} className={styles.testRow}>
                  <span className={styles.testName}>{test.name}</span>
                  <div className={styles.testMeta}>
                    <span>
                      {t.prepTime}: <strong>{test.prepTime}</strong>
                    </span>
                    <span>
                      {t.startBy}: <strong>{test.startBy}</strong>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* How to apply */}
        <section className={styles.section}>
          <button className={styles.sectionToggle} onClick={() => toggleSection('steps')}>
            <span className={styles.sectionTitle}>{t.steps}</span>
            <span className={styles.sectionCaret}>{activeSection === 'steps' ? '▲' : '▼'}</span>
          </button>
          {activeSection === 'steps' && (
            <div className={styles.sectionBody}>
              <ol className={styles.stepsList}>
                {MOCK_PLAN.applicationSteps.map((step, idx) => (
                  <li key={idx} className={styles.stepItem}>
                    <span className={styles.stepNum}>{idx + 1}</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </section>

        {/* Monthly tasks */}
        <section className={styles.section}>
          <button className={styles.sectionToggle} onClick={() => toggleSection('monthly')}>
            <span className={styles.sectionTitle}>{t.monthly}</span>
            <span className={styles.sectionProgress}>{t.progress}</span>
            <span className={styles.sectionCaret}>{activeSection === 'monthly' ? '▲' : '▼'}</span>
          </button>
          {activeSection === 'monthly' && (
            <div className={styles.sectionBody}>
              {months.map((month) => (
                <div key={month} className={styles.monthGroup}>
                  <h4 className={styles.monthLabel}>{month}</h4>
                  {tasks
                    .filter((task) => task.month === month)
                    .map((task) => (
                      <label key={task.id} className={styles.taskRow}>
                        <input
                          type="checkbox"
                          checked={task.done}
                          onChange={() => toggleTask(task.id)}
                          className={styles.checkbox}
                        />
                        <span className={task.done ? styles.taskDone : styles.taskTitle}>
                          {task.title}
                        </span>
                      </label>
                    ))}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Parent talking points */}
        <section className={styles.section}>
          <button className={styles.sectionToggle} onClick={() => toggleSection('parents')}>
            <span className={styles.sectionTitle}>{t.parents}</span>
            <span className={styles.sectionCaret}>{activeSection === 'parents' ? '▲' : '▼'}</span>
          </button>
          {activeSection === 'parents' && (
            <div className={styles.sectionBody}>
              <ul className={styles.parentList}>
                {MOCK_PLAN.parentTalkingPoints.map((point, idx) => (
                  <li key={idx} className={styles.parentPoint}>
                    {point}
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
