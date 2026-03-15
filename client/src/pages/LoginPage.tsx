import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { LanguageToggle } from '../components/LanguageToggle'
import { useLang } from '../contexts/LangContext'
import styles from './AuthPage.module.css'

const t = {
  ru: {
    title: 'Добро пожаловать',
    subtitle: 'Войдите, чтобы продолжить',
    email: 'Email',
    password: 'Пароль',
    submit: 'Войти',
    noAccount: 'Нет аккаунта?',
    signup: 'Зарегистрироваться',
    error: 'Что-то пошло не так. Попробуй ещё раз?',
  },
  en: {
    title: 'Welcome back',
    subtitle: 'Sign in to continue',
    email: 'Email',
    password: 'Password',
    submit: 'Sign in',
    noAccount: "Don't have an account?",
    signup: 'Sign up',
    error: 'Something went wrong. Try again?',
  },
}

export function LoginPage() {
  const { login } = useAuth()
  const { lang } = useLang()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const copy = t[lang]

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email)
      navigate('/dashboard')
    } catch {
      setError(copy.error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <span className={styles.logo}>Unipath</span>
        <LanguageToggle />
      </div>
      <div className={styles.card}>
        <h1 className={styles.title}>{copy.title}</h1>
        <p className={styles.subtitle}>{copy.subtitle}</p>
        {error && <div className={styles.error}>{error}</div>}
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="email">
              {copy.email}
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
              {copy.password}
            </label>
            <input
              id="password"
              type="password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>
          <button
            type="submit"
            className={`btn btn-primary ${styles.submitBtn}`}
            disabled={loading}
          >
            {loading ? '...' : copy.submit}
          </button>
        </form>
        <p className={styles.footer}>
          {copy.noAccount} <Link to="/signup">{copy.signup}</Link>
        </p>
      </div>
    </div>
  )
}
