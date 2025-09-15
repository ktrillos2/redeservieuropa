import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'hero',
  title: 'Hero',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Título', type: 'string', validation: (Rule) => Rule.required() }),
    defineField({ name: 'highlight', title: 'Texto destacado', type: 'string' }),
    defineField({ name: 'description', title: 'Descripción', type: 'text' }),
    defineField({
      name: 'backgroundImage',
      title: 'Imagen de fondo',
      type: 'image',
      options: { hotspot: true },
      fields: [defineField({ name: 'alt', title: 'Alt', type: 'string' })],
    }),
    defineField({
      name: 'primaryCta',
      title: 'CTA principal',
      type: 'object',
      fields: [
        defineField({ name: 'label', title: 'Etiqueta', type: 'string' }),
        defineField({ name: 'href', title: 'URL', type: 'url' }),
        defineField({ name: 'internalHref', title: 'Ruta interna', type: 'string' }),
        defineField({ name: 'external', title: 'Abrir en nueva pestaña', type: 'boolean', initialValue: false }),
      ],
    }),
    defineField({
      name: 'secondaryCta',
      title: 'CTA secundaria',
      type: 'object',
      fields: [
        defineField({ name: 'label', title: 'Etiqueta', type: 'string' }),
        defineField({ name: 'href', title: 'URL', type: 'url' }),
        defineField({ name: 'internalHref', title: 'Ruta interna', type: 'string' }),
        defineField({ name: 'external', title: 'Abrir en nueva pestaña', type: 'boolean', initialValue: false }),
      ],
    }),
    defineField({ name: 'showBookingForm', title: 'Mostrar formulario de reserva', type: 'boolean', initialValue: true }),
  ],
  preview: { select: { title: 'title', subtitle: 'highlight', media: 'backgroundImage' } },
})
