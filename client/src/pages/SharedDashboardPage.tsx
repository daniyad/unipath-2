import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useLang } from '../contexts/LangContext'
import { LanguageToggle } from '../components/LanguageToggle'
import type { SharedDashboardData, SharedUniversityData, WeekTaskShareData } from '../types'
import styles from './SharedDashboardPage.module.css'

// ── Bilingual copy ─────────────────────────────────────────────────────────────

const COPY = {
  en: {
    sharedByPre: 'Shared by ',
    readOnly: 'View only',
    readOnlyHint: (name: string) => `You can see ${name}'s progress, but not change anything.`,
    eyebrow: (name: string) => `${name}'s university plan`,
    heroTitle1: "Here's where ",
    heroTitle2: ' is at',
    heroSub: 'Real numbers from the actual applications — updated as the work progresses.',
    statApps: 'Applications',
    statTasks: 'Tasks done',
    statNext: 'Next deadline',
    days: 'days',
    sUnis: 'The shortlist',
    sWeek: 'This week',
    sCost: 'What it would cost',
    sCostMeta: 'Tuition only — living costs not included',
    sHelp: 'How you can help right now',
    sHelpSub: 'Three small things that would actually move things forward this week.',
    sHelpTitle: 'Three things that would help',
    uDeadline: 'Deadline',
    uTasks: 'tasks',
    uOf: 'of',
    reach: 'Reach',
    match: 'Match',
    safety: 'Safety',
    free: 'Free',
    perYear: '/yr',
    totalIfAll: 'If the most expensive choice is made',
    footLogo: 'Unipath',
    footAbout: 'What is Unipath?',
    rEyebrow: 'Link no longer active',
    rTitle: 'This link has been revoked',
    rBody:
      "Sharing was turned off for this link. Ask for a new one if you'd like to keep following along.",
    rWhat: 'What is Unipath?',
    urgentLabel: 'Urgent',
    importantLabel: 'Important',
    laterLabel: 'Later',
    loading: 'Loading…',
  },
  ru: {
    sharedByPre: 'Поделился(-ась) ',
    readOnly: 'Только просмотр',
    readOnlyHint: (name: string) => `Ты видишь прогресс ${name}, но изменить ничего не можешь.`,
    eyebrow: (name: string) => `Университетский план ${name}`,
    heroTitle1: 'Вот где сейчас ',
    heroTitle2: '',
    heroSub: 'Настоящие цифры из реальных заявок — обновляются по мере работы.',
    statApps: 'Заявок',
    statTasks: 'Задач сделано',
    statNext: 'Ближайший дедлайн',
    days: 'дн.',
    sUnis: 'Шорт-лист',
    sWeek: 'На этой неделе',
    sCost: 'Сколько это будет стоить',
    sCostMeta: 'Только обучение — без расходов на жизнь',
    sHelp: 'Как ты можешь помочь прямо сейчас',
    sHelpSub: 'Три маленьких дела, которые реально сдвинут вперёд на этой неделе.',
    sHelpTitle: 'Три способа помочь сейчас',
    uDeadline: 'Дедлайн',
    uTasks: 'задач',
    uOf: 'из',
    reach: 'Амбиция',
    match: 'Реалистично',
    safety: 'Надёжно',
    free: 'Бесплатно',
    perYear: '/год',
    totalIfAll: 'Если выбрать самый дорогой вариант',
    footLogo: 'Unipath',
    footAbout: 'Что такое Unipath?',
    rEyebrow: 'Ссылка отключена',
    rTitle: 'Эта ссылка отозвана',
    rBody:
      'Доступ по этой ссылке был отключён. Попроси новую, если хочешь продолжать следить за прогрессом.',
    rWhat: 'Что такое Unipath?',
    urgentLabel: 'Срочно',
    importantLabel: 'Важно',
    laterLabel: 'Позже',
    loading: 'Загрузка…',
  },
}

// ── Fetch helper ───────────────────────────────────────────────────────────────

const fetchSharedDashboard = async (token: string): Promise<SharedDashboardData> => {
  const res = await fetch(`/api/share/${token}`)
  if (res.status === 404) throw new Error('not_found')
  if (!res.ok) throw new Error('server_error')
  const json = (await res.json()) as { success: boolean; data: SharedDashboardData }
  return json.data
}

// ── Helpers ────────────────────────────────────────────────────────────────────

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

const fmtTuition = (usd: number) => (usd > 0 ? `$${usd.toLocaleString()}` : null)

// ── Sub-components ─────────────────────────────────────────────────────────────

function LevelChip({ level, t }: { level: string; t: typeof COPY.en }) {
  const map: Record<string, { cls: string; label: string }> = {
    Reach: { cls: 'chip chip-amber', label: t.reach },
    Match: { cls: 'chip', label: t.match },
    Safety: { cls: 'chip chip-success', label: t.safety },
  }
  const item = map[level] ?? map.Match!
  return <span className={item.cls}>{item.label}</span>
}

