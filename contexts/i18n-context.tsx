'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { 
  Locale, 
  TranslationDictionary,
  getTranslationsForLocale,
  getNestedTranslation,
  interpolate 
} from '@/lib/i18n-sanity'

interface I18nContextType {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: string, values?: Record<string, string | number>) => string
  isLoading: boolean
}

const I18nContext = createContext<I18nContextType | undefined>(undefined)

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('es')
  const [translations, setTranslations] = useState<TranslationDictionary>({})
  const [isLoading, setIsLoading] = useState(true)

  // Cargar traducciones desde Sanity
  useEffect(() => {
    async function loadTranslations() {
      setIsLoading(true)
      try {
        const dictionary = await getTranslationsForLocale(locale)
        setTranslations(dictionary)
      } catch (error) {
        console.error('Error loading translations:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadTranslations()
  }, [locale])

  // Detectar idioma guardado o del navegador al montar
  useEffect(() => {
    const savedLocale = localStorage.getItem('locale') as Locale
    if (savedLocale && ['es', 'en', 'fr'].includes(savedLocale)) {
      setLocaleState(savedLocale)
    } else {
      // Detectar idioma del navegador
      const browserLang = navigator.language.split('-')[0]
      if (browserLang === 'es' || browserLang === 'en' || browserLang === 'fr') {
        setLocaleState(browserLang as Locale)
      }
    }
  }, [])

  const setLocale = async (newLocale: Locale) => {
    console.log('[i18n-context] Cambiando locale de', locale, 'a', newLocale)
    setLocaleState(newLocale)
    localStorage.setItem('locale', newLocale)
    
    // Recargar traducciones para el nuevo idioma
    setIsLoading(true)
    try {
      console.log('[i18n-context] Solicitando traducciones para', newLocale)
      const dictionary = await getTranslationsForLocale(newLocale)
      console.log('[i18n-context] Traducciones recibidas:', Object.keys(dictionary).length, 'keys')
      setTranslations(dictionary)
    } catch (error) {
      console.error('[i18n-context] Error loading translations:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const t = (key: string, values?: Record<string, string | number>): string => {
    const translation = getNestedTranslation(translations, key)
    
    if (values) {
      return interpolate(translation, values)
    }
    
    return translation
  }

  return (
    <I18nContext.Provider value={{ locale, setLocale, t, isLoading }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useTranslation() {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error('useTranslation must be used within I18nProvider')
  }
  return context
}
