/*
 Seed para crear/actualizar el documento singleton "generalInfo" en Sanity.
 Ejecuta: pnpm run seed:sanity:general
*/

import fs from 'node:fs'
import path from 'node:path'
import { createClient } from 'next-sanity'
import { config as dotenvConfig } from 'dotenv'

// Carga .env.local (si existe) y luego .env
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
  console.error('Falta SANITY_API_TOKEN en tu entorno (.env/.env.local). Requiero un token con permisos de escritura para subir assets y crear documentos.')
  process.exit(1)
}
if (!/^sk_/.test(token)) {
  console.warn('Aviso: el SANITY_API_TOKEN no parece un token de servidor (no empieza con "sk_"). Asegúrate de usar un token con permisos de escritura (Editor).')
}

console.log(`[seed] Sanity → projectId=${projectId} dataset=${dataset} apiVersion=v${apiVersion}`)

const client = createClient({ projectId, dataset, apiVersion, useCdn: false, token })

async function run() {
  const logoPath = path.join(process.cwd(), 'public', 'images', 'logo.png')
  let logoAssetRef = undefined
  if (fs.existsSync(logoPath)) {
    const stream = fs.createReadStream(logoPath)
    const upload = await client.assets.upload('image', stream, {
      filename: 'logo.png',
      contentType: 'image/png',
    })
    logoAssetRef = {
      _type: 'image',
      asset: { _type: 'reference', _ref: upload._id },
      alt: 'REDESERVI PARIS',
    }
  } else {
    console.warn('No se encontró public/images/logo.png; se creará el doc sin imagen')
  }

  const doc = {
    _id: 'generalInfo',
    _type: 'generalInfo',
    siteTitle: 'REDESERVI',
    siteSubtitle: 'PARIS',
    description:
      'Servicio premium de transporte privado en París. Conectamos aeropuertos, centro de París y Disneyland con comodidad y elegancia.',
    logo: logoAssetRef,
    contact: {
      phone: '+33 1 23 45 67 89',
      email: 'info@redeservi.paris',
      address: 'París, Francia',
      whatsapp: '',
    },
    defaultWhatsAppMessage: 'Hola, me gustaría recibir información sobre sus servicios.',
    socialLinks: [],
  }

  const res = await client.transaction().createOrReplace(doc).commit()
  console.log('Seed completado:', res)
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
