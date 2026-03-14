import { useLang } from '../contexts/LangContext'
import styles from './LanguageToggle.module.css'

export function LanguageToggle() {
  const { lang, setLang } = useLang()

  return (
    <div className={styles.toggle}>
      <button
        className={lang === 'ru' ? styles.active : styles.option}
        onClick={() => setLang('ru')}
        aria-pressed={lang === 'ru'}
      >
        RU
      </button>
      <button
        className={lang === 'en' ? styles.active : styles.option}
        onClick={() => setLang('en')}
        aria-pressed={lang === 'en'}
      >
        EN
      </button>
    </div>
  )
}
