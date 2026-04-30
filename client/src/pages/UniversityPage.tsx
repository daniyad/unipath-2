import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useProfile } from '../contexts/ProfileContext'
import { useApi } from '../contexts/ApiContext'
import { Navbar } from '../components/Navbar'
import { AiGeneratingOverlay } from '../components/AiGeneratingOverlay'
import type { University, ServerUniversity } from '../types'
import styles from './UniversityPage.module.css'

const levelColors: Record<University['level'], string> = {
  Reach: 'chip-amber',
  Match: '',
  Safety: 'chip-success',
}

interface LocationState {
  university: University
  serverUniversity: ServerUniversity
}

export function UniversityPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const { profile } = useProfile()
  const api = useApi()

  const state = location.state as LocationState | null
  const uni = state?.university
  const serverUni = state?.serverUniversity

  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')

  if (!uni || !serverUni) {
    return (
      <div className={styles.page}>
        <Navbar showProfileActions />
        <div className={styles.container}>
          <p style={{ color: 'var(--color-muted)' }}>
            University not found. Please go back to the{' '}
            <button type="button" className="btn btn-ghost" onClick={() => navigate('/dashboard')}>
              dashboard
            </button>
            .
          </p>
        </div>
      </div>
    )
  }

  const handlePlanAction = async () => {
    if (uni.hasPlan && uni.planId) {
      navigate(`/plan/${uni.planId}`, { state: { university: uni } })
      return
    }
    setGenerating(true)
    setError('')
    try {
      const result = await api.generatePlan(profile ?? {}, serverUni)
      navigate(`/plan/${result.id}`, { state: { university: uni } })
    } catch {
      setError('Something went wrong generating your plan. Try again.')
      setGenerating(false)
    }
  }

  return (
    <div className={styles.page}>
      <AiGeneratingOverlay
        visible={generating}
        messages={[
          'Checking application requirements...',
          'Building your timeline...',
          'Almost done...',
        ]}
      />
      <Navbar showProfileActions />

      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.headerMeta}>
            <span className={`chip ${levelColors[uni.level]}`}>
              {t(`university.levels.${uni.level}`)}
            </span>
            <span className={styles.location}>
              {uni.city}, {uni.country}
            </span>
          </div>
          <h1 className={styles.uniName}>{uni.name}</h1>
          <p className={styles.program}>{uni.program}</p>
          <div className={styles.statsRow}>
            <div className={styles.stat}>
              <span className={styles.statValue}>
                {uni.tuition === 0
                  ? t('university.tuitionFree')
                  : `$${uni.tuition.toLocaleString()}${t('university.perYear')}`}
              </span>
              <span className={styles.statLabel}>Tuition</span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.stat}>
              <span className={styles.statValue}>{uni.language}</span>
              <span className={styles.statLabel}>Language</span>
            </div>
            {uni.deadline && (
              <>
                <div className={styles.statDivider} />
                <div className={styles.stat}>
                  <span className={styles.statValue}>{uni.deadline}</span>
                  <span className={styles.statLabel}>{t('university.deadline')}</span>
                </div>
              </>
            )}
          </div>
        </div>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>{t('university.whyFit')}</h2>
          <p className={styles.sectionText}>{uni.whyFit}</p>
        </section>

        {uni.scholarshipInfo && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>{t('university.scholarship')}</h2>
            <p className={styles.sectionText}>{uni.scholarshipInfo}</p>
          </section>
        )}

        {uni.insiderTip && (
          <section className={`${styles.section} ${styles.tipSection}`}>
            <h2 className={styles.sectionTitle}>{t('university.tip')}</h2>
            <p className={styles.sectionText}>{uni.insiderTip}</p>
          </section>
        )}

        {error && (
          <p style={{ color: 'red', fontSize: 'var(--text-sm)', marginBottom: 12 }}>{error}</p>
        )}

        <div className={styles.action}>
          <button
            type="button"
            className={`btn ${uni.hasPlan ? 'btn-primary' : 'btn-yellow'}`}
            onClick={() => void handlePlanAction()}
            disabled={generating}
          >
            {uni.hasPlan ? t('university.viewPlan') : t('university.generatePlan')}
          </button>
        </div>
      </div>
    </div>
  )
}
