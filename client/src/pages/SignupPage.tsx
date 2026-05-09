import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Eye, EyeOff, Check } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { Navbar } from '../components/Navbar'
import styles from './AuthPage.module.css'

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M17.64 9.2045c0-.6381-.0573-1.2518-.1636-1.8409H9v3.4814h4.8436c-.2086 1.125-.8427 2.0782-1.7959 2.7164v2.2581h2.9087c1.7018-1.5668 2.6836-3.874 2.6836-6.615z"
        fill="#4285F4"
      />
      <path
        d="M9 18c2.43 0 4.4673-.8059 5.9564-2.1805l-2.9087-2.2581c-.8059.54-1.8368.859-3.0477.859-2.344 0-4.3282-1.5836-5.036-3.7104H.9574v2.3318C2.4382 15.9832 5.4818 18 9 18z"
        fill="#34A853"
      />
      <path
        d="M3.964 10.71c-.18-.54-.2827-1.1168-.2827-1.71s.1027-1.17.2827-1.71V4.9582H.9573C.3477 6.1732 0 7.5477 0 9s.3477 2.8268.9573 4.0418L3.964 10.71z"
        fill="#FBBC05"
      />
      <path
        d="M9 3.5795c1.3214 0 2.5077.4541 3.4405 1.346l2.5813-2.5814C13.4632.8918 11.4259 0 9 0 5.4818 0 2.4382 2.0168.9573 4.9582L3.964 7.29C4.6718 5.1632 6.656 3.5795 9 3.5795z"
        fill="#EA4335"
      />
    </svg>
  )
}

function checkPassword(p: string) {
  return {
    length: p.length >= 8,
    number: /\d/.test(p),
    letter: /[a-zA-Z]/.test(p),
  }
}

export function SignupPage() {
  const { signup, loginWithGoogle } = useAuth()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  const hints = checkPassword(password)
  const passwordValid = hints.length && hints.number && hints.letter

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!passwordValid) return
    setError('')
    setLoading(true)
    try {
      await signup(email, password)
      navigate('/setup')
    } catch (err) {
      const msg = err instanceof Error ? err.message : ''
      if (msg.includes('User already registered')) {
        setError(t('signup.emailExists'))
      } else {
        setError(t('signup.error'))
      }
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = async () => {
    setError('')
    setGoogleLoading(true)
    try {
      await loginWithGoogle()
    } catch {
      setError(t('signup.error'))
      setGoogleLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      <Navbar />
      <div className={styles.card}>
        <h1 className={styles.title}>{t('signup.title')}</h1>
        <p className={styles.subtitle}>{t('signup.subtitle')}</p>
        {error && <div className={styles.error}>{error}</div>}

        <button
          type="button"
          className={styles.googleBtn}
          onClick={handleGoogle}
          disabled={googleLoading || loading}
        >
          <GoogleIcon />
          {t('signup.continueWithGoogle')}
        </button>

        <div className={styles.divider}>{t('signup.orContinueWith')}</div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="email">
              {t('signup.email')}
            </label>
            <input
              id="email"
              type="email"
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="password">
              {t('signup.password')}
            </label>
            <div className={styles.passwordInputWrap}>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                className="input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
              <button
                type="button"
                className={styles.passwordToggle}
                onClick={() => setShowPassword((v) => !v)}
                tabIndex={-1}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {password.length > 0 && (
              <div className={styles.passwordHints}>
                <span className={`${styles.hint} ${hints.length ? styles.hintMet : ''}`}>
                  <Check size={12} />
                  {t('signup.passwordHintLength')}
                </span>
                <span className={`${styles.hint} ${hints.number ? styles.hintMet : ''}`}>
                  <Check size={12} />
                  {t('signup.passwordHintNumber')}
                </span>
                <span className={`${styles.hint} ${hints.letter ? styles.hintMet : ''}`}>
                  <Check size={12} />
                  {t('signup.passwordHintLetter')}
                </span>
              </div>
            )}
          </div>
          <button
            type="submit"
            className={`btn btn-primary ${styles.submitBtn}`}
            disabled={loading || googleLoading || !passwordValid}
          >
            {loading ? '...' : t('signup.submit')}
          </button>
        </form>
        <p className={styles.footer}>
          {t('signup.hasAccount')} <Link to="/login">{t('signup.login')}</Link>
        </p>
      </div>
    </div>
  )
}
