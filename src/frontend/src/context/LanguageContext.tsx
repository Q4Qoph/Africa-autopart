import { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import i18n from '@/i18n'

export type Language = 'en' | 'fr' // add 'ar' here when Arabic ships

const STORAGE_KEY = 'aa-language'

interface LanguageContextValue {
  language: Language
  setLanguage: (lang: Language) => void
}

const LanguageContext = createContext<LanguageContextValue>({
  language: 'en',
  setLanguage: () => {},
})

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(
    () => (localStorage.getItem(STORAGE_KEY) as Language) ?? 'en',
  )

  function setLanguage(lang: Language) {
    localStorage.setItem(STORAGE_KEY, lang)
    setLanguageState(lang)
    i18n.changeLanguage(lang)
    // RTL support: when 'ar' is added, this handles it automatically
    document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr')
    document.documentElement.setAttribute('lang', lang)
  }

  useEffect(() => {
    // Sync document attributes on mount
    document.documentElement.setAttribute('dir', language === 'ar' ? 'rtl' : 'ltr')
    document.documentElement.setAttribute('lang', language)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  return useContext(LanguageContext)
}
