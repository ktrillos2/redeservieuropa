/*
  Seed para crear/actualizar el documento singleton "generalInfo"
  - Sube el logo desde public/images/logo.png (si existe)
  - Establece título, subtítulo, descripción y contacto basados en el sitio actual

  Ejecutar con:
  pnpm tsx sanity/lib/seed-general-info.ts
*/

import fs from 'node:fs'
import path from 'node:path'
import { createClient } from 'next-sanity'
import { apiVersion, dataset, projectId } from '../env'

const client = createClient({ projectId, dataset, apiVersion, useCdn: false })

async function run() {
  // 1) Subir logo si existe
  const logoPath = path.join(process.cwd(), 'public', 'images', 'logo.png')
  let logoAssetRef: any = undefined
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

  // 2) Datos actuales del sitio (tomados del footer/header)
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

  // 3) Upsert
  const res = await client.transaction()
    .createOrReplace(doc)
    .commit()

  console.log('Seed completado:', res)
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
