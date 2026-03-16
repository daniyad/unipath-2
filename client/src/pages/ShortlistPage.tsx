import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { LanguageToggle } from '../components/LanguageToggle'
import { MOCK_UNIVERSITIES } from '../data/universities'
import type { University } from '../types'
import styles from './ShortlistPage.module.css'

const levelColors: Record<University['level'], string> = {
  Reach: 'chip-amber',
  Match: '',
  Safety: 'chip-success',
}

export function ShortlistPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [expanded, setExpanded] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleRegenerate = () => {
    setLoading(true)
    setTimeout(() => setLoading(false), 2000)
  }

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <span className={styles.logo}>Unipath</span>
        <LanguageToggle />
      </div>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.heading}>{t('shortlist.heading')}</h1>
          <p className={styles.summary}>{t('shortlist.summary')}</p>
        </div>
        <div className={styles.list}>
          {MOCK_UNIVERSITIES.map((uni) => {
            const isExpanded = expanded === uni.id
            return (
              <div key={uni.id} className={styles.card}>
                <div className={styles.cardTop}>
                  <div className={styles.cardMeta}>
                    <span className={`chip ${levelColors[uni.level]}`}>
                      {t(`shortlist.levels.${uni.level}`)}
                    </span>
                    <span className={styles.location}>
                      {uni.city}, {uni.country}
                    </span>
                  </div>
                  <h2 className={styles.uniName}>{uni.name}</h2>
                  <p className={styles.program}>{uni.program}</p>
                  <div className={styles.cardRow}>
                    <span className={styles.detail}>{uni.language}</span>
                    <span className={styles.detail}>
                      {uni.tuition === 0
                        ? t('shortlist.tuitionFree')
                        : `$${uni.tuition.toLocaleString()}${t('shortlist.perYear')}`}
                    </span>
                  </div>
                  <p className={styles.whyFit}>{uni.whyFit}</p>
                </div>
                {isExpanded && (
                  <div className={styles.expandedSection}>
                    {uni.scholarshipInfo && (
                      <div className={styles.infoRow}>
                        <span className={styles.infoLabel}>{t('shortlist.scholarship')}</span>
                        <span className={styles.infoValue}>{uni.scholarshipInfo}</span>
                      </div>
                    )}
                    {uni.deadline && (
                      <div className={styles.infoRow}>
                        <span className={styles.infoLabel}>{t('shortlist.deadline')}</span>
                        <span className={styles.infoValue}>{uni.deadline}</span>
                      </div>
                    )}
                    {uni.insiderTip && (
                      <div className={styles.infoRow}>
                        <span className={styles.infoLabel}>{t('shortlist.tip')}</span>
                        <span className={styles.infoValue}>{uni.insiderTip}</span>
                      </div>
                    )}
                  </div>
                )}
                <div className={styles.cardActions}>
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => setExpanded(isExpanded ? null : uni.id)}
                  >
                    {isExpanded ? t('shortlist.less') : t('shortlist.more')}
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => navigate(`/university/${uni.id}`)}
                  >
                    {t('shortlist.viewUni')}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
        <div className={styles.footer}>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={handleRegenerate}
            disabled={loading}
          >
            {loading ? t('shortlist.regenerating') : t('shortlist.regenerate')}
          </button>
        </div>
      </div>
    </div>
  )
}
