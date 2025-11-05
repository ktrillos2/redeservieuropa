import { ensureAndGetGeneralInfo } from '@/sanity/lib/general'
import { ScrollToTopButton } from './scroll-to-top-button'

export async function ScrollToTopButtonServer() {
  const generalInfo = await ensureAndGetGeneralInfo()
  
  return (
    <ScrollToTopButton
      whatsappNumber={generalInfo?.contact?.whatsapp || ''}
      defaultMessage={generalInfo?.defaultWhatsAppMessage || ''}
    />
  )
}
