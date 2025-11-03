// schemas/tour.ts
import { defineType, defineField, defineArrayMember } from 'sanity'

type TourPricing = {
  pricingMode: 'rules' | 'table'
  pricingRules?: { baseUpTo4EUR: number }
  pricingTable?: { p4?: number; p5?: number; p6?: number; p7?: number; p8?: number; extraFrom9?: number }
}

// Incrementos fijos para Modo Reglas
const INC_5 = 34
const INC_6 = 32
const INC_7 = 28
const INC_8 = 26

export function computePrice(pax: number, pricing: TourPricing): number {
  const n = Math.max(1, Math.floor(pax || 0))

  if (pricing.pricingMode === 'rules' && pricing.pricingRules) {
    const base = pricing.pricingRules.baseUpTo4EUR || 0
    if (n <= 4) return base
    if (n === 5) return base + INC_5
    if (n === 6) return base + INC_5 + INC_6
    if (n === 7) return base + INC_5 + INC_6 + INC_7
    // 8 o más: precio de 8 pax (no aumenta más)
    return base + INC_5 + INC_6 + INC_7 + INC_8
  }

  if (pricing.pricingMode === 'table' && pricing.pricingTable) {
    const t = pricing.pricingTable
    if (n <= 4) return t.p4 ?? 0
    if (n === 5) return t.p5 ?? 0
    if (n === 6) return t.p6 ?? 0
    if (n === 7) return t.p7 ?? 0
    if (n === 8) return t.p8 ?? 0
    // 9+: p8 + extraFrom9 * (n - 8)
    return (t.p8 ?? 0) + (t.extraFrom9 || 0) * (n - 8)
  }

  return 0
}

