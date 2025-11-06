import { defineType, defineField } from 'sanity'

export const menuLink = defineType({
  name: 'menuLink',
  title: 'Enlace',
  type: 'object',
  fields: [
    defineField({ 
      name: 'label', 
      title: 'Etiqueta', 
      type: 'object',
      fields: [
        defineField({ name: 'es', title: 'Español', type: 'string', validation: (Rule) => Rule.required() }),
        defineField({ name: 'en', title: 'English', type: 'string' }),
        defineField({ name: 'fr', title: 'Français', type: 'string' }),
      ]
    }),
    defineField({ 
      name: 'href', 
      title: 'URL/Ruta', 
      type: 'string',
      description: 'Puede ser URL completa (https://...), ruta interna (/tour/...), o ancla (#contacto)',
      validation: (Rule) => Rule.required()
    }),
    defineField({ 
      name: 'type', 
      title: 'Tipo de enlace', 
      type: 'string',
      options: {
        list: [
          { title: 'Enlace simple', value: 'link' },
          { title: 'Menú desplegable (Tours)', value: 'tours' },
          { title: 'Menú desplegable (Transfers)', value: 'transfers' },
          { title: 'Dropdown personalizado', value: 'dropdown' },
        ]
      },
      initialValue: 'link',
      validation: (Rule) => Rule.required()
    }),
    defineField({ 
      name: 'subItems', 
      title: 'Sub-items (solo para dropdown personalizado)', 
      type: 'array',
      of: [{ type: 'menuLink' }],
      hidden: ({ parent }) => parent?.type !== 'dropdown'
    }),
    defineField({ 
      name: 'external', 
      title: 'Abrir en nueva pestaña', 
      type: 'boolean', 
      initialValue: false,
      hidden: ({ parent }) => parent?.type !== 'link'
    }),
  ],
  preview: { 
    select: { 
      label: 'label.es',
      href: 'href',
      type: 'type'
    },
    prepare: ({ label, href, type }) => ({
      title: label || 'Sin etiqueta',
      subtitle: `${type === 'link' ? '🔗' : type === 'tours' ? '🎭' : type === 'transfers' ? '🚗' : '📁'} ${href || ''}`
    })
  },
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
      title: 'Enlaces de navegación',
      type: 'array',
      of: [{ type: 'menuLink' }],
      description: 'Enlaces principales del header. Usa type="tours" o "transfers" para mostrar listados dinámicos.'
    }),
  ],
  preview: { select: { title: 'siteTitle', subtitle: 'siteSubtitle' } },
})

