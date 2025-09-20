const baseStyles = {
  bg: '#fffdf0',
  text: '#021e29',
  card: '#ffffff',
  border: '#e2e8f0',
  primary: '#021e29',
  accent: '#875417',
}

export function renderBrandEmail({ title, intro, contentHtml, footerNote }: {
  title: string
  intro?: string
  contentHtml: string
  footerNote?: string
}) {
  const { bg, text, card, border, primary, accent } = baseStyles
  return `
  <!doctype html>
  <html>
    <head>
      <meta charset="utf-8"/>
      <meta name="viewport" content="width=device-width, initial-scale=1"/>
      <title>${escapeHtml(title)}</title>
      <style>
        body { margin:0; padding:0; background:${bg}; color:${text}; font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Helvetica Neue, Arial, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"; }
        .container { max-width:640px; margin:0 auto; padding:24px; }
        .card { background:${card}; border:1px solid ${border}; border-radius:8px; padding:24px; }
        .title { font-family: Georgia, 'Times New Roman', Times, serif; color:${primary}; font-size:22px; margin:0 0 8px; }
        .subtitle { color:#475569; margin:0 0 16px; }
        .button { display:inline-block; background:${accent}; color:#fffdf0; text-decoration:none; padding:10px 16px; border-radius:8px; font-weight:600; }
        .muted { color:#475569; font-size:12px; }
        .hr { border: none; border-top: 1px solid ${border}; margin: 16px 0; }
        .list li { margin-bottom: 6px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="card">
          <h1 class="title">${escapeHtml(title)}</h1>
          ${intro ? `<p class="subtitle">${escapeHtml(intro)}</p>` : ''}
          <div>${contentHtml}</div>
          ${footerNote ? `<hr class="hr"/><p class="muted">${escapeHtml(footerNote)}</p>` : ''}
        </div>
      </div>
    </body>
  </html>`
}

function escapeHtml(str: string) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

export function paymentStatusEs(status?: string): string {
  switch ((status || '').toLowerCase()) {
    case 'paid': return 'Pagado'
    case 'pending': return 'Pendiente'
    case 'open': return 'Abierto'
    case 'failed': return 'Fallido'
    case 'canceled': return 'Cancelado'
    case 'expired': return 'Expirado'
    case 'authorized': return 'Autorizado'
    default: return status || 'Desconocido'
  }
}

export function paymentMethodLabel(method?: string | null): string {
  switch ((method || '').toLowerCase()) {
    case 'creditcard': return 'Tarjeta (Mollie)'
    case 'paypal': return 'PayPal (Mollie)'
    case 'bancontact': return 'Bancontact (Mollie)'
    case 'ideal': return 'iDEAL (Mollie)'
    case 'banktransfer': return 'Transferencia bancaria (Mollie)'
    default: return method || '—'
  }
}

export function renderPaymentStatusEmail(params: {
  status: string
  mollieId: string
  amount?: number | string
  currency?: string
  method?: string | null
  requestedMethod?: string | null
  contact?: { name?: string; email?: string; phone?: string }
  service?: { type?: string; title?: string; date?: string; time?: string; totalPrice?: number }
}) {
  const st = paymentStatusEs(params.status)
  const contentHtml = `
    <p>El estado del pago ha cambiado a <b>${st}</b>.</p>
    <ul class="list">
      <li><b>Referencia Mollie:</b> ${escapeHtml(params.mollieId)}</li>
      <li><b>Importe:</b> ${typeof params.amount === 'number' ? params.amount.toFixed(2) : (params.amount || '—')} ${params.currency || 'EUR'}</li>
      <li><b>Método final:</b> ${paymentMethodLabel(params.method)}</li>
      <li><b>Método solicitado (web):</b> ${params.requestedMethod ? (params.requestedMethod === 'card' ? 'Tarjeta' : params.requestedMethod === 'cash' ? 'Efectivo' : params.requestedMethod === 'paypal' ? 'PayPal' : params.requestedMethod) : '—'}</li>
    </ul>
    <h3>Contacto</h3>
    <ul class="list">
      <li><b>Nombre:</b> ${escapeHtml(params.contact?.name || '—')}</li>
      <li><b>Email:</b> ${escapeHtml(params.contact?.email || '—')}</li>
      <li><b>Teléfono:</b> ${escapeHtml(params.contact?.phone || '—')}</li>
    </ul>
    <h3>Servicio</h3>
    <ul class="list">
      <li><b>Tipo:</b> ${escapeHtml(params.service?.type || '—')}</li>
      <li><b>Título:</b> ${escapeHtml(params.service?.title || '—')}</li>
      <li><b>Fecha:</b> ${escapeHtml(params.service?.date || '—')} ${escapeHtml(params.service?.time || '')}</li>
      <li><b>Total estimado:</b> ${typeof params.service?.totalPrice === 'number' ? params.service!.totalPrice + ' €' : '—'}</li>
    </ul>
  `
  return renderBrandEmail({
    title: `Pago – ${st}`,
    intro: 'Actualización de estado de pago para una reserva.',
    contentHtml,
    footerNote: 'Este email se generó automáticamente.'
  })
}

