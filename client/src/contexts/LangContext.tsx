import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import i18n from '../i18n'
import type { Lang } from '../types'

interface LangContextValue {
  lang: Lang
  setLang: (l: Lang) => void
}

const LangContext = createContext<LangContextValue | null>(null)

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('ru')

  useEffect(() => {
    const stored = localStorage.getItem('unipath_lang') as Lang | null
    if (stored === 'ru' || stored === 'en') setLangState(stored)
  }, [])

  const setLang = (l: Lang) => {
    localStorage.setItem('unipath_lang', l)
    setLangState(l)
    void i18n.changeLanguage(l)
  }

  return <LangContext.Provider value={{ lang, setLang }}>{children}</LangContext.Provider>
}

export function useLang() {
  const ctx = useContext(LangContext)
  if (!ctx) throw new Error('useLang must be used inside LangProvider')
  return ctx
}
