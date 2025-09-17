import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'toursSection',
  title: 'Sección: Nuestros Tours',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Título', type: 'string', initialValue: 'Tours' }),
    defineField({ name: 'subtitle', title: 'Subtítulo', type: 'text', rows: 3, initialValue: '' }),
    defineField({ name: 'footnote', title: 'Nota al pie', type: 'string' }),
    defineField({ name: 'cta', title: 'CTA', type: 'object', fields: [
      defineField({ name: 'label', title: 'Etiqueta', type: 'string' }),
      defineField({ name: 'href', title: 'Enlace', type: 'string' }),
      defineField({ name: 'external', title: 'Abrir en nueva pestaña', type: 'boolean' }),
    ]}),
  ],
})
