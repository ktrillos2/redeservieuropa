import { defineType, defineField } from 'sanity'

// Documento de contenido para la sección de traslados (textos y notas de UI)
export default defineType({
  name: 'transfersSectionContent',
  title: 'Sección: Traslados',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Título', type: 'string', initialValue: 'Nuestros Traslados' }),
    defineField({ name: 'subtitle', title: 'Subtítulo', type: 'text', rows: 3, initialValue: 'Tarifas transparentes para todos nuestros servicios de transporte privado en París.' }),
    defineField({ name: 'highlight', title: 'Texto Destacado', type: 'string', description: 'Pequeño texto introductorio o claim.' }),
    defineField({ name: 'footnote', title: 'Nota al pie', type: 'string', initialValue: '⚠️ Precios sujetos a cambios. * Recargo nocturno después de las 21:00: +5€. Equipaje voluminoso (más de 3 maletas de 23 kg): +10€.' }),
    defineField({
      name: 'priceDisclaimer',
      title: '⚠️ Aviso de Precio Sujeto a Cambios',
      type: 'string',
      initialValue: '⚠️ Los precios mostrados son orientativos y pueden estar sujetos a cambios sin previo aviso. Por favor, confirme la tarifa exacta al momento de realizar su reserva.',
      description: 'Mensaje de advertencia sobre cambios en los precios. Se muestra en la sección de tarifas.',
    }),
    defineField({ name: 'cta', title: 'CTA', type: 'object', fields: [
      defineField({ name: 'label', title: 'Etiqueta', type: 'string' }),
      defineField({ name: 'href', title: 'URL', type: 'url' }),
      defineField({ name: 'internalHref', title: 'Ruta interna', type: 'string' }),
    ]}),
    defineField({ name: 'notes', title: 'Notas breves', type: 'array', of: [{ type: 'string' }], description: 'Se muestran como viñetas adicionales.' }),
    defineField({
      name: 'extraCharges',
      title: 'Cargos adicionales',
      type: 'array',
      of: [{
        type: 'object',
        name: 'extraCharge',
        fields: [
          defineField({ name: 'icon', title: 'Icono', type: 'string' }),
          defineField({ name: 'text', title: 'Texto', type: 'string', validation: r => r.required() }),
          defineField({ name: 'price', title: 'Precio (texto)', type: 'string', validation: r => r.required() }),
        ],
        preview: { select: { title: 'text', subtitle: 'price' } }
      }]
    }),

    // TRADUCCIONES
    defineField({
      name: 'translations',
      title: 'Traducciones',
      type: 'object',
      options: { collapsible: true, collapsed: true },
      fields: [
        // INGLÉS
        {
          name: 'en',
          title: 'English',
          type: 'object',
          options: { collapsible: true, collapsed: true },
          fields: [
            defineField({ name: 'title', title: 'Title', type: 'string' }),
            defineField({ name: 'subtitle', title: 'Subtitle', type: 'text', rows: 3 }),
            defineField({ name: 'highlight', title: 'Highlight Text', type: 'string' }),
            defineField({ name: 'footnote', title: 'Footnote', type: 'string' }),
            defineField({ name: 'priceDisclaimer', title: '⚠️ Price Disclaimer', type: 'string', description: 'Warning about price changes shown in the rates section.' }),
            defineField({
              name: 'extraCharges',
              title: 'Additional Charges',
              type: 'array',
              of: [{
                type: 'object',
                fields: [
                  defineField({ name: 'icon', title: 'Icon', type: 'string' }),
                  defineField({ name: 'text', title: 'Text', type: 'string' }),
                  defineField({ name: 'price', title: 'Price (text)', type: 'string' }),
                ],
              }]
            }),
          ],
        },
        // FRANCÉS
        {
          name: 'fr',
          title: 'Français',
          type: 'object',
          options: { collapsible: true, collapsed: true },
          fields: [
            defineField({ name: 'title', title: 'Titre', type: 'string' }),
            defineField({ name: 'subtitle', title: 'Sous-titre', type: 'text', rows: 3 }),
            defineField({ name: 'highlight', title: 'Texte en évidence', type: 'string' }),
            defineField({ name: 'footnote', title: 'Note de bas de page', type: 'string' }),
            defineField({ name: 'priceDisclaimer', title: '⚠️ Avertissement Prix', type: 'string', description: 'Avertissement sur les changements de prix affiché dans la section tarifs.' }),
            defineField({
              name: 'extraCharges',
              title: 'Frais supplémentaires',
              type: 'array',
              of: [{
                type: 'object',
                fields: [
                  defineField({ name: 'icon', title: 'Icône', type: 'string' }),
                  defineField({ name: 'text', title: 'Texte', type: 'string' }),
                  defineField({ name: 'price', title: 'Prix (texte)', type: 'string' }),
                ],
              }]
            }),
          ],
        },
      ],
    }),
  ],
  preview: { select: { title: 'title', subtitle: 'highlight' } }
})
