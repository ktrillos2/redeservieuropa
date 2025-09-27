const baseStyles = {
  // Paleta corporativa: beige y azul
  bg: '#fff7e9',
  text: '#0e2a36',
  card: '#ffffff',
  border: '#e5ddd0',
  primary: '#0e2a36', // azul profundo
  accent: '#b68c5a',  // beige dorado para botones
}

export function renderBrandEmail({ title, intro, contentHtml, footerNote }: {
  title: string
  intro?: string
  contentHtml: string
  footerNote?: string
}) {
  const { bg, text, card, border, primary, accent } = baseStyles
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || ''
  // Usa EMAIL_LOGO_URL si está; si no, intenta un logo PNG legible; fallback final a favicon
  const logoUrl = process.env.EMAIL_LOGO_URL || `${siteUrl}/placeholder-logo.png`
  return `
  <!doctype html>
  <html>
    <head>
      <meta charset="utf-8"/>
      <meta name="viewport" content="width=device-width, initial-scale=1"/>
      <title>${escapeHtml(title)}</title>
      <style>
        body { margin:0; padding:0; background:${bg}; color:${text}; font-family: 'Helvetica Neue', Arial, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"; }
        .container { max-width:640px; margin:0 auto; padding:24px; }
        .brand { text-align:center; margin: 8px 0 16px; }
  .brand img { display:inline-block; height:64px; }
        .card { background:${card}; border:1px solid ${border}; border-radius:12px; padding:24px; box-shadow:0 1px 3px rgba(0,0,0,0.05); }
        .title { font-family: Georgia, 'Times New Roman', Times, serif; color:${primary}; font-size:22px; margin:0 0 8px; letter-spacing: 0.2px; }
        .subtitle { color:#3b5763; margin:0 0 16px; }
        .button { display:inline-block; background:${accent}; color:#fff; text-decoration:none; padding:10px 16px; border-radius:8px; font-weight:600; }
        .muted { color:#5f7b87; font-size:12px; }
        .hr { border: none; border-top: 1px solid ${border}; margin: 16px 0; }
        .list li { margin-bottom: 6px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="brand">
          <img src="${logoUrl}" alt="Redeservi Europa" />
        </div>
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
    case 'creditcard': return 'Tarjeta'
    case 'paypal': return 'PayPal'
    case 'bancontact': return 'Bancontact'
    case 'ideal': return 'iDEAL'
    case 'banktransfer': return 'Transferencia bancaria'
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
      <li><b>Referencia de pago:</b> ${escapeHtml(params.mollieId)}</li>
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

export function renderClientThanksEmailMulti(params: {
  mollieId: string
  amount?: number | string
  currency?: string
  contact?: { name?: string; email?: string; phone?: string }
  services?: Array<{ type?: string; title?: string; date?: string; time?: string; totalPrice?: number; pickupAddress?: string; dropoffAddress?: string; passengers?: number }>
}) {
  const services = params.services || []
  const itemsHtml = services.map(s => `
    <li>
      <b>Servicio:</b> ${escapeHtml(s.title || 'Reserva')}<br/>
      <b>Tipo:</b> ${escapeHtml(s.type || '\u2014')} 
      <b>Fecha:</b> ${escapeHtml(s.date || '\u2014')} ${escapeHtml(s.time || '')}<br/>
      <b>Recogida:</b> ${escapeHtml(s.pickupAddress || '\u2014')} 
      <b>Destino:</b> ${escapeHtml(s.dropoffAddress || '\u2014')}<br/>
      <b>Pasajeros:</b> ${typeof s.passengers === 'number' ? s.passengers : '\u2014'}<br/>
      <b>Importe:</b> ${typeof s.totalPrice === 'number' ? s.totalPrice + ' \u20ac' : '\u2014'}
    </li>
  `).join('')

  const contentHtml = `
    <p>\u00a1Gracias por tu pago y tu confianza!</p>
    <p>Hemos recibido tu pago y tus reservas han quedado confirmadas.</p>
    <h3>Detalles de tus servicios</h3>
    <ul class="list">
      ${itemsHtml}
    </ul>
    <p><b>Importe total pagado:</b> ${typeof params.amount === 'number' ? params.amount.toFixed(2) : (params.amount || '\u2014')} ${params.currency || 'EUR'}</p>
    <p>Muy pronto nos pondremos en contacto si necesitamos informaci\u00f3n adicional. Si tienes alguna duda, puedes responder directamente a este correo.</p>
  `
  return renderBrandEmail({
    title: '\u00a1Gracias por tu pago!',
    intro: `Hola${params.contact?.name ? ' ' + escapeHtml(params.contact.name) : ''}, gracias por confiar en nosotros.`,
    contentHtml,
    footerNote: 'Equipo de Redeservi Europa'
  })
}

export function renderAdminNewServicesEmailMulti(params: {
  mollieId: string
  amount?: number | string
  currency?: string
  method?: string | null
  requestedMethod?: string | null
  contact?: { name?: string; email?: string; phone?: string }
  services?: Array<{ type?: string; title?: string; date?: string; time?: string; totalPrice?: number; pickupAddress?: string; dropoffAddress?: string; flightNumber?: string; passengers?: number }>
}) {
  const services = params.services || []
  const itemsHtml = services.map(s => `
    <li>
      <b>Servicio:</b> ${escapeHtml(s.title || 'Reserva')}<br/>
      <b>Tipo:</b> ${escapeHtml(s.type || '\u2014')} • <b>Fecha:</b> ${escapeHtml(s.date || '\u2014')} ${escapeHtml(s.time || '')}<br/>
      <b>Recogida:</b> ${escapeHtml(s.pickupAddress || '\u2014')} • <b>Destino:</b> ${escapeHtml(s.dropoffAddress || '\u2014')}<br/>
      <b>Vuelo:</b> ${escapeHtml(s.flightNumber || '\u2014')} • <b>Pasajeros:</b> ${typeof s.passengers === 'number' ? s.passengers : '\u2014'}<br/>
      <b>Importe estimado:</b> ${typeof s.totalPrice === 'number' ? s.totalPrice + ' \u20ac' : '\u2014'}
    </li>
  `).join('')

  const contentHtml = `
    <p><b>Nuevos servicios confirmados</b></p>
    <p>Se ha recibido el pago <b>${escapeHtml(params.mollieId)}</b> y se han confirmado los siguientes servicios:</p>
    <ul class="list">
      ${itemsHtml}
    </ul>
    <p><b>Importe total:</b> ${typeof params.amount === 'number' ? params.amount.toFixed(2) : (params.amount || '\u2014')} ${params.currency || 'EUR'}</p>
  `
  return renderBrandEmail({
    title: `Nuevos servicios confirmados – ${escapeHtml(params.mollieId)}`,
    intro: 'Se ha confirmado un pago y los servicios asociados han quedado registrados.',
    contentHtml,
    footerNote: 'Generado automáticamente'
  })
}

export function renderAdminNewServiceEmail(params: {
  mollieId: string
  amount?: number | string
  currency?: string
  method?: string | null
  requestedMethod?: string | null
  contact?: { name?: string; email?: string; phone?: string }
  service?: { type?: string; title?: string; date?: string; time?: string; totalPrice?: number; pickupAddress?: string; dropoffAddress?: string; flightNumber?: string; passengers?: number }
}) {
  const contentHtml = `
    <p><b>Nuevo servicio confirmado (pago recibido)</b></p>
    <h3>Pago</h3>
    <ul class="list">
      <li><b>Referencia Mollie:</b> ${escapeHtml(params.mollieId)}</li>
      <li><b>Importe:</b> ${typeof params.amount === 'number' ? params.amount.toFixed(2) : (params.amount || '—')} ${params.currency || 'EUR'}</li>
      <li><b>Método final (Mollie):</b> ${paymentMethodLabel(params.method)}</li>
      <li><b>Método solicitado (web):</b> ${params.requestedMethod ? (params.requestedMethod === 'card' ? 'Tarjeta' : params.requestedMethod === 'cash' ? 'Efectivo' : params.requestedMethod === 'paypal' ? 'PayPal' : params.requestedMethod) : '—'}</li>
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
