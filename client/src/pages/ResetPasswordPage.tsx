import { useState, useEffect, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Eye, EyeOff, Check } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { Navbar } from '../components/Navbar'
import styles from './AuthPage.module.css'

function checkPassword(p: string) {
  return {
    length: p.length >= 8,
    number: /\d/.test(p),
    letter: /[a-zA-Z]/.test(p),
  }
}

export function ResetPasswordPage() {
  const { updatePassword } = useAuth()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [ready, setReady] = useState(false)
  const [invalid, setInvalid] = useState(false)
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setReady(true)
      }
    })

    // Also handle if user already has a recovery session loaded
    void supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        setReady(true)
      } else {
        // Give onAuthStateChange a moment to fire before showing invalid
        const timer = setTimeout(() => setInvalid(true), 1500)
        return () => clearTimeout(timer)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const hints = checkPassword(password)
  const passwordValid = hints.length && hints.number && hints.letter

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!passwordValid) return
    if (password !== confirm) {
      setError(t('resetPassword.passwordMismatch'))
      return
    }
    setError('')
    setLoading(true)
    try {
      await updatePassword(password)
      navigate('/dashboard')
    } catch {
      setError(t('resetPassword.error'))
    } finally {
      setLoading(false)
    }
  }

  if (invalid) {
    return (
      <div className={styles.page}>
        <Navbar />
        <div className={styles.card}>
          <div className={styles.error}>{t('resetPassword.invalidLink')}</div>
          <p className={styles.footer}>
            <a href="/login">{t('forgotPassword.backToLogin')}</a>
          </p>
        </div>
      </div>
    )
  }

  if (!ready) {
    return (
      <div className={styles.page}>
        <Navbar />
        <div className={styles.card}>
          <p className={styles.subtitle}>...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <Navbar />
      <div className={styles.card}>
        <h1 className={styles.title}>{t('resetPassword.title')}</h1>
        <p className={styles.subtitle}>{t('resetPassword.subtitle')}</p>
        {error && <div className={styles.error}>{error}</div>}
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="password">
              {t('resetPassword.newPassword')}
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
          <div className={styles.field}>
            <label className={styles.label} htmlFor="confirm">
              {t('resetPassword.confirmPassword')}
            </label>
            <div className={styles.passwordInputWrap}>
              <input
                id="confirm"
                type={showConfirm ? 'text' : 'password'}
                className="input"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                autoComplete="new-password"
              />
              <button
                type="button"
                className={styles.passwordToggle}
                onClick={() => setShowConfirm((v) => !v)}
                tabIndex={-1}
                aria-label={showConfirm ? 'Hide password' : 'Show password'}
              >
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <button
            type="submit"
            className={`btn btn-primary ${styles.submitBtn}`}
            disabled={loading || !passwordValid}
          >
            {loading ? t('resetPassword.updating') : t('resetPassword.submit')}
          </button>
        </form>
      </div>
    </div>
  )
}
