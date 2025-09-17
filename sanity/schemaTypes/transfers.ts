import { defineType, defineField } from 'sanity'

export const transferRoute = defineType({
  name: 'transferRoute',
  title: 'Ruta de traslado',
  type: 'object',
  fields: [
    defineField({ name: 'from', title: 'Desde', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'to', title: 'Hasta', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'price', title: 'Precio (texto, ej: 65€ o 65€/h)', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'description', title: 'Descripción', type: 'string' }),
    defineField({ name: 'duration', title: 'Duración', type: 'string' }),
    defineField({ name: 'popular', title: 'Popular', type: 'boolean', initialValue: false }),
    defineField({ name: 'icon', title: 'Icono (opcional)', type: 'string', description: 'plane | map-pin | clock' }),
  ],
})

export const extraCharge = defineType({
  name: 'extraCharge',
  title: 'Cargo adicional',
  type: 'object',
  fields: [
    defineField({ name: 'icon', title: 'Icono', type: 'string' }),
    defineField({ name: 'text', title: 'Texto', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'price', title: 'Precio (texto)', type: 'string', validation: (r) => r.required() }),
  ],
})

export const specialTransfer = defineType({
  name: 'specialTransfer',
  title: 'Traslado especial',
  type: 'object',
  fields: [
    defineField({ name: 'title', title: 'Título', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'subtitle', title: 'Subtítulo', type: 'string' }),
    defineField({ name: 'price', title: 'Precio (texto)', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'icon', title: 'Icono', type: 'string' }),
    defineField({ name: 'notes', title: 'Notas', type: 'string' }),
  ],
})

export default defineType({
  name: 'transfers',
  title: 'Traslados (Sección)',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Título', type: 'string', initialValue: 'Nuestros Traslados' }),
    defineField({ name: 'subtitle', title: 'Subtítulo', type: 'text', rows: 3 }),
    defineField({ name: 'routes', title: 'Rutas', type: 'array', of: [{ type: transferRoute.name }] }),
    defineField({ name: 'extraCharges', title: 'Cargos adicionales', type: 'array', of: [{ type: extraCharge.name }] }),
    defineField({ name: 'specials', title: 'Traslados especiales', type: 'array', of: [{ type: specialTransfer.name }] }),
    defineField({ name: 'footnote', title: 'Nota al pie', type: 'string' }),
  ],
})