export default defineType({
  name: 'tour',
  title: 'Tour',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Título del Tour',
      type: 'string',
      description: 'Ejemplo: “Disneyland ↔ París Tour (3 horas)”',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug (URL)',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      description: 'Ejemplo: “disneyland-paris-tour-3h”',
      validation: (r) => r.required(),
    }),

    defineField({
      name: 'route',
      title: 'Ruta del Tour',
      type: 'object',
      description: 'Origen, destino y tipo de recorrido.',
      fields: [
        defineField({ name: 'origin', title: 'Origen', type: 'string', initialValue: 'Disneyland' }),
        defineField({ name: 'destination', title: 'Destino', type: 'string', initialValue: 'París' }),
        defineField({
          name: 'circuitName',
          title: 'Circuito (tipo de recorrido)',
          type: 'string',
          description: 'Ej.: “Eiffel + Arco del Triunfo”, “Tour 3h”, “Exprés 2h”.',
        }),
        defineField({ name: 'roundTrip', title: 'Ida y vuelta', type: 'boolean', initialValue: true }),
      ],
    }),

    defineField({
      name: 'summary',
      title: 'Resumen corto',
      type: 'text',
      rows: 3,
      description: 'Breve texto para listados. Ej.: “Recorrido panorámico con paradas para fotos”.',
    }),
    defineField({
      name: 'description',
      title: 'Descripción completa',
      type: 'array',
      of: [defineArrayMember({ type: 'block' })],
      description: 'Texto principal de la página del tour.',
    }),

    defineField({
      name: 'features',
      title: 'Características',
      type: 'array',
      of: [defineArrayMember({ type: 'string' })],
      description: 'Ej.: “Paradas en puntos icónicos”, “Guía profesional”, “Vehículo amplio”.',
    }),
    defineField({
      name: 'includes',
      title: 'Incluye',
      type: 'array',
      of: [defineArrayMember({ type: 'string' })],
      description: 'Ej.: “Conductor ES/EN/FR”, “Combustible y peajes incluidos”.',
    }),
    defineField({
      name: 'visitedPlaces',
      title: 'Qué visitamos',
      type: 'array',
      of: [defineArrayMember({ type: 'string' })],
      description: 'Ej.: “Museo del Louvre”, “Campos Elíseos”, “Torre Eiffel”.',
    }),
    defineField({
      name: 'notes',
      title: 'Notas o condiciones',
      type: 'array',
      of: [defineArrayMember({ type: 'string' })],
      description: 'Ej.: “Paradas de 15 min”, “Itinerario sujeto al tráfico”.',
    }),
    defineField({
      name: 'amenities',
      title: 'Comodidades del vehículo',
      type: 'array',
      of: [defineArrayMember({ type: 'string' })],
      description: 'Ej.: “WiFi gratuito”, “Agua de cortesía”, “Seguro completo”.',
    }),

    // ======== PRECIOS: DOS MODOS ========
    defineField({
      name: 'pricingMode',
      title: 'Modo de precios',
      type: 'string',
      initialValue: 'rules',
      options: {
        list: [
          { title: 'Reglas (base + incrementos fijos)', value: 'rules' },
          { title: 'Tabla especial (4–8 pax + extra 9+)', value: 'table' },
        ],
        layout: 'radio',
      },
      description:
        '“Reglas”: solo ingresa el precio base (hasta 4 pax). 5→+34, 6→+32, 7→+28, 8→+26, y 9+ = precio de 8 pax.',
    }),

    // 1) REGLAS: solo base hasta 4 pax
    defineField({
      name: 'pricingRules',
      title: 'Tarifas por reglas',
      type: 'object',
      hidden: ({ parent }) => parent?.pricingMode !== 'rules',
      description:
        'Ingresa únicamente el “Precio base (hasta 4 pax)”. Los incrementos son fijos: +34 (5 pax), +32 (6), +28 (7), +26 (8). Desde 9+ se cobra el mismo precio de 8 pax.',
      fields: [
        defineField({
          name: 'baseUpTo4EUR',
          title: 'Precio base (hasta 4 personas) €',
          type: 'number',
          description: 'Ej.: 311',
          validation: (r) => r.min(0).required(),
        }),
      ],
    }),

    // 2) TABLA ESPECIAL: precios explícitos 4–8 + extra 9+
    defineField({
      name: 'pricingTable',
      title: 'Tabla especial (precios totales)',
      type: 'object',
      hidden: ({ parent }) => parent?.pricingMode !== 'table',
      description: 'Precio total para 4–8 pax. Para 9+ se suma un extra fijo por persona.',
      fields: [
        defineField({ name: 'p4', title: '4 personas (€)', type: 'number' }),
        defineField({ name: 'p5', title: '5 personas (€)', type: 'number' }),
        defineField({ name: 'p6', title: '6 personas (€)', type: 'number' }),
        defineField({ name: 'p7', title: '7 personas (€)', type: 'number' }),
        defineField({ name: 'p8', title: '8 personas (€)', type: 'number' }),
        defineField({
          name: 'extraFrom9',
          title: 'Extra por persona desde 9+ (€ c/u)',
          type: 'number',
          description: 'Se añade por cada persona adicional (solo para modo Tabla).',
        }),
      ],
    }),

    defineField({
      name: 'overCapacityNote',
      title: 'Nota para más de 8 pasajeros',
      type: 'string',
      initialValue: 'Para más de 8 pasajeros, consultar por Van o grupo.',
    }),

    defineField({
      name: 'booking',
      title: 'Reserva / Llamado a la acción',
      type: 'object',
      fields: [
        defineField({ name: 'startingPriceEUR', title: 'Precio desde (€)', type: 'number' }),
        defineField({ name: 'priceNote', title: 'Nota de precio', type: 'string' }),
      ],
    }),

    defineField({
      name: 'isPopular',
      title: 'Destacar como Popular',
      type: 'boolean',
      initialValue: false,
      description: 'Activa para mostrar este tour como Popular en la web.',
    }),

    defineField({
      name: 'mainImage',
      title: 'Imagen principal',
      type: 'image',
      options: { hotspot: true },
    }),

    defineField({ name: 'orderRank', title: 'Orden de aparición', type: 'string' }),

    // ✅ NUEVA SECCIÓN: Requerimientos de reserva
    defineField({
      name: 'requirements',
      title: 'Requerimientos de reserva',
      type: 'object',
      description: 'Indica si este tour requiere datos obligatorios al reservar.',
      fields: [
        defineField({
          name: 'requireFlightNumber',
          title: 'Requiere número de vuelo',
          type: 'boolean',
          initialValue: false,
          description: 'Activa si el cliente debe ingresar su número de vuelo.',
        }),
      ],
    }),
  ],

  preview: {
    select: { title: 'title', subtitle: 'route.circuitName', media: 'mainImage' },
  },
})