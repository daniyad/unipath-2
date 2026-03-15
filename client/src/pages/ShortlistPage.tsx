import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLang } from '../contexts/LangContext'
import { LanguageToggle } from '../components/LanguageToggle'
import type { University } from '../types'
import styles from './ShortlistPage.module.css'

// Mock data — replace with API call
const MOCK_UNIVERSITIES: University[] = [
  {
    id: '1',
    name: 'Charles University',
    program: 'Computer Science',
    city: 'Prague',
    country: 'Czech Republic',
    language: 'English',
    tuition: 3500,
    level: 'Match',
    whyFit: 'Strong STEM faculty, affordable tuition, and a vibrant international community.',
    scholarshipInfo: 'Government scholarships available for Central Asian students.',
    deadline: 'March 31, 2026',
    insiderTip: 'Apply early — the international quota fills up fast.',
  },
  {
    id: '2',
    name: 'RWTH Aachen',
    program: 'Mechanical Engineering',
    city: 'Aachen',
    country: 'Germany',
    language: 'English / German',
    tuition: 0,
    level: 'Reach',
    whyFit: 'Top-ranked engineering school in Europe with no tuition fees — rare.',
    scholarshipInfo: 'DAAD scholarships open to international students.',
    deadline: 'July 15, 2026',
    insiderTip: 'German language B1 helps a lot, even if the program is in English.',
  },
  {
    id: '3',
    name: 'Budapest University of Technology',
    program: 'Information Technology',
    city: 'Budapest',
    country: 'Hungary',
    language: 'English',
    tuition: 4800,
    level: 'Safety',
    whyFit:
      'Solid program, easy visa process, and Budapest is one of the best student cities in Europe.',
    scholarshipInfo: 'Stipendium Hungaricum fully funds tuition + monthly stipend.',
    deadline: 'January 15, 2026',
    insiderTip: 'The Stipendium Hungaricum deadline is in January — mark your calendar.',
  },
]

const levelColors: Record<University['level'], string> = {
  Reach: 'chip-amber',
  Match: '',
  Safety: 'chip-success',
}

const levelLabels: Record<University['level'], { ru: string; en: string }> = {
  Reach: { ru: 'Амбициозный', en: 'Reach' },
  Match: { ru: 'Подходящий', en: 'Match' },
  Safety: { ru: 'Надёжный', en: 'Safety' },
}

export function ShortlistPage() {
  const { lang } = useLang()
  const navigate = useNavigate()
  const [expanded, setExpanded] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const t = {
    heading: lang === 'ru' ? 'Твои университеты' : 'Your universities',
    summary:
      lang === 'ru'
        ? 'На основе твоего профиля мы подобрали три варианта — от амбициозного до надёжного. Каждый — реальный шанс.'
        : 'Based on your profile, we picked three options — from ambitious to reliable. Each one is a real shot.',
    buildPlan: lang === 'ru' ? 'Составить план' : 'Build a plan',
    regenerate: lang === 'ru' ? 'Попробовать другие' : 'Try different ones',
    regenerating: lang === 'ru' ? 'Ищем...' : 'Searching...',
    more: lang === 'ru' ? 'Подробнее' : 'More details',
    less: lang === 'ru' ? 'Свернуть' : 'Less',
    scholarship: lang === 'ru' ? 'Стипендии' : 'Scholarships',
    deadline: lang === 'ru' ? 'Дедлайн' : 'Deadline',
    tip: lang === 'ru' ? 'Совет' : 'Tip',
    tuitionFree: lang === 'ru' ? 'Бесплатно' : 'Free',
    per_year: lang === 'ru' ? '/год' : '/yr',
  }

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
          <h1 className={styles.heading}>{t.heading}</h1>
          <p className={styles.summary}>{t.summary}</p>
        </div>
        <div className={styles.list}>
          {MOCK_UNIVERSITIES.map((uni) => {
            const isExpanded = expanded === uni.id
            return (
              <div key={uni.id} className={styles.card}>
                <div className={styles.cardTop}>
                  <div className={styles.cardMeta}>
                    <span className={`chip ${levelColors[uni.level]}`}>
                      {levelLabels[uni.level][lang]}
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
                        ? t.tuitionFree
                        : `$${uni.tuition.toLocaleString()}${t.per_year}`}
                    </span>
                  </div>
                  <p className={styles.whyFit}>{uni.whyFit}</p>
                </div>
                {isExpanded && (
                  <div className={styles.expandedSection}>
                    {uni.scholarshipInfo && (
                      <div className={styles.infoRow}>
                        <span className={styles.infoLabel}>{t.scholarship}</span>
                        <span className={styles.infoValue}>{uni.scholarshipInfo}</span>
                      </div>
                    )}
                    {uni.deadline && (
                      <div className={styles.infoRow}>
                        <span className={styles.infoLabel}>{t.deadline}</span>
                        <span className={styles.infoValue}>{uni.deadline}</span>
                      </div>
                    )}
                    {uni.insiderTip && (
                      <div className={styles.infoRow}>
                        <span className={styles.infoLabel}>{t.tip}</span>
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
                    {isExpanded ? t.less : t.more}
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => navigate(`/plan/${uni.id}`)}
                  >
                    {t.buildPlan}
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
            {loading ? t.regenerating : t.regenerate}
          </button>
        </div>
      </div>
    </div>
  )
}
