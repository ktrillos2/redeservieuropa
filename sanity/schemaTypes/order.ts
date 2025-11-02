import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'order',
  title: 'Pedidos',
  type: 'document',
  fields: [
    defineField({
      name: 'whatsappTemplateKey',
      title: 'Plantilla WhatsApp (opcional)',
      type: 'reference',
      to: [{ type: 'whatsappTemplate' }],
      description: 'Selecciona una plantilla para generar un enlace rápido de WhatsApp.'
    }),

    defineField({
      name: 'orderNumber',
      title: 'Número de pedido',
      type: 'string',
      description: 'Identificador legible del pedido (ej: RSE-250101-1430-ABCD)'
    }),

    defineField({
      name: 'status',
      title: 'Estado',
      type: 'string',
      options: {
        list: [
          { title: 'Nuevo', value: 'new' },
          { title: 'Pendiente de pago', value: 'pending' },
          { title: 'Pagado', value: 'paid' },
          { title: 'En proceso', value: 'processing' },
          { title: 'Completado', value: 'completed' },
          { title: 'Cancelado', value: 'cancelled' },
          { title: 'Fallido', value: 'failed' },
        ],
        layout: 'radio'
      },
      initialValue: 'new'
    }),

    defineField({
      name: 'payment',
      title: 'Pago',
      type: 'object',
      options: { collapsible: true, collapsed: true },
      fields: [
        defineField({ name: 'provider', title: 'Proveedor', type: 'string' }),
        defineField({ name: 'paymentId', title: 'ID de pago', type: 'string' }),
        defineField({ name: 'status', title: 'Estado de pago', type: 'string' }),
        defineField({ name: 'amount', title: 'Importe', type: 'number' }),
        defineField({ name: 'currency', title: 'Moneda', type: 'string', initialValue: 'EUR' }),
        defineField({
          name: 'requestedMethod',
          title: 'Método solicitado (web)',
          type: 'string',
          description: 'Preferencia elegida en la web (no forzada en Mollie).'
        }),
        defineField({ name: 'method', title: 'Método', type: 'string' }),
        defineField({ name: 'createdAt', title: 'Creado en', type: 'datetime' }),
        defineField({ name: 'paidAt', title: 'Pagado en', type: 'datetime' }),
        defineField({
          name: 'payFullNow',
          title: 'Pago completo ahora',
          type: 'boolean',
          description: 'Si el cliente pagó el 100% en lugar de depósito.'
        }),
        defineField({
          name: 'depositPercent',
          title: 'Porcentaje de depósito',
          type: 'number',
          description: 'Porcentaje cobrado ahora (ej: 10 para traslado, 20 para tour).',
          validation: (r) => r.min(0).max(100)
        }),
        defineField({ name: 'raw', title: 'Datos sin procesar (JSON)', type: 'text', rows: 6 }),
      ]
    }),

    defineField({
      name: 'calendar',
      title: 'Google Calendar',
      type: 'object',
      options: { collapsible: true, collapsed: true },
      fields: [
        defineField({ name: 'eventId', type: 'string', title: 'Event ID' }),
        defineField({ name: 'htmlLink', type: 'url', title: 'Event Link' }),
        defineField({ name: 'createdAt', type: 'datetime', title: 'Creado en' }),
      ],
    }),

    defineField({
      name: 'contact',
      title: 'Contacto',
      type: 'object',
      options: { collapsible: true, collapsed: true },
      fields: [
        defineField({ name: 'name', title: 'Nombre', type: 'string' }),
        defineField({ name: 'email', title: 'Email', type: 'string' }),
        defineField({ name: 'phone', title: 'Teléfono', type: 'string' }),
        defineField({ name: 'referralSource', title: '¿Dónde nos conociste?', type: 'string' }),
      ]
    }),

    // 👇 Array de servicios (múltiples servicios en una sola orden)
    defineField({
      name: 'services',
      title: 'Servicios',
      type: 'array',
      of: [{
        type: 'object',
        fields: [
          defineField({ name: 'type', title: 'Tipo', type: 'string', description: 'traslado | tour | evento' }),
          defineField({ name: 'title', title: 'Título/Label', type: 'string' }),
          defineField({ name: 'date', title: 'Fecha', type: 'date' }),
          defineField({ name: 'time', title: 'Hora', type: 'string' }),
          defineField({ name: 'passengers', title: 'Pasajeros / Cupos', type: 'number' }),

          defineField({ name: 'pickupAddress', title: 'Dirección de recogida', type: 'string' }),
          defineField({ name: 'dropoffAddress', title: 'Dirección de destino', type: 'string' }),

          defineField({ name: 'flightNumber', title: 'Número de vuelo', type: 'string' }),

          defineField({ name: 'luggage23kg', title: 'Maletas 23kg', type: 'number' }),
          defineField({ name: 'luggage10kg', title: 'Maletas 10kg', type: 'number' }),
          defineField({
            name: 'ninos',
            title: 'Niños (0-12)',
            type: 'number',
            validation: (r) => r.min(0)
          }),
          defineField({
            name: 'ninosMenores9',
            title: 'Niños menores de 9 años',
            type: 'number',
            validation: (r) => r.min(0)
          }),

          defineField({ name: 'isNightTime', title: 'Recargo nocturno', type: 'boolean' }),
          defineField({ name: 'totalPrice', title: 'Total calculado', type: 'number' }),

          defineField({
            name: 'payFullNow',
            title: 'Pago completo ahora (servicio)',
            type: 'boolean',
            description: 'Si este servicio se pagó al 100% en vez de depósito.'
          }),
          defineField({
            name: 'depositPercent',
            title: 'Porcentaje de depósito (servicio)',
            type: 'number',
            description: 'Porcentaje cobrado ahora. Auto-calculado: 10% traslado, 20% tour, 15% evento.',
            validation: (r) => r.min(0).max(100),
            readOnly: false
          }),

          defineField({ name: 'notes', title: 'Notas del cliente', type: 'text' }),
        ],
        preview: {
          select: {
            type: 'type',
            title: 'title',
            date: 'date',
            price: 'totalPrice'
          },
          prepare({ type, title, date, price }) {
            return {
              title: title || type || 'Servicio',
              subtitle: `${date || '—'} | ${price ? `€${price}` : '—'}`
            }
          }
        }
      }]
    }),

    defineField({
      name: 'metadata',
      title: 'Metadatos',
      type: 'object',
      options: { collapsible: true, collapsed: true },
      fields: [
        defineField({ name: 'source', title: 'Fuente', type: 'string' }),
        defineField({ name: 'createdAt', title: 'Creado en', type: 'datetime' }),
        defineField({ name: 'updatedAt', title: 'Actualizado en', type: 'datetime' }),
      ]
    }),
  ],

  preview: {
    select: {
      title: 'orderNumber',
      status: 'status',
      amount: 'payment.amount',
      servicesCount: 'services',
      name: 'contact.name',
    },
    prepare({ title, status, amount, servicesCount, name }) {
      const who = name || 'Cliente'
      const amt = typeof amount === 'number' && Number.isFinite(amount) ? `€${amount.toFixed(2)}` : '€0.00'
      const count = Array.isArray(servicesCount) ? servicesCount.length : 0
      const st = (() => {
        switch (status) {
          case 'new': return '🆕'
          case 'pending': return '⏳'
          case 'paid': return '✅'
          case 'processing': return '🔄'
          case 'completed': return '✔️'
          case 'cancelled': return '❌'
          case 'failed': return '⚠️'
          default: return '❓'
        }
      })()
      return {
        title: `${st} ${who} – ${amt}`,
        subtitle: `${title || 'Sin número'} | ${count} servicio${count !== 1 ? 's' : ''}`
      }
    }
  }
})

export const orderName = 'order'
