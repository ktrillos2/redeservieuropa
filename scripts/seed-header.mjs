/*
 Seed para crear/actualizar el documento singleton "header" en Sanity.
 - Usa el contenido actual del header (navLinks y serviciosMenu) hardcodeado aquí.
 - No sube logo; el logo debe consumirse desde el esquema generalInfo.

 Ejecuta: pnpm run seed:sanity:header
*/

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
  console.error('Falta SANITY_API_TOKEN en tu entorno (.env/.env.local). Requiero un token con permisos de escritura para crear documentos.')
  process.exit(1)
}

const client = createClient({ projectId, dataset, apiVersion, useCdn: false, token })

function wa(text) {
  return 'https://wa.me/?text=' + encodeURIComponent(text)
}

const doc = {
  _id: 'header',
  _type: 'header',
  siteTitle: 'REDESERVI',
  siteSubtitle: 'PARIS',
  // Nota: NO seteamos logo aquí; el Header debe consumir el logo desde generalInfo
  navLinks: [
    { _type: 'menuLink', label: 'Testimonios', internalHref: '#testimonios', external: false },
    { _type: 'menuLink', label: 'Contacto', internalHref: '#contacto', external: false },
  ],
  serviciosMenu: [
    { _type: 'menuLink', label: 'Traslados', internalHref: '/#traslados', external: false },
    { _type: 'menuGroup', title: 'Tours París', items: [
      { _type: 'menuLink', label: 'Tour por París (personalizable)', internalHref: '/tour/tour-paris', external: false },
      { _type: 'menuLink', label: 'Tour en acompañamiento por París (No vehículo)', href: wa('Hola, me interesa un Tour en acompañamiento por París (sin vehículo). ¿Podrían enviarme propuesta y disponibilidad?'), external: true },
      { _type: 'menuLink', label: 'Tour escala (aeropuerto - Tour - aeropuerto)', href: wa('Hola, me interesa un Tour escala (aeropuerto - Tour - aeropuerto). Tengo una escala y deseo hacer un tour por París entre vuelos. ¿Podrían enviarme opciones, duración y precios?'), external: true },
    ]},
    { _type: 'menuGroup', title: 'Tours Bélgica', items: [
      { _type: 'menuLink', label: 'Brujas', href: wa('Hola, me interesa el Tour a Brujas desde París. ¿Podrían enviarme información y disponibilidad?'), external: true },
      { _type: 'menuLink', label: 'Gante y Brujas', href: wa('Hola, me interesa el Tour Gante y Brujas desde París. ¿Podrían enviarme información y disponibilidad?'), external: true },
      { _type: 'menuLink', label: 'Bruselas y Brujas', href: wa('Hola, me interesa el Tour Bruselas y Brujas desde París. ¿Podrían enviarme información y disponibilidad?'), external: true },
    ]},
    { _type: 'menuSeparator' },
    { _type: 'menuLink', label: 'Tour Brujas y Amsterdam (3 días)', href: wa('Hola, me interesa el Tour Brujas y Amsterdam (3 días). ¿Podrían enviarme itinerario y precios?'), external: true },
    { _type: 'menuLink', label: 'Tour Mont Saint Michel', href: wa('Hola, me interesa el Tour a Mont Saint Michel. ¿Podrían enviarme información y disponibilidad?'), external: true },
    { _type: 'menuLink', label: 'Tour castillo del Valle de Loira', href: wa('Hola, me interesa el Tour a los Castillos del Valle del Loira. ¿Podrían enviarme opciones y precios?'), external: true },
    { _type: 'menuLink', label: 'Tour Versailles', href: wa('Hola, me interesa el Tour a Versailles. ¿Podrían enviarme información de horarios, entradas y transporte?'), external: true },
    { _type: 'menuSeparator' },
    { _type: 'menuLink', label: 'Cotiza tu tour a tu gusto', href: wa('Hola, quiero cotizar un tour a mi gusto. Indico a continuación intereses, fechas y número de pasajeros: '), external: true },
    { _type: 'menuLink', label: 'Billetes paseo en barco Río Sena', href: wa('Hola, quiero comprar billetes para el paseo en barco por el Río Sena (con/sin cena). ¿Podrían enviarme opciones y precios?'), external: true },
    { _type: 'menuLink', label: 'Billetes Disneyland', href: wa('Hola, quiero comprar billetes para Disneyland París. ¿Podrían enviarme disponibilidad y precios?'), external: true },
  ],
}

async function run() {
  console.log(`[seed:header] Upserting header for projectId=${projectId} dataset=${dataset}`)
  const res = await client.transaction().createOrReplace(doc).commit()
  console.log('[seed:header] Done:', res)
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
