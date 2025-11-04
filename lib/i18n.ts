import es from '@/locales/es.json'
import en from '@/locales/en.json'
import de from '@/locales/de.json'

export type Locale = 'es' | 'en' | 'de'

export const locales: Locale[] = ['es', 'en', 'de']

export const localeNames: Record<Locale, string> = {
  es: 'Español',
  en: 'English',
  de: 'Deutsch',
}

export const translations = {
  es,
  en,
  de,
}

export type TranslationKeys = typeof es

export function getNestedTranslation(obj: any, path: string): string {
  return path.split('.').reduce((acc, part) => acc?.[part], obj) || path
}

export function interpolate(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return values[key]?.toString() || match
  })
}
