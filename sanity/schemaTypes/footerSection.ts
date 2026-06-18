import { defineField, defineType } from 'sanity'

export const footerColumn = defineType({
  name: 'footerColumn',
  title: 'Columna de enlaces',
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      title: 'Título',
      type: 'string',
    }),
    defineField({
      name: 'links',
      title: 'Enlaces',
      type: 'array',
      of: [{ type: 'menuLink' }], // Reutiliza el objeto menuLink del Header
    }),
    defineField({
      name: 'translations',
      title: 'Traducciones',
      type: 'object',
      fields: [
        defineField({
          name: 'en',
          title: 'English',
          type: 'object',
          fields: [
            defineField({ name: 'title', title: 'Title', type: 'string' }),
          ],
        }),
        defineField({
          name: 'fr',
          title: 'Français',
          type: 'object',
          fields: [
            defineField({ name: 'title', title: 'Titre', type: 'string' }),
          ],
        }),
      ],
    }),
  ],
})

const footerSection = defineType({
  name: 'footerSection',
  title: 'Sección: Footer',
  type: 'document',
  fields: [
    defineField({
      name: 'description',
      title: 'Descripción',
      type: 'text',
      rows: 3,
      description:
        'Texto descriptivo del sitio mostrado junto al logo. El logo y los datos de contacto vienen de Información General.',
    }),
    defineField({
      name: 'showStars',
      title: 'Mostrar estrellas',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'statsText',
      title: 'Texto de estadísticas',
      type: 'string',
      description: 'Ej. +1000 clientes satisfechos',
    }),
    defineField({
      name: 'columns',
      title: 'Columnas',
      type: 'array',
      of: [{ type: 'footerColumn' }],
    }),
    defineField({
      name: 'copyright',
      title: 'Copyright',
      type: 'string',
    }),
    defineField({
      name: 'translations',
      title: 'Traducciones',
      type: 'object',
      fields: [
        defineField({
          name: 'en',
          title: 'English',
          type: 'object',
          fields: [
            defineField({ name: 'description', title: 'Description', type: 'text', rows: 3 }),
            defineField({ name: 'statsText', title: 'Stats Text', type: 'string' }),
            defineField({ name: 'copyright', title: 'Copyright', type: 'string' }),
          ],
        }),
        defineField({
          name: 'fr',
          title: 'Français',
          type: 'object',
          fields: [
            defineField({ name: 'description', title: 'Description', type: 'text', rows: 3 }),
            defineField({ name: 'statsText', title: 'Texte des Statistiques', type: 'string' }),
            defineField({ name: 'copyright', title: 'Copyright', type: 'string' }),
          ],
        }),
      ],
    }),
  ],
})

export default footerSection
