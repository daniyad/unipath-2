import { useNavigate, useLocation } from 'react-router-dom'
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
  const location = useLocation()
  const { user, logout } = useAuth()
  const { profile } = useProfile()

  const logoTarget = user ? '/dashboard' : '/login'
  const initial = (profile?.name?.[0] ?? user?.email?.[0] ?? '?').toUpperCase()

  const isActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(path + '/')

  return (
    <div className={styles.navbarOuter}>
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

        {showProfileActions && (
          <div className={styles.links}>
            <button
              className={`${styles.link} ${isActive('/dashboard') || isActive('/university') ? styles.linkActive : ''}`}
              onClick={() => navigate('/dashboard')}
            >
              {t('nav.universities')}
            </button>
            <button
              className={`${styles.link} ${isActive('/profile') ? styles.linkActive : ''}`}
              onClick={() => navigate('/profile')}
            >
              {t('nav.profile')}
            </button>
          </div>
        )}

        <div className={styles.right}>
          <LanguageToggle />
          {showProfileActions && (
            <>
              <button className={styles.profileBtn} onClick={() => navigate('/profile')}>
                <span className={styles.avatar}>{initial}</span>
              </button>
              <button className={styles.logoutBtn} onClick={logout}>
                {t('dashboard.logout')}
              </button>
            </>
          )}
        </div>
      </nav>
    </div>
  )
}
