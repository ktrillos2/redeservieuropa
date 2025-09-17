#!/usr/bin/env tsx
import { createClient } from 'next-sanity'
import { config as dotenvConfig } from 'dotenv'
import path from 'node:path'

dotenvConfig({ path: path.join(process.cwd(), '.env.local'), override: true })
dotenvConfig({ path: path.join(process.cwd(), '.env') })

const projectId = (process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '').trim()
const dataset = (process.env.NEXT_PUBLIC_SANITY_DATASET || '').trim()
const apiVersion = (process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2025-09-15').trim()
const token = (process.env.SANITY_API_TOKEN || '').trim()

if (!projectId || !dataset) {
  console.error('Faltan variables de entorno: NEXT_PUBLIC_SANITY_PROJECT_ID y/o NEXT_PUBLIC_SANITY_DATASET')
  process.exit(1)
}
if (!token) {
  console.error('Falta SANITY_API_TOKEN en tu entorno (.env/.env.local). Requiero un token con permisos de escritura.')
  process.exit(1)
}

const client = createClient({ projectId, dataset, apiVersion, useCdn: false, token })

async function main() {
  const docId = 'footerSection'
  const content = {
    _id: docId,
    _type: 'footerSection',
    description:
      'Servicio premium de transporte privado en París. Conectamos aeropuertos, centro de París y Disneyland con comodidad y elegancia.',
    showStars: true,
    statsText: '+1000 clientes satisfechos',
    columns: [
      {
        _type: 'footerColumn',
        title: 'Servicios',
        links: [
          { _type: 'menuLink', label: 'Aeropuerto CDG', internalHref: '/#traslados', external: false },
          { _type: 'menuLink', label: 'Aeropuerto Orly', internalHref: '/#traslados', external: false },
          { _type: 'menuLink', label: 'Aeropuerto Beauvais', internalHref: '/#traslados', external: false },
          { _type: 'menuLink', label: 'París ↔ Disneyland', internalHref: '/#traslados', external: false },
          { _type: 'menuLink', label: 'Tour Nocturno', href: 'https://wa.me/?text=' + encodeURIComponent('Hola, me interesa el Tour Nocturno en París. ¿Podrían enviarme más información y precios?'), external: true },
        ],
      },
    ],
    copyright: '© 2025 REDESERVI PARIS. Todos los derechos reservados.',
  }

  const res = await client.transaction().createOrReplace(content as any).commit()
  console.log('[seed:footer-section] Done:', res?.results?.length || 0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
