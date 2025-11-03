  // lib/email-templates.ts

  const baseStyles = {
    bg: '#fff7e9',
    text: '#0e2a36',
    card: '#ffffff',
    border: '#e5ddd0',
    primary: '#0e2a36',
    accent: '#b68c5a',
  }

  function overallTag(services?: Array<{ type?: string }>) {
    const list = services || []
    const hasTour = list.some(s => (s?.type || '').toLowerCase() === 'tour')
    const hasTras = list.some(s => (s?.type || '').toLowerCase() === 'traslado')
    const hasEvt  = list.some(s => (s?.type || '').toLowerCase() === 'evento')
    const kinds = [hasTour, hasTras, hasEvt].filter(Boolean).length
    if (kinds > 1) return 'SERVICIOS' // mixto
    if (hasTour) return 'TOUR'
    if (hasTras) return 'TRASLADO'
    if (hasEvt)  return 'EVENTO'
    return 'SERVICIOS'
  }

  function absLogoUrl(): string {
    const site = (process.env.NEXT_PUBLIC_SITE_URL || '').replace(/\/+$/, '')
    const envLogo = process.env.EMAIL_LOGO_URL && process.env.EMAIL_LOGO_URL.startsWith('http')
      ? process.env.EMAIL_LOGO_URL
      : null
    if (envLogo) return envLogo
    if (site) return `${site}/images/logo.png`
    // Fallback a una imagen “dummy” pública y absoluta para evitar roturas
    return 'https://via.placeholder.com/200x60?text=Redeservi+Europa'
  }

  export function renderBrandEmail({ title, intro, contentHtml, footerNote }: {
    title: string
    intro?: string
    contentHtml: string
    footerNote?: string
  }) {
    const { bg, text, card, border, primary, accent } = baseStyles
    const logoUrl = absLogoUrl()
    return `
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <title>${escapeHtml(title)}</title>
        <style>
          body { margin:0; padding:0; background:${bg}; color:${text}; font-family: -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; }
          .container { max-width:640px; margin:0 auto; padding:24px; }
          .brand { text-align:center; margin: 8px 0 16px; }
          .brand img { display:inline-block; max-height:64px; height:auto; width:auto; }
          .card { background:${card}; border:1px solid ${border}; border-radius:12px; padding:24px; box-shadow:0 1px 3px rgba(0,0,0,0.05); }
          .title { color:${primary}; font-size:22px; margin:0 0 8px; letter-spacing: 0.2px; }
          .subtitle { color:#3b5763; margin:0 0 16px; }
          .button { display:inline-block; background:${accent}; color:#fff; text-decoration:none; padding:10px 16px; border-radius:8px; font-weight:600; }
          .muted { color:#5f7b87; font-size:12px; }
          .hr { border: none; border-top: 1px solid ${border}; margin: 16px 0; }
          .list { padding-left: 20px; }
          .list li { margin-bottom: 6px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="brand">
            <img src="${logoUrl}" alt="Redeservi Europa" width="200" height="60"/>
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

  /** ========= Depósito por tipo =========
   *  - tour -> 20%
   *  - traslado -> 10%
   *  - evento -> 20% (por defecto)
   *  - payFullNow -> 100%
   */
  function depositPercentFor(type?: string, payFullNow?: boolean, explicit?: number | null): number {
    if (payFullNow) return 100
    if (typeof explicit === 'number' && explicit >= 0 && explicit <= 100) return explicit
    const t = (type || '').toLowerCase()
    if (t === 'traslado') return 10
    if (t === 'tour') return 20
    return 20 // evento/otros
  }

  function round1(n: number) { return Math.round(n * 10) / 10 }

  function tagServicio(type?: string) {
    const t = (type || '').toLowerCase()
    if (t === 'traslado') return 'TRASLADO'
    if (t === 'tour') return 'TOUR'
    if (t === 'evento') return 'EVENTO'
    return 'SERVICIO'
  }

  /** ============ Email CLIENTE (múltiples) ============ */
  export function renderClientThanksEmailMulti(params: {
    mollieId: string
    amount?: number | string
    currency?: string
    contact?: { name?: string; email?: string; phone?: string; referralSource?: string }
    services?: Array<{
      type?: string; title?: string; date?: string; time?: string;
      totalPrice?: number; pickupAddress?: string; dropoffAddress?: string;
      passengers?: number; ninos?: number; ninosMenores9?: string; payFullNow?: boolean; depositPercent?: number | null
    }>
  }) {
    const services = params.services || []
    const itemsHtml = services.map(s => {
      const total = Number(s.totalPrice || 0)
      const percent = depositPercentFor(s.type, s.payFullNow, s.depositPercent ?? null)
      const paidNow = round1(total * (percent / 100))
      const tag = tagServicio(s.type)

      return `
        <li>
          <b>[${tag}]</b> ${escapeHtml(s.title || 'Reserva')}<br/>
          <b>Fecha:</b> ${escapeHtml(s.date || '\u2014')} ${escapeHtml(s.time || '')}<br/>
          <b>Recogida:</b> ${escapeHtml(s.pickupAddress || '\u2014')} • <b>Destino:</b> ${escapeHtml(s.dropoffAddress || '\u2014')}<br/>
          <b>Pasajeros:</b> ${typeof s.passengers === 'number' ? s.passengers : '\u2014'}${typeof s.ninos === 'number' && s.ninos > 0 ? ` (${s.ninos} niños)` : ''}${s.ninosMenores9 ? ` • <b>Edades de los niños:</b> ${escapeHtml(s.ninosMenores9)}` : ''}<br/>
          <b>Total:</b> ${total.toFixed(2)} € • <b>${percent === 100 ? 'Pagado' : `Pagado (${percent}%)`}:</b> ${paidNow.toFixed(1)} €
        </li>
      `
    }).join('')

    const totalSum = services.reduce((acc, s) => acc + (s.totalPrice || 0), 0)
    const contentHtml = `
      <p>¡Gracias por tu pago y tu confianza!</p>
      <p>Hemos recibido tu pago y tus reservas han quedado confirmadas.</p>
      <h3>Servicios contratados</h3>
      <ul class="list">
        ${itemsHtml}
      </ul>
      <p><b>Total de servicios:</b> ${totalSum.toFixed(2)} ${params.currency || 'EUR'}</p>
    `
    
    return renderBrandEmail({
      title: '¡Gracias por tu pago!',
      intro: `Hola${params.contact?.name ? ' ' + escapeHtml(params.contact.name) : ''}, gracias por confiar en nosotros.`,
      contentHtml,
      footerNote: 'Equipo de Redeservi Europa'
    })
  }

  /** ============ Email ADMIN (múltiples) ============ */
  export function renderAdminNewServicesEmailMulti(params: {
    mollieId: string
    amount?: number | string
    currency?: string
    method?: string | null
    requestedMethod?: string | null
    contact?: { name?: string; email?: string; phone?: string; referralSource?: string }
    services?: Array<{
      type?: string; title?: string; date?: string; time?: string;
      totalPrice?: number; pickupAddress?: string; dropoffAddress?: string;
      flightNumber?: string;
      luggage23kg?: number; luggage10kg?: number;
      passengers?: number; ninos?: number; ninosMenores9?: string; payFullNow?: boolean; depositPercent?: number | null
    }>
  }) {
    const services = params.services || []
    
    // Determinar el título según la cantidad de servicios
    const isMultiple = services.length > 1
    const title = isMultiple ? 'Resumen de reservas' : tagServicio(services[0]?.type)

    const itemsHtml = services.map((s, idx) => {
      const total = Number(s.totalPrice || 0)
      const percent = depositPercentFor(s.type, s.payFullNow, s.depositPercent ?? null)
      const paidNow = round1(total * (percent / 100))
      const tag = tagServicio(s.type)

      // ✈️ Linea de vuelo solo si hay número de vuelo
        const flightLine = s.flightNumber 
          ? `<b>Vuelo:</b> ${escapeHtml(s.flightNumber)}`
          : ''

      // 🧳 Linea de maletas si hay alguna
      const luggageLine =
        (Number(s.luggage23kg || 0) > 0 || Number(s.luggage10kg || 0) > 0)
          ? `<b>Maletas:</b> 23kg x ${Number(s.luggage23kg || 0)} • 10kg x ${Number(s.luggage10kg || 0)}`
          : ''

      return `
        <li>
          ${isMultiple ? `<b>Servicio ${idx + 1}:</b> ` : ''}<b>[${tag}]</b> ${escapeHtml(s.title || 'Reserva')}<br/>
          <b>Fecha:</b> ${escapeHtml(s.date || '\u2014')} ${escapeHtml(s.time || '')}<br/>
          <b>Recogida:</b> ${escapeHtml(s.pickupAddress || '\u2014')} • <b>Destino:</b> ${escapeHtml(s.dropoffAddress || '\u2014')}<br/>
          ${flightLine ? `${flightLine}<br/>` : ''}
          ${luggageLine ? `${luggageLine}<br/>` : ''}
          <b>Pasajeros:</b> ${typeof s.passengers === 'number' ? s.passengers : '\u2014'}${typeof s.ninos === 'number' && s.ninos > 0 ? ` (${s.ninos} niños)` : ''}${s.ninosMenores9 ? ` • <b>Menores de 9 años:</b> ${escapeHtml(s.ninosMenores9)}` : ''}<br/>
          <b>Total:</b> ${total.toFixed(2)} € • <b>${percent === 100 ? 'Pagado' : `Pagado (${percent}%)`}:</b> ${paidNow.toFixed(1)} €
        </li>
      `
    }).join('')

    const totalSum = services.reduce((acc, s) => acc + (s.totalPrice || 0), 0)

    // 👇 "¿Cómo nos conoció?" ahora sí llega por contact.referralSource (o en su defecto podría venir en service.referralSource)
    const contactBlock = params.contact ? `
      <h3>Contacto</h3>
      <ul class="list">
        <li><b>Nombre:</b> ${escapeHtml(params.contact.name || '—')}</li>
        <li><b>Email:</b> ${escapeHtml(params.contact.email || '—')}</li>
        <li><b>Teléfono:</b> ${escapeHtml(params.contact.phone || '—')}</li>
        <li><b>¿Cómo nos conoció?</b> ${escapeHtml(params.contact.referralSource || '—')}</li>
      </ul>
    ` : ''

    const contentHtml = `
      <p><b>${isMultiple ? 'Nuevas reservas confirmadas' : 'Nueva reserva confirmada'}</b></p>
      <ul class="list">
        ${itemsHtml}
      </ul>
      <p><b>Total de servicios:</b> ${totalSum.toFixed(2)} ${params.currency || 'EUR'}</p>
      ${contactBlock}
    `
    return renderBrandEmail({
      title: `[${title}] ${isMultiple ? 'Nuevas reservas confirmadas' : 'Nueva reserva confirmada'}`,
      intro: 'Se ha confirmado un pago y los servicios asociados han quedado registrados.',
      contentHtml,
      footerNote: 'Generado automáticamente'
    })
  }
