import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../contexts/AuthContext'
import { useProfile } from '../contexts/ProfileContext'
import { LanguageToggle } from './LanguageToggle'
import styles from './Navbar.module.css'

interface NavbarProps {
  showBack?: boolean
  showProfileActions?: boolean
}

export function Navbar({ showBack, showProfileActions }: NavbarProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { profile } = useProfile()

  const logoTarget = user ? '/dashboard' : '/login'
  const initial = (profile?.name?.[0] ?? user?.email?.[0] ?? '?').toUpperCase()

  return (
    <nav className={styles.navbar}>
      <div className={styles.left}>
        {showBack && (
          <>
            <button className={styles.backBtn} onClick={() => navigate(-1)}>
              {t('nav.back')}
            </button>
            <div className={styles.separator} />
          </>
        )}
        <button className={styles.logo} onClick={() => navigate(logoTarget)}>
          Unipath
        </button>
      </div>
      <div className={styles.right}>
        <LanguageToggle />
        {showProfileActions && (
          <>
            <button className={styles.profileBtn} onClick={() => navigate('/profile')}>
              <span className={styles.avatar}>{initial}</span>
              <span className={styles.profileName}>{profile?.name ?? user?.email}</span>
            </button>
            <button className={styles.logoutBtn} onClick={logout}>
              {t('dashboard.logout')}
            </button>
          </>
        )}
      </div>
    </nav>
  )
}
