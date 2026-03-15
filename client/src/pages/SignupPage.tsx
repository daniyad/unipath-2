import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { LanguageToggle } from '../components/LanguageToggle'
import { useLang } from '../contexts/LangContext'
import styles from './AuthPage.module.css'

const t = {
  ru: {
    title: 'Создай аккаунт',
    subtitle: 'Начни свой путь в университет',
    email: 'Email',
    password: 'Пароль',
    submit: 'Зарегистрироваться',
    hasAccount: 'Уже есть аккаунт?',
    login: 'Войти',
    error: 'Что-то пошло не так. Попробуй ещё раз?',
  },
  en: {
    title: 'Create your account',
    subtitle: 'Start your path to university',
    email: 'Email',
    password: 'Password',
    submit: 'Sign up',
    hasAccount: 'Already have an account?',
    login: 'Sign in',
    error: 'Something went wrong. Try again?',
  },
}

export function SignupPage() {
  const { signup } = useAuth()
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
      await signup(email)
      navigate('/profile')
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
              autoComplete="new-password"
              minLength={8}
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
          {copy.hasAccount} <Link to="/login">{copy.login}</Link>
        </p>
      </div>
    </div>
  )
}
