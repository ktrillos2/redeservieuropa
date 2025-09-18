/*
 Carga tours en Sanity a partir del mock actual, incluyendo imágenes desde /public si existen.
 Ejecuta: pnpm run seed:sanity:tours
*/
import { createClient } from 'next-sanity'
import { config as dotenvConfig } from 'dotenv'
import path from 'node:path'
import fs from 'node:fs'

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

async function uploadImageIfExists(relPath) {
  if (!relPath) return undefined
  const p = relPath.startsWith('/') ? relPath.slice(1) : relPath
  const full = path.join(process.cwd(), 'public', p)
  if (!fs.existsSync(full)) return undefined
  const stream = fs.createReadStream(full)
  const filename = path.basename(full)
  const contentType = filename.endsWith('.png') ? 'image/png' : 'image/jpeg'
  const upload = await client.assets.upload('image', stream, { filename, contentType })
  return { _type: 'image', asset: { _type: 'reference', _ref: upload._id } }
}

function slugify(str) {
  return (str || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
}

async function run() {
  const tourData = {
  "cdg-paris": {
    title: "Traslado CDG ↔ París",
    description:
      "Servicio premium de traslado desde/hacia el aeropuerto Charles de Gaulle al centro de París. Nuestros conductores profesionales te esperarán en la terminal con un cartel con tu nombre.",
    basePrice: 65,
    duration: "45-60 min",
    distance: "35 km",
    image: "/luxury-car-at-charles-de-gaulle-airport-paris.jpg",
    gallery: [
      "/luxury-car-at-charles-de-gaulle-airport-paris.jpg",
      "/vehicles/stepway-paris-2.jpg",
      "/vehicles/stepway-paris-3.jpg",
      "/vehicles/stepway-paris-4.jpg",
      "/vehicles/stepway-paris-5.jpg",
    ],
    features: [
      "Seguimiento de vuelo en tiempo real",
      "Conductor profesional uniformado",
      "Vehículo Mercedes-Benz o similar",
      "WiFi gratuito a bordo",
      "Agua embotellada de cortesía",
      "Asistencia con equipaje",
      "Pago con tarjeta o efectivo",
      "Cancelación gratuita hasta 24h antes",
    ],
    included: [
      "Recogida en terminal",
      "Espera gratuita 60 min",
      "Peajes incluidos",
      "Seguro completo",
      "Conductor de habla hispana o inglesa o francés",
      "Vehículo amplio",
    ],
    pricing: {
      1: 65,
      2: 65,
      3: 65,
      4: 65,
      5: 85,
      6: 103,
      7: 109,
      8: 113,
    },
  },
  "orly-paris": {
    title: "Traslado Orly ↔ París",
    description:
      "Conexión directa y cómoda entre el aeropuerto de Orly y el centro de París. Servicio puerta a puerta con la máxima comodidad.",
    basePrice: 60,
    duration: "35-45 min",
    distance: "25 km",
    image: "/elegant-transport-service-orly-airport-paris.jpg",
    gallery: [
      "/elegant-transport-service-orly-airport-paris.jpg",
      "/vehicles/stepway-paris-1.jpg",
      "/vehicles/stepway-paris-6.jpg",
      "/elegant-paris-skyline-with-eiffel-tower-and-luxury.jpg",
    ],
    features: [
      "Servicio puerta a puerta",
      "Vehículos de lujo",
      "Conductores bilingües",
      "Sistema de climatización",
      "Música ambiente",
      "Cargadores USB",
      "Servicio 24/7",
      "Confirmación inmediata",
    ],
    included: [
      "Recogida en terminal",
      "Espera gratuita 45 min",
      "Peajes incluidos",
      "Limpieza del vehículo",
      "Conductor de habla hispana o inglesa o francés",
      "Vehículo cómodo",
    ],
    pricing: {
      1: 60,
      2: 60,
      3: 60,
      4: 60,
      5: 80,
      6: 95,
      7: 104,
      8: 108,
    },
  },
  "paris-disneyland": {
    title: "París ↔ Disneyland",
    description:
      "Traslado mágico hacia el reino de la fantasía. Perfecto para familias, con espacio extra para equipaje y entretenimiento para los más pequeños.",
    basePrice: 70,
    duration: "45-60 min",
    distance: "40 km",
    image: "/family-transport-to-disneyland-paris-castle.jpg",
    gallery: [
      "/family-transport-to-disneyland-paris-castle.jpg",
      "/elegant-woman-smiling.png",
      "/vehicles/stepway-paris-2.jpg",
    ],
    features: [
      "Perfecto para familias",
      "Entretenimiento para niños",
      "Asientos elevadores disponibles",
      "Espacio extra para equipaje",
      "Paradas técnicas si necesario",
      "Información sobre el parque",
      "Fotos de recuerdo",
      "Horarios flexibles",
    ],
    included: [
      "Recogida en hotel",
      "Entrada directa al parque",
      "Mapa del parque",
      "Recomendaciones VIP",
      "Conductor de habla hispana o inglesa o francés",
      "Vehículo amplio",
    ],
    pricing: {
      1: 70,
      2: 70,
      3: 70,
      4: 70,
      5: 90,
      6: 106,
      7: 118,
      8: 134,
    },
  },
  "tour-paris": {
    title: "Tour por París",
    description:
      "Descubre la Ciudad de la Luz con nuestro tour personalizado. Recorre los monumentos más emblemáticos de París con un conductor profesional que te contará la historia de cada lugar.",
    basePriceDay: 55,
    basePriceNight: 65,
    duration: "Mínimo 2 horas",
    distance: "Personalizable",
    image: "/vehicles/stepway-paris-4.jpg",
    gallery: [
      "/vehicles/stepway-paris-1.jpg",
      "/vehicles/stepway-paris-3.jpg",
      "/vehicles/stepway-paris-4.jpg",
      "/vehicles/stepway-paris-5.jpg",
      "/vehicles/stepway-paris-6.jpg",
      "/elegant-paris-skyline-with-eiffel-tower-and-luxury.jpg",
    ],
    features: [
      "Tour personalizable",
      "Paradas en monumentos principales",
      "Conductor guía profesional",
      "Vehículo cómodo y amplio",
      "Fotos en lugares emblemáticos",
      "Información histórica",
      "Flexibilidad de horarios",
      "Rutas adaptadas a tus intereses",
    ],
    included: [
      "Conductor de habla hispana o inglesa o francés",
      "Vehículo cómodo",
      "Combustible incluido",
      "Estacionamiento incluido",
    ],
  },
  "paris-dl-dl": {
    title: "Disneyland ➡ Paris Tour ➡ Disneyland",
    description:
      "Disfruta un recorrido por París saliendo desde Disneyland y regresando al mismo punto. Ideal para conocer lo imprescindible en un solo trayecto con paradas para fotos.",
    basePrice: 200,
    duration: "2h · 3h o circuito Eiffel + Arco",
    distance: "Circuito en París",
    image: "/vehicles/stepway-paris-1.jpg",
    gallery: [
      "/vehicles/stepway-paris-1.jpg",
      "/vehicles/stepway-paris-2.jpg",
      "/vehicles/stepway-paris-3.jpg",
      "/vehicles/stepway-paris-4.jpg",
      "/vehicles/stepway-paris-5.jpg",
      "/vehicles/stepway-paris-6.jpg",
    ],
    features: [
      "Salida y regreso a Disneyland",
      "Paradas en puntos icónicos",
      "Conductor guía profesional",
      "Vehículo cómodo y amplio",
      "Itinerario optimizado según tráfico",
      "Flexibilidad de horarios",
      "Fotos en lugares emblemáticos",
      "Servicio privado",
    ],
    included: [
      "Conductor de habla hispana o inglesa o francés",
      "Vehículo cómodo",
      "Combustible y peajes",
      "Estacionamiento incluido",
    ],
    pricingP4: { threeH: 300, twoH: 245, eiffelArco: 200 },
    pricingP5: { threeH: 340, twoH: 315, eiffelArco: 245 },
  },
}

  console.log('[seed:tours] export keys from lib/tours =', Object.keys(Tours))
  console.log('[seed:tours] has tourData?', typeof Tours.tourData, Array.isArray(Tours.tourData))
  const entries = Object.entries(tourData )
  for (const [key, t] of entries) {
    const slug = slugify(key)
    const mainImage = await uploadImageIfExists(t.image)
    const gallery = Array.isArray(t.gallery) ? await Promise.all(t.gallery.map(uploadImageIfExists)) : []
    const pricing = t.pricing ? Object.entries(t.pricing).map(([pax, price]) => ({ pax: Number(pax), price: Number(price) })) : undefined
    const doc = {
  _type: 'tours',
      _id: `tour-${slug}`,
      title: t.title,
      slug: { _type: 'slug', current: slug },
      description: t.description,
      duration: t.duration,
      distance: t.distance,
      mainImage,
      gallery: (gallery || []).filter(Boolean),
      features: t.features || [],
      included: t.included || [],
      basePrice: t.basePrice,
      basePriceDay: t.basePriceDay,
      basePriceNight: t.basePriceNight,
      pricing,
      pricingP4: t.pricingP4,
      pricingP5: t.pricingP5,
      amenities: t.amenities || [],
      pricingOptions: (t.pricingOptions || []).map(po => ({
        _type: 'pricingOption',
        label: po.label,
        price: po.price,
        hours: po.hours,
        description: po.description,
      })),
      isActive: true,
      order: 1,
    }
    await client.transaction().createOrReplace(doc).commit()
    console.log('[seed:tours] upsert', doc._id)
  }
  console.log('[seed:tours] done')
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
