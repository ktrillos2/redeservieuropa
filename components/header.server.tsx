import { ensureAndGetGeneralInfo, ensureAndGetHeader } from '@/sanity/lib/general'
import { Header } from './header'
import { urlFor } from '@/sanity/lib/image'

export default async function HeaderServer() {
  const headerDoc = await ensureAndGetHeader()
  const info = await ensureAndGetGeneralInfo()
  // Siempre usar logo desde generalInfo
  const logo = info?.logo
  // Pedimos solo altura para respetar proporción (evita recortes cuadrados) y asegurar nitidez
  // Logo vertical más alto (hasta 140px); solicitamos ~2.5x para nitidez
  const logoUrl = logo ? urlFor(logo).height(360).url() : '/images/logo.png'
  return <Header siteTitle={headerDoc?.siteTitle || info?.siteTitle} siteSubtitle={headerDoc?.siteSubtitle || info?.siteSubtitle} logoUrl={logoUrl} />
}
