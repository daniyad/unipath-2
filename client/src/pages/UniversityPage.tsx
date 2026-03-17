import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { LanguageToggle } from '../components/LanguageToggle'
import { MOCK_UNIVERSITIES } from '../data/universities'
import type { University } from '../types'
import styles from './UniversityPage.module.css'

const levelColors: Record<University['level'], string> = {
  Reach: 'chip-amber',
  Match: '',
  Safety: 'chip-success',
}

export function UniversityPage() {
  const { id } = useParams<{ id: string }>()
  const { t } = useTranslation()
  const navigate = useNavigate()

  const uni = MOCK_UNIVERSITIES.find((u) => u.id === id)

  if (!uni) {
    return (
      <div className={styles.page}>
        <p>University not found.</p>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <div className={styles.topBarLeft}>
          <button className={styles.backBtn} onClick={() => navigate('/dashboard')}>
            {t('university.back')}
          </button>
        </div>
        <LanguageToggle />
      </div>

      <div className={styles.container}>
        {/* Header */}
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

        {/* Why this fits */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>{t('university.whyFit')}</h2>
          <p className={styles.sectionText}>{uni.whyFit}</p>
        </section>

        {/* Scholarships */}
        {uni.scholarshipInfo && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>{t('university.scholarship')}</h2>
            <p className={styles.sectionText}>{uni.scholarshipInfo}</p>
          </section>
        )}

        {/* Insider tip */}
        {uni.insiderTip && (
          <section className={`${styles.section} ${styles.tipSection}`}>
            <h2 className={styles.sectionTitle}>{t('university.tip')}</h2>
            <p className={styles.sectionText}>{uni.insiderTip}</p>
          </section>
        )}

        {/* Action */}
        <div className={styles.action}>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => navigate(`/plan/${uni.id}`)}
          >
            {uni.hasPlan ? t('university.viewPlan') : t('university.generatePlan')}
          </button>
        </div>
      </div>
    </div>
  )
}
