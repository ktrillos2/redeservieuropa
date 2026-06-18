import { createClient } from 'next-sanity'
import { apiVersion, dataset, projectId } from '@/sanity/env'

export type Locale = 'es' | 'en' | 'fr'

export const locales: Locale[] = ['es', 'en', 'fr']

export const localeNames: Record<Locale, string> = {
  es: 'Español',
  en: 'English',
  fr: 'Français',
}

// Cliente sin CDN para traducciones (siempre datos frescos)
const translationClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false, // No usar CDN para traducciones
})

export interface TranslationDocument {
  language: Locale
  header?: any
  footer?: any
  home?: any
  booking?: any
  events?: any
  checkout?: any
  thanks?: any
  common?: any
}

export interface TranslationDictionary {
  [key: string]: any
}

const TRANSLATIONS_QUERY = `*[_type == "translation" && language == $language][0]{
  language,
  header,
  footer,
  home,
  booking,
  events,
  checkout,
  thanks,
  common
}`

let translationsCache: Record<Locale, TranslationDictionary> = {} as any
let cacheTime: Record<Locale, number> = {} as any
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutos

/**
 * Obtiene las traducciones para un idioma específico desde Sanity
 */
export async function getTranslationsForLocale(locale: Locale): Promise<TranslationDictionary> {
  const now = Date.now()
  
  // Usar caché si está disponible y no ha expirado
  if (translationsCache[locale] && cacheTime[locale] && now - cacheTime[locale] < CACHE_DURATION) {
    console.log(`[i18n] Usando caché para ${locale}`)
    return translationsCache[locale]
  }

  console.log(`[i18n] Cargando traducciones para ${locale} desde Sanity...`)

  try {
    const doc = await translationClient.fetch<TranslationDocument>(TRANSLATIONS_QUERY, { language: locale })
    
    console.log(`[i18n] Documento recibido para ${locale}:`, doc ? 'encontrado' : 'no encontrado')
    
    if (!doc) {
      console.warn(`No translation document found for locale: ${locale}`)
      return {}
    }

    // Construir diccionario plano con notación de punto
    const dictionary = flattenObject(doc)
    
    console.log(`[i18n] Traducciones aplanadas para ${locale}, keys:`, Object.keys(dictionary).length)
    
    translationsCache[locale] = dictionary
    cacheTime[locale] = now
    
    return dictionary
  } catch (error) {
    console.error(`Error fetching translations for ${locale}:`, error)
    return {}
  }
}

/**
 * Aplana un objeto anidado en notación de punto
 * { home: { hero: { title: 'x' } } } => { 'home.hero.title': 'x' }
 */
function flattenObject(obj: any, prefix: string = ''): TranslationDictionary {
  const result: TranslationDictionary = {}

  for (const key in obj) {
    if (key === '_type' || key === '_id' || key === '_rev' || key === '_createdAt' || key === '_updatedAt' || key === 'language') {
      continue
    }

    const value = obj[key]
    const newKey = prefix ? `${prefix}.${key}` : key

    if (value && typeof value === 'object' && !Array.isArray(value)) {
      Object.assign(result, flattenObject(value, newKey))
    } else if (value !== null && value !== undefined) {
      result[newKey] = value
    }
  }

  return result
}

/**
 * Obtiene una traducción usando notación de punto
 */
export function getNestedTranslation(obj: TranslationDictionary, path: string): string {
  return obj[path] || path
}

/**
 * Interpola variables en una cadena de traducción
 * Ejemplo: "Pagado ahora ({{percent}}%)" con {percent: 30} => "Pagado ahora (30%)"
 */
export function interpolate(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return values[key]?.toString() || match
  })
}

/**
 * Invalida el caché de traducciones (útil después de actualizaciones en Sanity)
 */
export function invalidateTranslationsCache(locale?: Locale) {
  if (locale) {
    delete translationsCache[locale]
    delete cacheTime[locale]
  } else {
    translationsCache = {} as any
    cacheTime = {} as any
  }
}
