import { defineType, defineField } from 'sanity'

export const menuLink = defineType({
  name: 'menuLink',
  title: 'Enlace',
  type: 'object',
  fields: [
    defineField({ name: 'label', title: 'Etiqueta', type: 'string', validation: (Rule) => Rule.required() }),
    defineField({ name: 'href', title: 'URL', type: 'url' }),
    defineField({ name: 'internalHref', title: 'Ruta interna (opcional)', type: 'string', description: 'Usa esto para rutas internas como /tour/..., alternativamente usa URL arriba.' }),
    defineField({ name: 'external', title: 'Abrir en nueva pestaña', type: 'boolean', initialValue: false }),
  ],
  preview: { select: { title: 'label', subtitle: 'href' } },
})

export const menuSeparator = defineType({
  name: 'menuSeparator',
  title: 'Separador',
  type: 'object',
  fields: [
    defineField({ name: 'label', title: 'Etiqueta (opcional)', type: 'string' }),
  ],
  preview: { select: { title: 'label' }, prepare: ({ title }) => ({ title: title || '— separador —' }) },
})

export const menuGroup = defineType({
  name: 'menuGroup',
  title: 'Grupo',
  type: 'object',
  fields: [
    defineField({ name: 'title', title: 'Título', type: 'string', validation: (Rule) => Rule.required() }),
    defineField({ name: 'items', title: 'Enlaces', type: 'array', of: [{ type: 'menuLink' }] }),
  ],
  preview: { select: { title: 'title' } },
})

export default defineType({
  name: 'header',
  title: 'Header',
  type: 'document',
  fields: [
    defineField({ name: 'siteTitle', title: 'Título', type: 'string' }),
    defineField({ name: 'siteSubtitle', title: 'Subtítulo', type: 'string' }),
    defineField({
      name: 'navLinks',
      title: 'Navegación principal',
      type: 'array',
      of: [{ type: 'menuLink' }],
    }),
    defineField({
      name: 'serviciosMenu',
      title: 'Menú Servicios',
      type: 'array',
      of: [
        { type: 'menuLink' },
        { type: 'menuGroup' },
        { type: 'menuSeparator' },
      ],
    }),
  ],
  preview: { select: { title: 'siteTitle', subtitle: 'siteSubtitle', media: 'logo' } },
})