function UniCard({ uni, t }: { uni: SharedUniversityData; t: typeof COPY.en }) {
  const pct = uni.totalTasks > 0 ? Math.round((uni.completedTasks / uni.totalTasks) * 100) : 0
  const deadline = fmtDeadline(uni.deadline)

  return (
    <div className={styles.uniCard}>
      <div className={styles.uniCardTop}>
        <div className={styles.uniCardId}>
          <div className={styles.uniName}>{uni.universityName}</div>
          <div className={styles.uniProg}>
            {uni.program}
            {uni.program && uni.country && <span className={styles.dot}> · </span>}
            {uni.country}
          </div>
        </div>
        <LevelChip level={uni.level} t={t} />
      </div>

      {uni.hasPlan && uni.totalTasks > 0 && (
        <div className={styles.uniProgress}>
          <div className={styles.uniProgRow}>
            <span>
              {uni.completedTasks} {t.uOf} {uni.totalTasks} {t.uTasks}
            </span>
            <span className={styles.uniPct}>{pct}%</span>
          </div>
          <div className={styles.uniTrack}>
            <div className={styles.uniTrackFill} style={{ width: `${pct}%` }} />
          </div>
        </div>
      )}

      {deadline && (
        <div className={styles.uniFooter}>
          <div className={styles.uniFootCell}>
            <span className={styles.uniFootLabel}>{t.uDeadline}</span>
            <span className={styles.uniFootVal}>{deadline}</span>
          </div>
        </div>
      )}
    </div>
  )
}

function UrgencyBadge({
  urgency,
  t,
}: {
  urgency: WeekTaskShareData['urgency']
  t: typeof COPY.en
}) {
  if (urgency === 'urgent') {
    return <span className={`${styles.weekUrgBadge} ${styles.weekUrgHigh}`}>{t.urgentLabel}</span>
  }
  if (urgency === 'important') {
    return <span className={`${styles.weekUrgBadge} ${styles.weekUrgMed}`}>{t.importantLabel}</span>
  }
  return <span className={`${styles.weekUrgBadge} ${styles.weekUrgLow}`}>{t.laterLabel}</span>
}

// ── Revoked state ──────────────────────────────────────────────────────────────

function RevokedView({ t }: { t: typeof COPY.en }) {
  return (
    <div className={styles.revokedStage}>
      <div className={styles.revokedCard}>
        <div className={styles.revokedMark}>⊘</div>
        <div className={styles.revokedEyebrow}>{t.rEyebrow}</div>
        <h1 className={styles.revokedTitle}>{t.rTitle}</h1>
        <p className={styles.revokedBody}>{t.rBody}</p>
        <div className={styles.revokedCta}>
          <a href="https://unipath.app" target="_blank" rel="noopener noreferrer">
            {t.rWhat} ↗
          </a>
        </div>
      </div>
    </div>
  )
}

// ── Viewer state ───────────────────────────────────────────────────────────────

