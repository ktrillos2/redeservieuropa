import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'contactSection',
  title: 'Sección: Contáctanos',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Título', type: 'string', initialValue: 'Contáctanos' }),
    defineField({ name: 'subtitle', title: 'Subtítulo', type: 'text', rows: 3, initialValue: 'Estamos disponibles 24/7 para atender tus consultas y reservas.' }),
    defineField({ name: 'formTitle', title: 'Título del formulario', type: 'string', initialValue: 'Envíanos un Mensaje' }),
    defineField({ name: 'formNote', title: 'Nota bajo el formulario', type: 'string' }),
    defineField({ name: 'showWhatsAppButton', title: 'Mostrar botón WhatsApp', type: 'boolean', initialValue: true }),
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
            defineField({ name: 'subtitle', title: 'Subtitle', type: 'text', rows: 3 }),
            defineField({ name: 'formTitle', title: 'Form Title', type: 'string' }),
            defineField({ name: 'formNote', title: 'Form Note', type: 'string' }),
          ],
        }),
        defineField({
          name: 'fr',
          title: 'Français',
          type: 'object',
          fields: [
            defineField({ name: 'title', title: 'Titre', type: 'string' }),
            defineField({ name: 'subtitle', title: 'Sous-titre', type: 'text', rows: 3 }),
            defineField({ name: 'formTitle', title: 'Titre du Formulaire', type: 'string' }),
            defineField({ name: 'formNote', title: 'Note du Formulaire', type: 'string' }),
          ],
        }),
      ],
    }),
  ],
})