export function renderClientThanksEmail(params: {
  mollieId: string
  amount?: number | string
  currency?: string
  contact?: { name?: string; email?: string; phone?: string }
  service?: { type?: string; title?: string; date?: string; time?: string; totalPrice?: number }
}) {
  const contentHtml = `
    <p>¡Gracias por tu pago y tu confianza!</p>
    <p>Hemos recibido tu pago y tu reserva ha quedado confirmada.</p>
    <h3>Detalles de tu servicio</h3>
    <ul class="list">
      <li><b>Servicio:</b> ${escapeHtml(params.service?.title || 'Reserva')}</li>
      <li><b>Fecha:</b> ${escapeHtml(params.service?.date || '—')} ${escapeHtml(params.service?.time || '')}</li>
      <li><b>Importe pagado:</b> ${typeof params.amount === 'number' ? params.amount.toFixed(2) : (params.amount || '—')} ${params.currency || 'EUR'}</li>
      <li><b>Referencia de pago (Mollie):</b> ${escapeHtml(params.mollieId)}</li>
    </ul>
    <p>Muy pronto nos pondremos en contacto si necesitamos información adicional. Si tienes alguna duda, puedes responder directamente a este correo.</p>
  `
  return renderBrandEmail({
    title: '¡Gracias por tu pago!',
    intro: `Hola${params.contact?.name ? ' ' + escapeHtml(params.contact.name) : ''}, gracias por confiar en nosotros.`,
    contentHtml,
    footerNote: 'Equipo de Redeservi Europa'
  })
}

export function renderAdminNewServiceEmail(params: {
  mollieId: string
  amount?: number | string
  currency?: string
  method?: string | null
  contact?: { name?: string; email?: string; phone?: string }
  service?: { type?: string; title?: string; date?: string; time?: string; totalPrice?: number; pickupAddress?: string; dropoffAddress?: string; flightNumber?: string; passengers?: number }
}) {
  const contentHtml = `
    <p><b>Nuevo servicio confirmado (pago recibido)</b></p>
    <h3>Pago</h3>
    <ul class="list">
      <li><b>Referencia Mollie:</b> ${escapeHtml(params.mollieId)}</li>
      <li><b>Importe:</b> ${typeof params.amount === 'number' ? params.amount.toFixed(2) : (params.amount || '—')} ${params.currency || 'EUR'}</li>
      <li><b>Método:</b> ${paymentMethodLabel(params.method)}</li>
    </ul>
    <h3>Servicio</h3>
    <ul class="list">
      <li><b>Tipo:</b> ${escapeHtml(params.service?.type || '—')}</li>
      <li><b>Título:</b> ${escapeHtml(params.service?.title || '—')}</li>
      <li><b>Fecha:</b> ${escapeHtml(params.service?.date || '—')} ${escapeHtml(params.service?.time || '')}</li>
      <li><b>Pasajeros:</b> ${typeof params.service?.passengers === 'number' ? params.service!.passengers : '—'}</li>
      <li><b>Recogida:</b> ${escapeHtml(params.service?.pickupAddress || '—')}</li>
      <li><b>Destino:</b> ${escapeHtml(params.service?.dropoffAddress || '—')}</li>
      <li><b>Vuelo:</b> ${escapeHtml(params.service?.flightNumber || '—')}</li>
      <li><b>Total estimado:</b> ${typeof params.service?.totalPrice === 'number' ? params.service!.totalPrice + ' €' : '—'}</li>
    </ul>
    <h3>Contacto</h3>
    <ul class="list">
      <li><b>Nombre:</b> ${escapeHtml(params.contact?.name || '—')}</li>
      <li><b>Email:</b> ${escapeHtml(params.contact?.email || '—')}</li>
      <li><b>Teléfono:</b> ${escapeHtml(params.contact?.phone || '—')}</li>
    </ul>
  `
  return renderBrandEmail({
    title: `Nuevo ${params.service?.type || 'servicio'} – ${params.service?.title || ''}`.trim(),
    intro: 'Se ha confirmado un nuevo servicio con pago recibido.',
    contentHtml,
    footerNote: 'Generado automáticamente por la web'
  })
}
