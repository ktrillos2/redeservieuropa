import { Locale } from './i18n-sanity'

/**
 * Obtiene el contenido traducido de un tour según el idioma
 * Mantiene toda la estructura del tour, pero reemplaza los campos traducibles
 */
export function getTranslatedTour<T extends Record<string, any>>(
  tour: T,
  locale: Locale
): T {
  // Si es español, retornar el tour original
  if (locale === 'es' || !tour.translations) {
    return tour
  }

  const translation = tour.translations?.[locale]

  // Si no hay traducción para este idioma, retornar original
  if (!translation) {
    return tour
  }

  // Crear copia del tour con campos traducidos
  return {
    ...tour,
    title: translation.title || tour.title,
    summary: translation.summary || tour.summary,
    description: translation.description || tour.description,
    features: translation.features || tour.features,
    includes: translation.includes || tour.includes,
    visitedPlaces: translation.visitedPlaces || tour.visitedPlaces,
    notes: translation.notes || tour.notes,
  }
}

/**
 * Obtiene el contenido traducido de un transfer según el idioma
 * Mantiene toda la estructura del transfer, pero reemplaza los campos traducibles
 */
export function getTranslatedTransfer<T extends Record<string, any>>(
  transfer: T,
  locale: Locale
): T {
  // Si es español, retornar el transfer original
  if (locale === 'es' || !transfer.translations) {
    return transfer
  }

  const translation = transfer.translations?.[locale]

  // Si no hay traducción para este idioma, retornar original
  if (!translation) {
    return transfer
  }

  // Crear copia del transfer con campos traducidos
  return {
    ...transfer,
    from: translation.from || transfer.from,
    to: translation.to || transfer.to,
    briefInfo: translation.briefInfo || transfer.briefInfo,
    description: translation.description || transfer.description,
    duration: translation.duration || transfer.duration,
  }
}

/**
 * Traduce un array de tours
 */
export function getTranslatedTours<T extends Record<string, any>>(
  tours: T[],
  locale: Locale
): T[] {
  return tours.map(tour => getTranslatedTour(tour, locale))
}

/**
 * Traduce un array de transfers
 */
export function getTranslatedTransfers<T extends Record<string, any>>(
  transfers: T[],
  locale: Locale
): T[] {
  return transfers.map(transfer => getTranslatedTransfer(transfer, locale))
}

/**
 * Obtiene el contenido traducido de hero según el idioma
 * Mantiene toda la estructura del hero, pero reemplaza los campos traducibles
 */
export function getTranslatedHero<T extends Record<string, any>>(
  hero: T,
  locale: Locale
): T {
  // Si es español, retornar el hero original
  if (locale === 'es' || !hero.translations) {
    return hero
  }

  const translation = hero.translations?.[locale]

  // Si no hay traducción para este idioma, retornar original
  if (!translation) {
    return hero
  }

  // Crear copia del hero con campos traducidos
  return {
    ...hero,
    title: translation.title || hero.title,
    highlight: translation.highlight || hero.highlight,
    description: translation.description || hero.description,
    primaryCta: translation.primaryCta || hero.primaryCta,
    secondaryCta: translation.secondaryCta || hero.secondaryCta,
    bookingForm: translation.bookingForm 
      ? {
          ...hero.bookingForm,
          ...translation.bookingForm,
        }
      : hero.bookingForm,
  }
}
