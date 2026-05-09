import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../contexts/AuthContext'
import { Navbar } from '../components/Navbar'
import styles from './AuthPage.module.css'

export function ForgotPasswordPage() {
  const { resetPasswordForEmail } = useAuth()
  const { t } = useTranslation()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await resetPasswordForEmail(email)
      setSuccess(true)
    } catch {
      setError(t('forgotPassword.error'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      <Navbar />
      <div className={styles.card}>
        <h1 className={styles.title}>{t('forgotPassword.title')}</h1>
        <p className={styles.subtitle}>{t('forgotPassword.subtitle')}</p>
        {error && <div className={styles.error}>{error}</div>}
        {success ? (
          <div className={styles.successMsg}>{t('forgotPassword.success')}</div>
        ) : (
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="email">
                {t('forgotPassword.email')}
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
            <button
              type="submit"
              className={`btn btn-primary ${styles.submitBtn}`}
              disabled={loading}
            >
              {loading ? t('forgotPassword.sending') : t('forgotPassword.submit')}
            </button>
          </form>
        )}
        <p className={styles.footer}>
          <Link to="/login">{t('forgotPassword.backToLogin')}</Link>
        </p>
      </div>
    </div>
  )
}