function ViewerPage({ data, t }: { data: SharedDashboardData; t: typeof COPY.en }) {
  const name = data.student.firstName
  const initial = name[0]?.toUpperCase() ?? '?'
  const { settings, universities, weekTasks, helpItems } = data

  const totalTasks = universities.reduce((s, u) => s + u.totalTasks, 0)
  const doneTasks = universities.reduce((s, u) => s + u.completedTasks, 0)
  const nextDaysLeft = universities
    .filter((u) => u.deadline)
    .map((u) => {
      try {
        const d = new Date(u.deadline)
        return Math.ceil((d.getTime() - Date.now()) / 86_400_000)
      } catch {
        return Infinity
      }
    })
    .filter((d) => d > 0)
    .sort((a, b) => a - b)[0]

  const displayedHelpItems =
    helpItems && helpItems.length > 0
      ? helpItems
      : [
          'Ask about the nearest upcoming deadline and how you can help prepare',
          'Offer to help with paperwork — translations, notarizations, or printing take time',
          "Just ask how it's going — not about grades, but about the process itself",
        ]

  return (
    <div className={styles.viewerPage}>
      {/* Floating capsule navbar */}
      <div className={styles.viewerNavOuter}>
        <nav className={styles.viewerNav}>
          <div className={styles.navLeft}>
            <span className={styles.navLogo}>Unipath</span>
            <span className={styles.navSep} />
            <span className={styles.navSharedPill}>
              <span className={styles.navAvatar}>{initial}</span>
              <span className={styles.navSharedText}>
                {t.sharedByPre}
                <strong>{name}</strong>
              </span>
            </span>
          </div>
          <div className={styles.navRight}>
            <LanguageToggle />
            <span className={styles.navReadOnly}>{t.readOnly}</span>
          </div>
        </nav>
      </div>

      {/* Main column */}
      <div className={styles.viewerCol}>
        {/* Hero */}
        <section className={styles.hero}>
          <div className={styles.heroEyebrow}>{t.eyebrow(name)}</div>
          <h1 className={styles.heroTitle}>
            {t.heroTitle1}
            <span className={styles.yellowMark}>{name}</span>
            {t.heroTitle2}
          </h1>
          <p className={styles.heroSub}>{t.heroSub}</p>
        </section>

        {/* Stats strip */}
        <div className={styles.statsStrip}>
          <div className={styles.stat}>
            <span className={styles.statValue}>{universities.length}</span>
            <span className={styles.statLabel}>{t.statApps}</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statValue}>
              {doneTasks}
              <span className={styles.statAccent}>/{totalTasks}</span>
            </span>
            <span className={styles.statLabel}>{t.statTasks}</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statValue}>
              {nextDaysLeft !== undefined ? (
                <>
                  <span className={styles.statAccentYellow}>{nextDaysLeft}</span>
                  <span className={styles.statAccent}> {t.days}</span>
                </>
              ) : (
                '—'
              )}
            </span>
            <span className={styles.statLabel}>{t.statNext}</span>
          </div>
        </div>

        {/* Universities */}
        {universities.length > 0 && (
          <section className={styles.section}>
            <div className={styles.sectionHead}>
              <h2 className={styles.sectionTitle}>{t.sUnis}</h2>
            </div>
            <div className={styles.uniList}>
              {universities.map((u) => (
                <UniCard key={u.universityName} uni={u} t={t} />
              ))}
            </div>
          </section>
        )}

        {/* This week */}
        {weekTasks && weekTasks.length > 0 && (
          <section className={styles.section}>
            <div className={styles.sectionHead}>
              <h2 className={styles.sectionTitle}>{t.sWeek}</h2>
            </div>
            <div className={styles.weekCard}>
              {weekTasks.map((task, i) => (
                <div key={i} className={styles.weekRow}>
                  <div className={styles.weekTask}>
                    <span className={styles.weekTaskTitle}>{task.title}</span>
                    <span className={styles.weekTaskMeta}>
                      {task.uniName} · <UrgencyBadge urgency={task.urgency} t={t} />
                    </span>
                  </div>
                  <div className={styles.weekDue}>
                    <div>{task.dueLabel}</div>
                    <div className={styles.weekDueSub}>{task.dueShort}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* How you can help */}
        <div className={styles.helpCard}>
          <div className={styles.helpEyebrow}>{t.sHelp}</div>
          <div className={styles.helpTitle}>{t.sHelpTitle}</div>
          <p className={styles.helpSub}>{t.sHelpSub}</p>
          <div className={styles.helpList}>
            {displayedHelpItems.map((item, i) => (
              <div key={i} className={styles.helpItem}>
                <span className={styles.helpNum}>0{i + 1}</span>
                <div className={styles.helpBody}>
                  <div className={styles.helpBodyTitle}>{item}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tuition (conditional) */}
        {settings.showTuition && universities.some((u) => u.tuition > 0 || u.hasPlan) && (
          <section className={styles.section}>
            <div className={styles.sectionHead}>
              <h2 className={styles.sectionTitle}>{t.sCost}</h2>
              <span className={styles.sectionMeta}>{t.sCostMeta}</span>
            </div>
            <div className={styles.costCard}>
              {universities.map((u) => {
                const amount = fmtTuition(u.tuition)
                return (
                  <div key={u.universityName} className={styles.costRow}>
                    <div>
                      <div className={styles.costName}>{u.universityName}</div>
                      {u.country && <div className={styles.costMeta}>{u.country}</div>}
                    </div>
                    {amount ? (
                      <div className={styles.costAmount}>
                        {amount}
                        <span className={styles.costUnit}>{t.perYear}</span>
                      </div>
                    ) : (
                      <div className={`${styles.costAmount} ${styles.costAmountFree}`}>
                        {t.free}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* Footer */}
        <div className={styles.viewerFoot}>
          <div className={styles.viewerFootLogo}>{t.footLogo}</div>
          <div>
            <a
              href="https://unipath.app"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.viewerFootLink}
            >
              {t.footAbout} ↗
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Main export ────────────────────────────────────────────────────────────────

export function SharedDashboardPage() {
  const { token } = useParams<{ token: string }>()
  const { lang } = useLang()
  const [data, setData] = useState<SharedDashboardData | null>(null)
  const [error, setError] = useState<'not_found' | 'server_error' | null>(null)

  const t = lang === 'ru' ? COPY.ru : COPY.en

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
    return <div className={styles.loading}>{t.loading}</div>
  }

  if (error === 'not_found') {
    return <RevokedView t={t} />
  }

  if (error === 'server_error') {
    return (
      <div className={styles.revokedStage}>
        <div className={styles.revokedCard}>
          <div className={styles.revokedMark}>!</div>
          <div className={styles.revokedEyebrow}>Something went wrong</div>
          <h1 className={styles.revokedTitle}>Could not load this page</h1>
          <p className={styles.revokedBody}>Please try again later.</p>
        </div>
      </div>
    )
  }

  return <ViewerPage data={data!} t={t} />
}
