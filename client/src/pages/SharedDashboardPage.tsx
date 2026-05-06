import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import type { SharedDashboardData, SharedUniversityData } from '../types'
import styles from './SharedDashboardPage.module.css'

const fetchSharedDashboard = async (token: string): Promise<SharedDashboardData> => {
  const res = await fetch(`/api/share/${token}`)
  if (res.status === 404) throw new Error('not_found')
  if (!res.ok) throw new Error('server_error')
  const json = (await res.json()) as { success: boolean; data: SharedDashboardData }
  return json.data
}

const fmtTuition = (usd: number) => (usd > 0 ? `$${usd.toLocaleString()}/yr` : null)

const fmtDeadline = (deadline: string) => {
  if (!deadline) return null
  try {
    return new Date(deadline).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  } catch {
    return deadline
  }
}

const LEVEL_LABELS: Record<string, string> = {
  Reach: 'Reach',
  Match: 'Match',
  Safety: 'Safety',
}

function UniCard({ uni }: { uni: SharedUniversityData }) {
  const pct = uni.totalTasks > 0 ? Math.round((uni.completedTasks / uni.totalTasks) * 100) : 0
  const deadline = fmtDeadline(uni.deadline)
  const tuition = fmtTuition(uni.tuition)

  const levelClass =
    uni.level === 'Reach'
      ? styles.levelReach
      : uni.level === 'Safety'
        ? styles.levelSafety
        : styles.levelMatch

  return (
    <div className={styles.uniCard}>
      <div className={styles.cardTop}>
        <span className={`${styles.levelBadge} ${levelClass}`}>{LEVEL_LABELS[uni.level]}</span>
        {deadline && <span className={styles.deadline}>{deadline}</span>}
      </div>

      <div className={styles.uniName}>{uni.universityName}</div>
      <div className={styles.uniMeta}>
        {[uni.program, uni.country].filter(Boolean).join(' · ')}
        {uni.language && (
          <span className={styles.uniMetaSecondary}>
            {' '}
            · {uni.language}
            {tuition && ` · ${tuition}`}
          </span>
        )}
      </div>

      {uni.totalTasks > 0 && (
        <div className={styles.progressRow}>
          <div className={styles.progressTrack}>
            <div className={styles.progressFill} style={{ width: `${pct}%` }} />
          </div>
          <div className={styles.progressLabel}>
            <span>
              {uni.completedTasks} of {uni.totalTasks} tasks done
            </span>
            <span>{pct}%</span>
          </div>
        </div>
      )}

      {uni.dueThisWeek > 0 && (
        <div className={styles.dueThisWeek}>
          <span className={styles.dueThisWeekBold}>{uni.dueThisWeek}</span>{' '}
          {uni.dueThisWeek === 1 ? 'task' : 'tasks'} due this week
        </div>
      )}
    </div>
  )
}

export function SharedDashboardPage() {
  const { token } = useParams<{ token: string }>()
  const [data, setData] = useState<SharedDashboardData | null>(null)
  const [error, setError] = useState<'not_found' | 'server_error' | null>(null)

  useEffect(() => {
    if (!token) {
      setError('not_found')
      return
    }
    fetchSharedDashboard(token)
      .then(setData)
      .catch((err: Error) => {
        setError(err.message === 'not_found' ? 'not_found' : 'server_error')
      })
  }, [token])

  if (!data && !error) {
    return <div className={styles.loading}>Loading…</div>
  }

  if (error) {
    return (
      <div className={styles.errorPage}>
        <div className={styles.errorTitle}>
          {error === 'not_found' ? 'Link not found' : 'Something went wrong'}
        </div>
        <div className={styles.errorSub}>
          {error === 'not_found'
            ? 'This link has been revoked or no longer exists.'
            : 'Please try again later.'}
        </div>
      </div>
    )
  }

  const { student, summary, universities } = data!

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <header className={styles.header}>
          <div className={styles.eyebrow}>Shared via UniPath</div>
          <h1 className={styles.name}>{student.firstName}&apos;s University Journey</h1>
        </header>

        {summary && (
          <section className={styles.summarySection}>
            <div className={styles.summaryCard}>
              <p className={styles.summaryText}>{summary}</p>
            </div>
          </section>
        )}

        {universities.length > 0 && (
          <section>
            <div className={styles.sectionTitle}>Universities</div>
            <div className={styles.uniGrid}>
              {universities.map((uni) => (
                <UniCard key={uni.universityName} uni={uni} />
              ))}
            </div>
          </section>
        )}
      </div>

      <footer className={styles.footer}>
        <div className={styles.container}>
          Built with <strong>UniPath</strong> — AI university counselor for Central Asian students
        </div>
      </footer>
    </div>
  )
}
