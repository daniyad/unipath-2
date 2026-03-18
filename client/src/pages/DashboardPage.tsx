import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useProfile } from '../contexts/ProfileContext'
import { Navbar } from '../components/Navbar'
import { MOCK_UNIVERSITIES } from '../data/universities'
import styles from './DashboardPage.module.css'

const levelColors: Record<string, string> = {
  Reach: 'chip-amber',
  Match: '',
  Safety: 'chip-success',
}

export function DashboardPage() {
  const { profile } = useProfile()
  const { t } = useTranslation()
  const navigate = useNavigate()

  const name = profile?.name ?? t('dashboard.nameFallback')

  return (
    <div className={styles.page}>
      <Navbar showProfileActions />

      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.greeting}>{t('dashboard.greeting', { name })}</h1>
          <p className={styles.subtitle}>{t('dashboard.subtitle')}</p>
        </div>

        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>{t('dashboard.yourUnis')}</h2>
          <p className={styles.sectionSummary}>{t('dashboard.uniSummary')}</p>
        </div>

        <div className={styles.uniList}>
          {MOCK_UNIVERSITIES.map((uni) => (
            <div
              key={uni.id}
              className={styles.uniCard}
              onClick={() => navigate(`/university/${uni.id}`)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && navigate(`/university/${uni.id}`)}
            >
              <div className={styles.uniCardLeft}>
                <div className={styles.uniCardTop}>
                  <span className={`chip ${levelColors[uni.level]}`}>
                    {t(`shortlist.levels.${uni.level}`)}
                  </span>
                  {uni.hasPlan && (
                    <span className="chip chip-success">{t('dashboard.hasPlan')}</span>
                  )}
                </div>
                <p className={styles.uniName}>{uni.name}</p>
                <p className={styles.uniProgram}>
                  {uni.program} · {uni.city}, {uni.country}
                </p>
                <p className={styles.uniWhyFit}>{uni.whyFit}</p>
                {uni.hasPlan &&
                  uni.tasksCompleted !== undefined &&
                  uni.tasksTotal !== undefined && (
                    <>
                      <div className={styles.progressBar}>
                        <div
                          className={styles.progressFill}
                          style={{ width: `${(uni.tasksCompleted / uni.tasksTotal) * 100}%` }}
                        />
                      </div>
                      <p className={styles.taskCount}>
                        {t('dashboard.tasks', { done: uni.tasksCompleted, total: uni.tasksTotal })}
                      </p>
                    </>
                  )}
              </div>
              <span className={styles.uniArrow}>→</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
