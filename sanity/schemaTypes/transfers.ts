// /sanity/schemas/transfers.ts
import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'transfers',
  title: 'Traslado',
  type: 'document',
  fields: [
    defineField({
      name: 'from',
      title: 'Desde',
      type: 'string',
      validation: (r) => r.required()
    }),
    defineField({
      name: 'to',
      title: 'Hasta',
      type: 'string',
      validation: (r) => r.required()
    }),
    defineField({
      name: 'briefInfo',
      title: 'Información breve',
      type: 'text',
      rows: 4,
      description: 'Texto breve o detalles clave para mostrar como tooltip.'
    }),

    // === REQUERIMIENTOS DE VUELO ===
    defineField({
      name: 'requireFlightInfo',
      title: '¿Requiere info de vuelo?',
      type: 'boolean',
      initialValue: false,
      description:
        'Actívalo si el traslado inicia/termina en aeropuerto: mostrará campos de vuelo.'
    }),
    defineField({
      name: 'requireFlightNumber',
      title: 'Obligar número de vuelo',
      type: 'boolean',
      initialValue: false,
      hidden: ({ parent }) => !parent?.requireFlightInfo,
      description: 'Si está activo, el número de vuelo será obligatorio.'
    }),
    defineField({
      name: 'requireFlightTimes',
      title: 'Obligar hora(s) de vuelo',
      type: 'boolean',
      initialValue: false,
      hidden: ({ parent }) => !parent?.requireFlightInfo,
      description: 'Si está activo, hora de llegada y/o salida serán obligatorias.'
    }),

    // === SLUG ===
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      description:
        'Generado automáticamente a partir de Desde y Hasta. Se puede editar.',
      options: {
        source: (doc: any) => `${(doc.from || '').toString()}-${(doc.to || '').toString()}`,
        slugify: (input: string) =>
          input
            .toLowerCase()
            .normalize('NFD')
            .replace(/\p{Diacritic}/gu, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '')
            .slice(0, 80)
      },
      validation: (r) => r.required()
    }),

    // === PRECIOS POR PASAJEROS ===
    defineField({
      name: 'priceP4',
      title: 'Precio (4 pax)',
      type: 'number',
      validation: (r) => r.required().min(0)
    }),
    defineField({
      name: 'priceP5',
      title: 'Precio (5 pax)',
      type: 'number',
      validation: (r) => r.required().min(0)
    }),
    defineField({
      name: 'priceP6',
      title: 'Precio (6 pax)',
      type: 'number',
      validation: (r) => r.required().min(0)
    }),
    defineField({
      name: 'priceP7',
      title: 'Precio (7 pax)',
      type: 'number',
      validation: (r) => r.required().min(0)
    }),
    defineField({
      name: 'priceP8',
      title: 'Precio (8 pax y 9+)',
      type: 'number',
      validation: (r) => r.required().min(0),
      description: 'Se usará este mismo precio para 9 o más pasajeros.'
    }),

    // === INFO EXTRA (opcional) ===
    defineField({ name: 'description', title: 'Descripción', type: 'text' }),
    defineField({ name: 'duration', title: 'Duración', type: 'string' }),
    defineField({ name: 'popular', title: 'Popular', type: 'boolean', initialValue: false }),
    defineField({
      name: 'order',
      title: 'Orden',
      type: 'number',
      description: 'Para ordenar manualmente (menor primero)'
    }),

    // ✅ TRADUCCIONES
    defineField({
      name: 'translations',
      title: 'Traducciones',
      type: 'object',
      description: 'Traducciones del traslado a otros idiomas',
      options: { collapsible: true, collapsed: true },
      fields: [
        // INGLÉS
        defineField({
          name: 'en',
          title: 'English',
          type: 'object',
          options: { collapsible: true, collapsed: true },
          fields: [
            defineField({ name: 'from', title: 'From', type: 'string' }),
            defineField({ name: 'to', title: 'To', type: 'string' }),
            defineField({ name: 'briefInfo', title: 'Brief Info', type: 'text', rows: 4 }),
            defineField({ name: 'description', title: 'Description', type: 'text' }),
            defineField({ name: 'duration', title: 'Duration', type: 'string' }),
          ],
        }),
        // FRANCÉS
        defineField({
          name: 'fr',
          title: 'Français',
          type: 'object',
          options: { collapsible: true, collapsed: true },
          fields: [
            defineField({ name: 'from', title: 'Depuis', type: 'string' }),
            defineField({ name: 'to', title: 'Vers', type: 'string' }),
            defineField({ name: 'briefInfo', title: 'Info brève', type: 'text', rows: 4 }),
            defineField({ name: 'description', title: 'Description', type: 'text' }),
            defineField({ name: 'duration', title: 'Durée', type: 'string' }),
          ],
        }),
      ],
    }),
  ],
  preview: {
    select: { from: 'from', to: 'to', priceP4: 'priceP4', priceP8: 'priceP8' },
    prepare: ({ from, to, priceP4, priceP8 }) => ({
      title: `${from || '?'} → ${to || '?'}`,
      subtitle: `4 pax: ${priceP4 ?? '-'}€ · 8/9+: ${priceP8 ?? '-'}€`
    })
  }
})