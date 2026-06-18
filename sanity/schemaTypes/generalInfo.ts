import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'generalInfo',
  title: 'Información General',
  type: 'document',
  fields: [
    defineField({
      name: 'siteTitle',
      title: 'Título del sitio',
      type: 'string',
      validation: (Rule) => Rule.required().min(2),
    }),
    defineField({
      name: 'siteSubtitle',
      title: 'Subtítulo',
      type: 'string',
    }),
    defineField({
      name: 'description',
      title: 'Descripción',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'logo',
      title: 'Logo',
      type: 'image',
      options: { hotspot: true },
      fields: [
        defineField({ name: 'alt', title: 'Texto alternativo', type: 'string' }),
      ],
    }),
    defineField({
      name: 'contact',
      title: 'Contacto',
      type: 'object',
      fields: [
        defineField({ name: 'phone', title: 'Teléfono', type: 'string' }),
  defineField({ name: 'email', title: 'Email', type: 'string', validation: (Rule) => Rule.email() }),
        defineField({ name: 'address', title: 'Dirección', type: 'string' }),
        defineField({ name: 'whatsapp', title: 'WhatsApp (número con código país)', type: 'string' }),
      ],
    }),
    defineField({
      name: 'defaultWhatsAppMessage',
      title: 'Mensaje WhatsApp por defecto',
      type: 'text',
      rows: 2,
    }),
    defineField({
      name: 'socialLinks',
      title: 'Redes sociales',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'platform',
              title: 'Plataforma',
              type: 'string',
              options: {
                list: [
                  { title: 'Facebook', value: 'facebook' },
                  { title: 'Instagram', value: 'instagram' },
                  { title: 'YouTube', value: 'youtube' },
                  { title: 'TikTok', value: 'tiktok' },
                  { title: 'X / Twitter', value: 'x' },
                  { title: 'LinkedIn', value: 'linkedin' },
                  { title: 'WhatsApp', value: 'whatsapp' },
                  { title: 'Telegram', value: 'telegram' },
                  { title: 'Otro', value: 'other' },
                ],
              },
            }),
            defineField({ name: 'label', title: 'Etiqueta', type: 'string' }),
            defineField({ name: 'url', title: 'URL', type: 'url' }),
          ],
          preview: {
            select: { title: 'label', subtitle: 'platform', url: 'url' },
            prepare({ title, subtitle, url }) {
              return { title: title || subtitle || url, subtitle: url }
            },
          },
        },
      ],
    }),
  ],
  preview: {
    select: {
      title: 'siteTitle',
      subtitle: 'siteSubtitle',
      media: 'logo',
    },
    prepare({ title, subtitle, media }) {
      return { title: title || 'Información General', subtitle, media }
    },
  },
})
