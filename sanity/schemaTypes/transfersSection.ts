import { defineType, defineField } from 'sanity'

// Nota: El modelo antiguo tenía un singleton 'transfers' con arrays routes/extraCharges/specials.
// Ahora cada traslado es un documento independiente (_type: 'transfers') y
// los cargos adicionales + copy global viven aquí. Evita duplicar datos.

// Documento de contenido para la sección de traslados (textos y notas de UI)
export default defineType({
  name: 'transfersSectionContent',
  title: 'Sección: Traslados',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Título', type: 'string', initialValue: 'Nuestros Traslados' }),
    defineField({ name: 'subtitle', title: 'Subtítulo', type: 'text', rows: 3 }),
    defineField({ name: 'highlight', title: 'Texto Destacado', type: 'string', description: 'Pequeño texto introductorio o claim.' }),
    defineField({ name: 'footnote', title: 'Nota al pie', type: 'string', initialValue: '* Recargo nocturno después de las 21:00: +5€. Equipaje voluminoso (más de 3 maletas de 23Kg): +10€.' }),
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
  ],
  preview: { select: { title: 'title', subtitle: 'highlight' } }
})
