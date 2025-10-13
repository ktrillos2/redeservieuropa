import { defineType, defineField } from 'sanity'

// Nuevo modelo: cada traslado es un documento independiente, similar a tours.
// El contenido global (textos, extraCharges) se mantiene en transfersSectionContent.

export default defineType({
  name: 'transfers',
  title: 'Traslado',
  type: 'document',
  fields: [
    defineField({ name: 'from', title: 'Desde', type: 'string', validation: r => r.required() }),
    defineField({ name: 'to', title: 'Hasta', type: 'string', validation: r => r.required() }),
  defineField({ name: 'briefInfo', title: 'Información breve', type: 'text', rows: 4, description: 'Texto breve o detalles clave que se mostrarán con un tooltip en la cotización.' }),
    // NUEVO: Solo el selector de requiere info de vuelo
    defineField({
      name: 'requireFlightInfo',
      title: '¿Requiere info de vuelo?',
      type: 'boolean',
      initialValue: false,
      description: 'Activa esto si el traslado inicia o termina en un aeropuerto. El cliente deberá ingresar la info de vuelo al reservar.'
    }),
    defineField({
      name: 'requireFlightNumber',
      title: 'Obligar número de vuelo',
      type: 'boolean',
      description: 'Si está activo, se requerirá número de vuelo al reservar este traslado.',
      initialValue: false,
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      description: 'Generado automáticamente a partir de Desde y Hasta. Puede ajustarse manualmente si es necesario.',
      options: {
        source: (doc:any) => `${(doc.from||'').toString()}-${(doc.to||'').toString()}`,
        slugify: (input:string) => input
          .toLowerCase()
          .normalize('NFD')
          .replace(/\p{Diacritic}/gu, '')
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '')
          .slice(0, 80)
      },
      validation: r => r.required()
    }),
    defineField({ name: 'price', title: 'Precio (texto, ej: 65€ o 65€/h)', type: 'string', validation: r => r.required() }),
    defineField({ name: 'description', title: 'Descripción', type: 'string' }),
    defineField({ name: 'duration', title: 'Duración', type: 'string' }),
    defineField({ name: 'popular', title: 'Popular', type: 'boolean', initialValue: false }),
    defineField({ name: 'icon', title: 'Icono', type: 'string', description: 'plane | map-pin | clock', options: { list: [ {title:'Avión', value:'plane'}, {title:'Mapa', value:'map-pin'}, {title:'Reloj', value:'clock'} ] } }),
    defineField({ name: 'isSpecial', title: 'Es traslado especial', type: 'boolean', initialValue: false }),
    defineField({ name: 'subtitle', title: 'Subtítulo (especial)', type: 'string', hidden: ({ parent }) => !parent?.isSpecial }),
    defineField({ name: 'notes', title: 'Notas (especial)', type: 'string', hidden: ({ parent }) => !parent?.isSpecial }),
    defineField({ name: 'order', title: 'Orden', type: 'number', description: 'Para ordenar manualmente (menor primero)' }),
  ],
  preview: {
    select: { from: 'from', to: 'to', price: 'price', special: 'isSpecial' },
    prepare: ({ from, to, price, special }) => ({
      title: `${from || '?'} → ${to || '?'}`,
      subtitle: `${price || ''}${special ? ' (Especial)' : ''}`
    })
  }
})

