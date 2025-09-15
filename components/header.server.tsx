import { ensureAndGetGeneralInfo, ensureAndGetHeader } from '@/sanity/lib/general'
import { Header } from './header'
import { urlFor } from '@/sanity/lib/image'

export default async function HeaderServer() {
  const headerDoc = await ensureAndGetHeader()
  const info = await ensureAndGetGeneralInfo()
  // Siempre usar logo desde generalInfo
  const logo = info?.logo
  const logoUrl = logo ? urlFor(logo).width(88).height(88).url() : '/images/logo.png'
  return <Header siteTitle={headerDoc?.siteTitle || info?.siteTitle} siteSubtitle={headerDoc?.siteSubtitle || info?.siteSubtitle} logoUrl={logoUrl} />
}
