'use client'

import { useTranslation } from '@/contexts/i18n-context'
import { Locale } from '@/lib/i18n-sanity'
import { useState } from 'react'

const localeFlags: Record<Locale, string> = {
  es: '🇪🇸',
  en: '🇬🇧',
  fr: '🇫🇷',
}

const localeNames: Record<Locale, string> = {
  es: 'Español',
  en: 'English',
  fr: 'Français',
}

export function LanguageSwitcher() {
  const { locale, setLocale, isLoading } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)

  const handleLanguageChange = (code: Locale) => {
    console.log('Cambiando idioma a:', code)
    setLocale(code)
    setIsOpen(false)
  }

  const handleToggle = () => {
    console.log('Toggle dropdown, isOpen:', !isOpen)
    setIsOpen(!isOpen)
  }

  return (
    <div className="relative">
      {/* Botón principal */}
      <button
        onClick={handleToggle}
        disabled={isLoading}
        className="h-10 w-10 flex items-center justify-center rounded-lg hover:bg-accent/50 transition-colors disabled:opacity-50"
        aria-label={`Idioma actual: ${localeNames[locale]}`}
        type="button"
      >
        <span className="text-2xl">{localeFlags[locale]}</span>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Overlay para cerrar al hacer clic fuera */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Menú dropdown */}
          <div className="absolute right-0 top-full mt-2 min-w-[180px] bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden z-50">
            <button
              onClick={() => handleLanguageChange('es')}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left text-gray-900 hover:bg-gray-900 hover:text-white transition-colors ${
                locale === 'es' ? 'bg-gray-100 font-semibold' : ''
              }`}
              type="button"
            >
              <span className="text-2xl">🇪🇸</span>
              <span>Español</span>
            </button>

            <button
              onClick={() => handleLanguageChange('en')}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left text-gray-900 hover:bg-gray-900 hover:text-white transition-colors ${
                locale === 'en' ? 'bg-gray-100 font-semibold' : ''
              }`}
              type="button"
            >
              <span className="text-2xl">🇬🇧</span>
              <span>English</span>
            </button>

            <button
              onClick={() => handleLanguageChange('fr')}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left text-gray-900 hover:bg-gray-900 hover:text-white transition-colors ${
                locale === 'fr' ? 'bg-gray-100 font-semibold' : ''
              }`}
              type="button"
            >
              <span className="text-2xl">🇫🇷</span>
              <span>Français</span>
            </button>
          </div>
        </>
      )}
    </div>
  )
}
