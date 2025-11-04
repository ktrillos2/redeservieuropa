'use client'

import { useTranslation } from '@/contexts/i18n-context'

export function TranslationTest() {
  const { locale, t, isLoading } = useTranslation()

  if (isLoading) {
    return <div className="p-4 bg-yellow-100 border border-yellow-300 rounded">Cargando traducciones...</div>
  }

  return (
    <div className="p-4 bg-blue-100 border border-blue-300 rounded space-y-2">
      <h3 className="font-bold">Test de Traducciones</h3>
      <p><strong>Locale actual:</strong> {locale}</p>
      <p><strong>header.services:</strong> {t('header.services')}</p>
      <p><strong>header.tours:</strong> {t('header.tours')}</p>
      <p><strong>header.contact:</strong> {t('header.contact')}</p>
      <p><strong>common.loading:</strong> {t('common.loading')}</p>
    </div>
  )
}
