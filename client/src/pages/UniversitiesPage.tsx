import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useProfile } from '../contexts/ProfileContext'
import { useApi } from '../contexts/ApiContext'
import { Navbar } from '../components/Navbar'
import { AiGeneratingOverlay } from '../components/AiGeneratingOverlay'
import type { University, ServerUniversity, ServerPlan } from '../types'
import { toClientUniversity } from '../types'
import styles from './UniversitiesPage.module.css'

const levelColors: Record<string, string> = {
  Reach: 'chip-amber',
  Match: '',
  Safety: 'chip-success',
  Unlikely: 'chip-danger',
}

export function UniversitiesPage() {
  const { profile, hasStaleRecommendations } = useProfile()
  const api = useApi()
  const { t } = useTranslation()
  const navigate = useNavigate()

  const [universities, setUniversities] = useState<University[]>([])
  const [serverUniversities, setServerUniversities] = useState<ServerUniversity[]>([])
  const [loading, setLoading] = useState(true)
  const [regenerating, setRegenerating] = useState(false)

  const loadShortlists = async () => {
    try {
      const shortlists = await api.getShortlists()
      const plans = await api.getPlans()

      if (shortlists.length > 0) {
        const latest = shortlists[0]

        const planMap = new Map<string, ServerPlan>(plans.map((p) => [p.university_name, p]))

        const clientUnis = latest.universities.map((su) => {
          const plan = planMap.get(su.name)
          const completedCount = plan
            ? Object.values(plan.task_completions).filter(Boolean).length
            : undefined
          const totalCount = plan
            ? plan.plan.monthlyChecklist.reduce((acc, m) => acc + m.tasks.length, 0)
            : undefined
          const uni = toClientUniversity(su, plan?.id)
          return { ...uni, tasksCompleted: completedCount, tasksTotal: totalCount }
        })

        setUniversities(clientUnis)
        setServerUniversities(latest.universities)
      }
    } catch (err) {
      console.error('Failed to load shortlists:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadShortlists()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Stale banner and regeneration intentionally hidden — re-enable when UX is finalized
  void hasStaleRecommendations

  const handleRegenerate = async () => {
    if (!profile) return
    setRegenerating(true)
    try {
      await api.generateShortlist(profile)
      await loadShortlists()
    } catch (err) {
      console.error('Failed to regenerate:', err)
    } finally {
      setRegenerating(false)
    }
  }
  void handleRegenerate

  const handleUniClick = (uni: University, serverUni: ServerUniversity) => {
    navigate(`/university/${uni.id}`, { state: { university: uni, serverUniversity: serverUni } })
  }

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
      <AiGeneratingOverlay
        visible={regenerating}
        messages={[
          'Researching universities...',
          'Checking scholarships...',
          'Building your shortlist...',
        ]}
      />
      <Navbar showProfileActions />

      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.greeting}>{t('dashboard.yourUnis')}</h1>
          <p className={styles.subtitle}>{t('dashboard.uniSummary')}</p>
        </div>

        {universities.length === 0 ? (
          <div className={styles.emptyState}>
            <p className={styles.emptyTitle}>{t('dashboard.noRecommendationsTitle')}</p>
            <p className={styles.emptyText}>{t('dashboard.noRecommendationsText')}</p>
            <button type="button" className="btn btn-primary" onClick={() => navigate('/setup')}>
              {t('dashboard.completeProfile')}
            </button>
          </div>
        ) : (
          <div className={styles.uniList}>
            {universities.map((uni, i) => (
              <div
                key={uni.id}
                className={styles.uniCard}
                onClick={() => handleUniClick(uni, serverUniversities[i])}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && handleUniClick(uni, serverUniversities[i])}
              >
                <div className={styles.uniCardLeft}>
                  <div className={styles.uniCardTop}>
                    <span className={`chip ${levelColors[uni.level]}`}>
                      {t(`shortlist.levels.${uni.level}`)}
                    </span>
                    {uni.hasPlan && (
                      <span className="chip chip-success">{t('universities.interested')}</span>
                    )}
                  </div>
                  <p className={styles.uniName}>{uni.name}</p>
                  <p className={styles.uniProgram}>
                    {uni.program} · {uni.city}, {uni.country}
                  </p>
                  <p className={styles.uniWhyFit}>{uni.whyFit}</p>
                </div>
                <span className={styles.uniArrow}>→</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
