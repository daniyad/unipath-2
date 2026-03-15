import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useProfile } from '../contexts/ProfileContext'
import { useLang } from '../contexts/LangContext'
import { LanguageToggle } from '../components/LanguageToggle'
import styles from './DashboardPage.module.css'

const MOCK_UNIS = [
  {
    id: '1',
    name: 'Charles University',
    program: 'Computer Science',
    country: 'Czech Republic',
    hasPlan: true,
    tasksCompleted: 2,
    tasksTotal: 9,
  },
  {
    id: '2',
    name: 'RWTH Aachen',
    program: 'Mechanical Engineering',
    country: 'Germany',
    hasPlan: false,
    tasksCompleted: 0,
    tasksTotal: 0,
  },
  {
    id: '3',
    name: 'Budapest University of Technology',
    program: 'Information Technology',
    country: 'Hungary',
    hasPlan: false,
    tasksCompleted: 0,
    tasksTotal: 0,
  },
]

export function DashboardPage() {
  const { user, logout } = useAuth()
  const { profile } = useProfile()
  const { lang } = useLang()
  const navigate = useNavigate()

  const t = {
    greeting:
      lang === 'ru' ? `Привет, ${profile?.name ?? 'студент'}` : `Hey, ${profile?.name ?? 'there'}`,
    subtitle: lang === 'ru' ? 'Вот где ты сейчас:' : "Here's where you left off:",
    yourUnis: lang === 'ru' ? 'Твои университеты' : 'Your universities',
    buildPlan: lang === 'ru' ? 'Составить план' : 'Build plan',
    viewPlan: lang === 'ru' ? 'Открыть план' : 'View plan',
    hasPlan: lang === 'ru' ? 'Есть план' : 'Plan ready',
    noPlan: lang === 'ru' ? 'План не составлен' : 'No plan yet',
    tasks: (done: number, total: number) =>
      lang === 'ru' ? `${done} из ${total} задач выполнено` : `${done} of ${total} tasks done`,
    editProfile: lang === 'ru' ? 'Изменить профиль' : 'Edit profile',
    logout: lang === 'ru' ? 'Выйти' : 'Sign out',
    nudge: (name: string) =>
      lang === 'ru'
        ? `Ты ещё не составил(а) план для ${name}`
        : `You haven't built a plan for ${name} yet`,
  }

  const unisNoPlan = MOCK_UNIS.filter((u) => !u.hasPlan)
  const nudge = unisNoPlan[0] ? t.nudge(unisNoPlan[0].name) : null

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <span className={styles.logo}>Unipath</span>
        <div className={styles.topBarRight}>
          <LanguageToggle />
          <button className={styles.logoutBtn} onClick={logout}>
            {t.logout}
          </button>
        </div>
      </div>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.greeting}>{t.greeting}</h1>
          <p className={styles.subtitle}>{t.subtitle}</p>
          {nudge && <div className={styles.nudge}>{nudge}</div>}
        </div>

        <div className={styles.profileCard}>
          <div className={styles.avatar}>
            {profile?.name?.[0]?.toUpperCase() ?? user?.email?.[0]?.toUpperCase() ?? '?'}
          </div>
          <div className={styles.profileInfo}>
            <span className={styles.profileName}>{profile?.name ?? user?.email}</span>
            <span className={styles.profileMeta}>
              {profile?.country ?? ''}
              {profile?.grade ? `, ${profile.grade}${lang === 'ru' ? ' класс' : 'th grade'}` : ''}
            </span>
          </div>
          <button className="btn btn-ghost" onClick={() => navigate('/profile')}>
            {t.editProfile}
          </button>
        </div>

        <h2 className={styles.sectionTitle}>{t.yourUnis}</h2>
        <div className={styles.uniList}>
          {MOCK_UNIS.map((uni) => (
            <div key={uni.id} className={styles.uniCard}>
              <div className={styles.uniCardLeft}>
                <div className={styles.uniCardTop}>
                  <span className={`chip ${uni.hasPlan ? 'chip-success' : ''}`}>
                    {uni.hasPlan ? t.hasPlan : t.noPlan}
                  </span>
                </div>
                <p className={styles.uniName}>{uni.name}</p>
                <p className={styles.uniProgram}>
                  {uni.program} · {uni.country}
                </p>
                {uni.hasPlan && (
                  <div className={styles.progressBar}>
                    <div
                      className={styles.progressFill}
                      style={{ width: `${(uni.tasksCompleted / uni.tasksTotal) * 100}%` }}
                    />
                  </div>
                )}
                {uni.hasPlan && (
                  <p className={styles.taskCount}>{t.tasks(uni.tasksCompleted, uni.tasksTotal)}</p>
                )}
              </div>
              <button
                className={`btn ${uni.hasPlan ? 'btn-ghost' : 'btn-primary'}`}
                onClick={() => navigate(`/plan/${uni.id}`)}
              >
                {uni.hasPlan ? t.viewPlan : t.buildPlan}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
