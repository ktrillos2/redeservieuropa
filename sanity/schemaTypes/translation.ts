import { defineField, defineType } from 'sanity'
import { Languages } from 'lucide-react'

export default defineType({
  name: 'translation',
  title: 'Traducciones',
  type: 'document',
  icon: Languages,
  fields: [
    defineField({
      name: 'language',
      title: 'Idioma',
      type: 'string',
      options: {
        list: [
          { title: 'Español', value: 'es' },
          { title: 'English', value: 'en' },
          { title: 'Français', value: 'fr' },
        ],
        layout: 'radio',
      },
      validation: (Rule) => Rule.required(),
    }),
    
    // HEADER
    defineField({
      name: 'header',
      title: 'Header',
      type: 'object',
      options: { collapsible: true, collapsed: true },
      fields: [
        { name: 'services', title: 'Servicios', type: 'string' },
        { name: 'tours', title: 'Tours', type: 'string' },
        { name: 'transfers', title: 'Traslados', type: 'string' },
        { name: 'events', title: 'Eventos', type: 'string' },
        { name: 'testimonials', title: 'Testimonios', type: 'string' },
        { name: 'contact', title: 'Contacto', type: 'string' },
        { name: 'cart', title: 'Mi Cotización', type: 'string' },
      ],
    }),

    // FOOTER
    defineField({
      name: 'footer',
      title: 'Footer',
      type: 'object',
      options: { collapsible: true, collapsed: true },
      fields: [
        { name: 'about', title: 'Sobre nosotros', type: 'string' },
        { name: 'services', title: 'Servicios', type: 'string' },
        { name: 'contact', title: 'Contacto', type: 'string' },
        { name: 'legal', title: 'Legal', type: 'string' },
        { name: 'privacy', title: 'Política de privacidad', type: 'string' },
        { name: 'terms', title: 'Términos y condiciones', type: 'string' },
        { name: 'cookies', title: 'Política de cookies', type: 'string' },
        { name: 'copyright', title: 'Copyright', type: 'string' },
      ],
    }),

    // PÁGINA DE INICIO
    defineField({
      name: 'home',
      title: 'Página de Inicio',
      type: 'object',
      options: { collapsible: true, collapsed: true },
      fields: [
        {
          name: 'hero',
          title: 'Hero',
          type: 'object',
          fields: [
            { name: 'title', title: 'Título', type: 'string' },
            { name: 'subtitle', title: 'Subtítulo', type: 'text' },
            { name: 'cta', title: 'Botón CTA', type: 'string' },
          ],
        },
        {
          name: 'services',
          title: 'Servicios',
          type: 'object',
          fields: [
            { name: 'title', title: 'Título', type: 'string' },
            { name: 'subtitle', title: 'Subtítulo', type: 'string' },
          ],
        },
        {
          name: 'testimonials',
          title: 'Testimonios',
          type: 'object',
          fields: [
            { name: 'title', title: 'Título', type: 'string' },
            { name: 'subtitle', title: 'Subtítulo', type: 'string' },
          ],
        },
        {
          name: 'contact',
          title: 'Contacto',
          type: 'object',
          fields: [
            { name: 'title', title: 'Título', type: 'string' },
            { name: 'subtitle', title: 'Subtítulo', type: 'string' },
            { name: 'name', title: 'Nombre', type: 'string' },
            { name: 'email', title: 'Email', type: 'string' },
            { name: 'phone', title: 'Teléfono', type: 'string' },
            { name: 'message', title: 'Mensaje', type: 'string' },
            { name: 'send', title: 'Botón Enviar', type: 'string' },
            { name: 'success', title: 'Mensaje de éxito', type: 'string' },
            { name: 'error', title: 'Mensaje de error', type: 'string' },
          ],
        },
      ],
    }),

    // FORMULARIO DE RESERVA (BOOKING)
    defineField({
      name: 'booking',
      title: 'Formulario de Reserva',
      type: 'object',
      options: { collapsible: true, collapsed: true },
      fields: [
        { name: 'transferLabel', title: 'Traslado', type: 'string' },
        { name: 'tourLabel', title: 'Tour', type: 'string' },
        { name: 'quotationTransfer', title: 'Cotización Traslado', type: 'string' },
        { name: 'quotationTour', title: 'Cotización Tour', type: 'string' },
        { name: 'quotation', title: 'Cotización Rápida', type: 'string' },
        { name: 'back', title: 'Volver', type: 'string' },
        { name: 'origin', title: 'Origen', type: 'string' },
        { name: 'originPlaceholder', title: 'Placeholder origen', type: 'string' },
        { name: 'destination', title: 'Destino', type: 'string' },
        { name: 'destinationPlaceholder', title: 'Placeholder destino', type: 'string' },
        { name: 'selectOriginFirst', title: 'Seleccione origen primero', type: 'string' },
        { name: 'noDestinations', title: 'No hay destinos', type: 'string' },
        { name: 'date', title: 'Fecha', type: 'string' },
        { name: 'time', title: 'Hora', type: 'string' },
        { name: 'passengers', title: 'Pasajeros', type: 'string' },
        { name: 'children', title: 'Niños', type: 'string' },
        { name: 'vehiclePlaceholder', title: 'Placeholder vehículo', type: 'string' },
        { name: 'car', title: 'Coche', type: 'string' },
        { name: 'minivan', title: 'Minivan', type: 'string' },
        { name: 'van', title: 'Van', type: 'string' },
        { name: 'tourTypePlaceholder', title: 'Placeholder tipo de tour', type: 'string' },
        { name: 'dayTour', title: 'Tour Diurno', type: 'string' },
        { name: 'nightTour', title: 'Tour Nocturno', type: 'string' },
        { name: 'stopoverTour', title: 'Tour de Escala', type: 'string' },
        { name: 'selectTour', title: 'Seleccionar un tour', type: 'string' },
      ],
    }),

    // EVENTOS
    defineField({
      name: 'events',
      title: 'Eventos',
      type: 'object',
      options: { collapsible: true, collapsed: true },
      fields: [
        { name: 'label', title: 'Etiqueta "Eventos"', type: 'string' },
      ],
    }),

    // PÁGINA DE PAGO
    defineField({
      name: 'checkout',
      title: 'Página de Pago',
      type: 'object',
      options: { collapsible: true, collapsed: true },
      fields: [
        { name: 'title', title: 'Título', type: 'string' },
        { name: 'summary', title: 'Resumen de reserva', type: 'string' },
        {
          name: 'contact',
          title: 'Información de contacto',
          type: 'object',
          fields: [
            { name: 'title', title: 'Título', type: 'string' },
            { name: 'name', title: 'Nombre', type: 'string' },
            { name: 'namePlaceholder', title: 'Placeholder nombre', type: 'string' },
            { name: 'email', title: 'Email', type: 'string' },
            { name: 'emailPlaceholder', title: 'Placeholder email', type: 'string' },
            { name: 'phone', title: 'Teléfono', type: 'string' },
            { name: 'phonePlaceholder', title: 'Placeholder teléfono', type: 'string' },
            { name: 'referral', title: '¿Cómo nos conociste?', type: 'string' },
          ],
        },
        {
          name: 'service',
          title: 'Servicio',
          type: 'object',
          fields: [
            { name: 'type', title: 'Tipo', type: 'string' },
            { name: 'date', title: 'Fecha', type: 'string' },
            { name: 'time', title: 'Hora', type: 'string' },
            { name: 'passengers', title: 'Pasajeros', type: 'string' },
            { name: 'children', title: 'Niños', type: 'string' },
            { name: 'childrenAges', title: 'Edades de los niños', type: 'string' },
            { name: 'pickup', title: 'Recogida', type: 'string' },
            { name: 'dropoff', title: 'Destino', type: 'string' },
            { name: 'flight', title: 'Número de vuelo', type: 'string' },
            { name: 'luggage23kg', title: 'Maletas 23kg', type: 'string' },
            { name: 'luggage10kg', title: 'Maletas 10kg', type: 'string' },
            { name: 'notes', title: 'Notas adicionales', type: 'string' },
            { name: 'total', title: 'Total del servicio', type: 'string' },
            { name: 'deposit', title: 'Pagar ahora', type: 'string' },
            { name: 'remaining', title: 'Saldo pendiente', type: 'string' },
            { name: 'edit', title: 'Editar servicio', type: 'string' },
            { name: 'remove', title: 'Eliminar servicio', type: 'string' },
          ],
        },
        {
          name: 'payment',
          title: 'Método de pago',
          type: 'object',
          fields: [
            { name: 'title', title: 'Título', type: 'string' },
            { name: 'method', title: 'Selecciona método de pago', type: 'string' },
            { name: 'total', title: 'Total a pagar', type: 'string' },
            { name: 'depositInfo', title: 'Info depósito (usa {{percent}})', type: 'string' },
            { name: 'processing', title: 'Procesando pago...', type: 'string' },
            { name: 'continue', title: 'Botón continuar', type: 'string' },
          ],
        },
        {
          name: 'cart',
          title: 'Carrito',
          type: 'object',
          fields: [
            { name: 'empty', title: 'Carrito vacío', type: 'string' },
            { name: 'addService', title: 'Añadir servicio', type: 'string' },
            { name: 'total', title: 'Total', type: 'string' },
          ],
        },
      ],
    }),

    // PÁGINA DE GRACIAS
    defineField({
      name: 'thanks',
      title: 'Página de Gracias',
      type: 'object',
      options: { collapsible: true, collapsed: true },
      fields: [
        { name: 'title', title: 'Título éxito', type: 'string' },
        { name: 'titlePending', title: 'Título pendiente', type: 'string' },
        { name: 'description', title: 'Descripción éxito', type: 'text' },
        { name: 'descriptionPending', title: 'Descripción pendiente', type: 'text' },
        {
          name: 'payment',
          title: 'Pago',
          type: 'object',
          fields: [
            { name: 'title', title: 'Título', type: 'string' },
            { name: 'provider', title: 'Proveedor', type: 'string' },
            { name: 'status', title: 'Estado', type: 'string' },
            { name: 'amountPaid', title: 'Importe pagado', type: 'string' },
            { name: 'amountTotal', title: 'Importe total', type: 'string' },
            { name: 'currency', title: 'Moneda', type: 'string' },
            { name: 'method', title: 'Método', type: 'string' },
            { name: 'reference', title: 'Referencia', type: 'string' },
          ],
        },
        {
          name: 'contact',
          title: 'Contacto',
          type: 'object',
          fields: [
            { name: 'title', title: 'Título', type: 'string' },
            { name: 'name', title: 'Nombre', type: 'string' },
            { name: 'phone', title: 'Teléfono', type: 'string' },
            { name: 'email', title: 'Email', type: 'string' },
            { name: 'referral', title: '¿Dónde nos conociste?', type: 'string' },
          ],
        },
        {
          name: 'services',
          title: 'Servicios',
          type: 'object',
          fields: [
            { name: 'title', title: 'Título', type: 'string' },
            { name: 'type', title: 'Tipo', type: 'string' },
            { name: 'date', title: 'Fecha', type: 'string' },
            { name: 'time', title: 'Hora', type: 'string' },
            { name: 'passengers', title: 'Pasajeros', type: 'string' },
            { name: 'children', title: 'Niños', type: 'string' },
            { name: 'childrenAges', title: 'Edades de los niños', type: 'string' },
            { name: 'pickup', title: 'Recogida', type: 'string' },
            { name: 'dropoff', title: 'Destino', type: 'string' },
            { name: 'flight', title: 'Vuelo', type: 'string' },
            { name: 'luggage23kg', title: 'Maletas 23kg', type: 'string' },
            { name: 'luggage10kg', title: 'Maletas 10kg', type: 'string' },
            { name: 'notes', title: 'Notas', type: 'string' },
            { name: 'total', title: 'Total del servicio', type: 'string' },
            { name: 'paid', title: 'Pagado ahora (usa {{percent}})', type: 'string' },
            { name: 'remaining', title: 'Saldo pendiente', type: 'string' },
          ],
        },
        { name: 'backToHome', title: 'Volver al inicio', type: 'string' },
      ],
    }),

    // COMUNES
    defineField({
      name: 'common',
      title: 'Textos Comunes',
      type: 'object',
      options: { collapsible: true, collapsed: true },
      fields: [
        { name: 'loading', title: 'Cargando...', type: 'string' },
        { name: 'error', title: 'Error', type: 'string' },
        { name: 'close', title: 'Cerrar', type: 'string' },
        { name: 'cancel', title: 'Cancelar', type: 'string' },
        { name: 'confirm', title: 'Confirmar', type: 'string' },
        { name: 'save', title: 'Guardar', type: 'string' },
        { name: 'edit', title: 'Editar', type: 'string' },
        { name: 'delete', title: 'Eliminar', type: 'string' },
        { name: 'search', title: 'Buscar', type: 'string' },
        { name: 'back', title: 'Volver', type: 'string' },
        { name: 'next', title: 'Siguiente', type: 'string' },
        { name: 'previous', title: 'Anterior', type: 'string' },
        { name: 'submit', title: 'Enviar', type: 'string' },
        { name: 'yes', title: 'Sí', type: 'string' },
        { name: 'no', title: 'No', type: 'string' },
      ],
    }),
  ],
  preview: {
    select: {
      language: 'language',
    },
    prepare({ language }) {
      const languageNames = {
        es: '🇪🇸 Español',
        en: '🇬🇧 English',
        fr: '🇫🇷 Français',
      }
      return {
        title: languageNames[language as keyof typeof languageNames] || language,
        subtitle: 'Traducciones del sitio',
      }
    },
  },
})
