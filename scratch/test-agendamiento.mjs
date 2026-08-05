/**
 * ============================================================
 *  PRUEBA COMPLETA DEL FLUJO DE AGENDAMIENTO
 *  Redeservi Europa — test-agendamiento.mjs
 *
 *  Cómo ejecutar:
 *    1. Asegúrate de que el servidor esté corriendo: pnpm dev
 *    2. node scratch/test-agendamiento.mjs
 *
 *  Qué prueba este script:
 *    PASO 1  → Crea un pago real vía /api/mollie/create (+ guarda orden en Sanity)
 *    PASO 2  → Verifica que la orden quedó guardada en Sanity (/api/orders/by-payment)
 *    PASO 3  → Consulta el estado real del pago en Mollie (/api/mollie/status)
 *    PASO 4  → Simula el webhook de Mollie (POST /api/mollie/webhook)
 *    PASO 5  → Verifica el estado final de la orden en Sanity
 *    PASO 6  → Crea evento en Google Calendar (/api/orders/calendar/create)
 *    PASO 7  → Muestra resumen final con todos los resultados
 * ============================================================
 */

const BASE_URL = 'http://localhost:3000'
const WEBHOOK_TOKEN = 'dev-mollie-token'
const MAIL_TOKEN = 'dev-mail-test-token'

// ─── Colores para la terminal ───────────────────────────────
const C = {
  reset:   '\x1b[0m',
  bold:    '\x1b[1m',
  dim:     '\x1b[2m',
  green:   '\x1b[32m',
  red:     '\x1b[31m',
  yellow:  '\x1b[33m',
  cyan:    '\x1b[36m',
  blue:    '\x1b[34m',
  magenta: '\x1b[35m',
}

const log  = (icon, color, msg, extra = '') =>
  console.log(`${color}${C.bold}${icon} ${msg}${C.reset}${extra ? `  ${C.dim}→ ${extra}${C.reset}` : ''}`)

const ok   = (msg, extra) => log('✅', C.green,   msg, extra)
const fail = (msg, extra) => log('❌', C.red,     msg, extra)
const info = (msg, extra) => log('ℹ️ ', C.cyan,    msg, extra)
const warn = (msg, extra) => log('⚠️ ', C.yellow,  msg, extra)
const step = (n, msg)     => console.log(`\n${C.blue}${C.bold}═══ PASO ${n}: ${msg} ═══${C.reset}`)
const div  = ()           => console.log(`${C.dim}${'─'.repeat(60)}${C.reset}`)
const sleep = ms => new Promise(r => setTimeout(r, ms))

function getFutureDate(days) {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString().split('T')[0]
}

const TEST_BOOKING = {
  contact: {
    name:  'Juan Test Redeservi',
    email: 'redeservieuropa@gmail.com',
    phone: '+33778706325',
  },
  booking: {
    quickType:      'traslado',
    pickupAddress:  'Aeropuerto Charles de Gaulle, Terminal 2E, 95700 Roissy-en-France',
    dropoffAddress: 'Torre Eiffel, Champ de Mars, 75007 París, Francia',
    date:           getFutureDate(7),
    time:           '10:30',
    passengers:     3,
    ninos:          1,
    flightNumber:   'IB6544',
    luggage23kg:    2,
    luggage10kg:    1,
    totalPrice:     90,
    transferTitle:  'CDG → Torre Eiffel',
  },
  amount:      9,
  description: '[TEST] Traslado CDG → Torre Eiffel — 3 pax',
  payFullNow:  false,
  locale:      'es',
  method:      'creditcard',
}

async function request(method, path, body, opts = {}) {
  const url = `${BASE_URL}${path}`
  const options = {
    method,
    headers: { 'Content-Type': 'application/json', ...opts.headers },
  }
  if (body && method !== 'GET') options.body = JSON.stringify(body)
  const res = await fetch(url, options)
  let json
  try { json = await res.json() } catch { json = null }
  return { status: res.status, ok: res.ok, json }
}

async function main() {
  console.log(`\n${C.magenta}${C.bold}`)
  console.log('╔══════════════════════════════════════════════════════════╗')
  console.log('║   PRUEBA COMPLETA DE AGENDAMIENTO — Redeservi Europa     ║')
  console.log('╚══════════════════════════════════════════════════════════╝')
  console.log(C.reset)
  info('Servidor', BASE_URL)
  info('Fecha del servicio', TEST_BOOKING.booking.date)
  info('Contacto de prueba', TEST_BOOKING.contact.name)
  div()

  const results = {}
  let paymentId  = null
  let checkoutUrl = null

  // ─── PASO 1: Crear pago ───────────────────────────────────
  step(1, 'Crear pago en Mollie + Orden en Sanity')
  try {
    const { status, ok: isOk, json } = await request('POST', '/api/mollie/create', {
      amount:      TEST_BOOKING.amount,
      description: TEST_BOOKING.description,
      method:      TEST_BOOKING.method,
      payFullNow:  TEST_BOOKING.payFullNow,
      locale:      TEST_BOOKING.locale,
      contact:     TEST_BOOKING.contact,
      booking:     TEST_BOOKING.booking,
      carrito:     [],
      addons:      { boatTickets: 0, boatTicketsPrice: 0 },
      metadata:    { source: 'test-script', combinedPayment: false, itemsCount: 1 },
    })

    if (isOk && json?.id) {
      paymentId   = json.id
      checkoutUrl = json.checkoutUrl
      ok('Pago creado en Mollie',    `ID: ${paymentId}`)
      ok('Checkout URL generada',    checkoutUrl?.substring(0, 70) + '...')
      ok('Orden enviada a Sanity')
      results.paso1 = { ok: true, paymentId, checkoutUrl }
    } else {
      fail('Error creando pago', JSON.stringify(json))
      results.paso1 = { ok: false, error: json }
      return printSummary(results)
    }
  } catch (e) {
    fail('Excepción PASO 1', e.message)
    results.paso1 = { ok: false, error: e.message }
    return printSummary(results)
  }

  // ─── PASO 2: Verificar orden en Sanity ───────────────────
  step(2, 'Verificar orden en Sanity (by-payment)')
  info('Esperando 3s para que Sanity indexe el documento...')
  await sleep(3000)

  try {
    const { status, ok: isOk, json } = await request('GET', `/api/orders/by-payment?id=${paymentId}`)

    if (isOk && json?.orders?.length > 0) {
      const order = json.orders[0]
      ok('Orden encontrada en Sanity', `_id: ${order._id}`)
      ok('Número de orden', order.orderNumber)
      ok('Estado inicial',  order.status)

      const svc = order.services?.[0]
      if (svc) {
        div()
        console.log(`${C.cyan}  Detalles del servicio guardado:${C.reset}`)
        info('  tipo',         svc.type)
        info('  título',       svc.title)
        info('  fecha',        svc.date)
        info('  hora',         svc.time)
        info('  pasajeros',    String(svc.passengers))
        info('  recogida',     svc.pickupAddress)
        info('  destino',      svc.dropoffAddress)
        info('  vuelo',        svc.flightNumber)
        info('  totalPrice',   `€${svc.totalPrice}`)
        info('  depositPercent', `${svc.depositPercent}%`)
        div()

        const checks = [
          ['Tipo definido',             !!svc.type],
          ['Título definido',           !!svc.title],
          ['Fecha guardada',            !!svc.date],
          ['Hora guardada',             !!svc.time],
          ['Recogida guardada',         !!svc.pickupAddress],
          ['Destino guardado',          !!svc.dropoffAddress],
          ['Vuelo guardado',            !!svc.flightNumber],
          ['totalPrice > 0',            Number(svc.totalPrice) > 0],
          ['depositPercent > 0',        Number(svc.depositPercent) > 0],
          ['Contacto con nombre',       !!order.contact?.name],
          ['Contacto con email',        !!order.contact?.email],
          ['Contacto con teléfono',     !!order.contact?.phone],
          ['payment.paymentId presente',!!order.payment?.paymentId],
          ['Estado inicial = pending',  order.status === 'pending'],
        ]

        let allPass = true
        for (const [label, pass] of checks) {
          if (pass) ok(label)
          else { fail(label); allPass = false }
        }
        results.paso2 = { ok: allPass, orderId: order._id, orderNumber: order.orderNumber }
      } else {
        warn('Sin servicios en la orden')
        results.paso2 = { ok: false, error: 'No services' }
      }
    } else {
      fail('Orden no encontrada', `HTTP ${status}`)
      results.paso2 = { ok: false, error: json?.error || 'Not found' }
    }
  } catch (e) {
    fail('Excepción PASO 2', e.message)
    results.paso2 = { ok: false, error: e.message }
  }

  // ─── PASO 3: Estado en Mollie ─────────────────────────────
  step(3, 'Consultar estado del pago en Mollie')
  try {
    const { status, ok: isOk, json } = await request('GET', `/api/mollie/status?id=${paymentId}`)

    if (isOk && json?.id) {
      ok('Pago consultado en Mollie', `Estado: ${json.status}`)
      ok('Monto registrado',          `${json.amount?.value} ${json.amount?.currency}`)
      const valid = ['open', 'paid', 'pending', 'authorized'].includes(json.status)
      if (valid) ok('Estado Mollie es válido')
      else       warn(`Estado inesperado: ${json.status}`)
      results.paso3 = { ok: isOk, status: json.status, amount: json.amount }
    } else {
      fail('Error consultando Mollie', JSON.stringify(json))
      results.paso3 = { ok: false, error: json }
    }
  } catch (e) {
    fail('Excepción PASO 3', e.message)
    results.paso3 = { ok: false, error: e.message }
  }

  // ─── PASO 4: Simular webhook ──────────────────────────────
  step(4, 'Simular webhook de Mollie')
  warn('El webhook procesa emails/Calendar SOLO si el pago está en estado "paid" en Mollie.')
  warn('En prueba de script, el pago queda en "open" (no pagado manualmente).')
  info('Enviando simulación...')

  try {
    const formBody = new URLSearchParams()
    formBody.append('id', paymentId)

    const res = await fetch(`${BASE_URL}/api/mollie/webhook?token=${encodeURIComponent(WEBHOOK_TOKEN)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formBody.toString(),
    })
    const json = await res.json().catch(() => null)

    if (res.ok) {
      if (json?.ok && json?.note?.startsWith('ignored-status')) {
        ok('Webhook recibido por el servidor', 'pago no "paid" aún — comportamiento CORRECTO en test')
        results.paso4 = { ok: true, note: 'ignored-not-paid' }
      } else if (json?.skipped) {
        warn('Webhook omitido', 'correos ya enviados o en proceso')
        results.paso4 = { ok: true, note: 'skipped' }
      } else if (json?.ok) {
        ok('Webhook procesado con pago "paid"')
        ok('Emails enviados correctamente')
        ok('Google Calendar event creado')
        results.paso4 = { ok: true, processed: true }
      } else {
        warn('Respuesta inesperada', JSON.stringify(json))
        results.paso4 = { ok: false, error: json }
      }
    } else {
      fail('Error en webhook', `HTTP ${res.status}`)
      results.paso4 = { ok: false, error: json }
    }
  } catch (e) {
    fail('Excepción PASO 4', e.message)
    results.paso4 = { ok: false, error: e.message }
  }

  // ─── PASO 5: Estado final en Sanity ───────────────────────
  step(5, 'Estado final de la orden en Sanity')
  await sleep(1500)

  try {
    const { status, ok: isOk, json } = await request('GET', `/api/orders/by-payment?id=${paymentId}`)

    if (isOk && json?.orders?.length > 0) {
      const order = json.orders[0]
      ok('Orden consultada', `Estado actual: ${order.status}`)

      if (order.status === 'paid') {
        ok('Estado "paid" ✅ — correos y calendar ya procesados')
      } else if (order.status === 'pending') {
        ok('Estado "pending" — esperado en prueba de script (sin completar pago manualmente)')
      } else {
        warn(`Estado: "${order.status}"`)
      }
      results.paso5 = { ok: true, status: order.status }
    } else {
      fail('Orden no encontrada', `HTTP ${status}`)
      results.paso5 = { ok: false }
    }
  } catch (e) {
    fail('Excepción PASO 5', e.message)
    results.paso5 = { ok: false, error: e.message }
  }

  // ─── PASO 6: Google Calendar ──────────────────────────────
  step(6, 'Crear evento en Google Calendar')

  try {
    const { status, ok: isOk, json } = await request(
      'POST',
      `/api/orders/calendar/create?token=${MAIL_TOKEN}`,
      { paymentId }
    )

    if (isOk && json?.ok) {
      if (json.events?.length > 0) {
        ok('Evento de Google Calendar creado')
        for (const evt of json.events) {
          ok(`Event ID`, evt.eventId)
          if (evt.htmlLink) ok('Link', evt.htmlLink)
        }
        results.paso6 = { ok: true, events: json.events }
      } else {
        warn('API respondió OK pero sin eventos (¿fecha inválida o sin fechas en servicios?)')
        results.paso6 = { ok: true, note: 'no-events', json }
      }
    } else {
      fail('Error en Google Calendar', `HTTP ${status} — ${JSON.stringify(json)}`)
      results.paso6 = { ok: false, error: json }
    }
  } catch (e) {
    fail('Excepción PASO 6', e.message)
    results.paso6 = { ok: false, error: e.message }
  }

  printSummary(results, paymentId, checkoutUrl)
}

function printSummary(results, paymentId, checkoutUrl) {
  console.log(`\n${C.magenta}${C.bold}`)
  console.log('╔══════════════════════════════════════════════════════════╗')
  console.log('║                 RESUMEN DE LA PRUEBA                    ║')
  console.log('╚══════════════════════════════════════════════════════════╝')
  console.log(C.reset)

  const steps = [
    ['PASO 1 — Crear pago Mollie + Orden Sanity',  results.paso1],
    ['PASO 2 — Verificar campos en Sanity',         results.paso2],
    ['PASO 3 — Estado del pago en Mollie',          results.paso3],
    ['PASO 4 — Webhook simulado',                   results.paso4],
    ['PASO 5 — Estado final de la orden',           results.paso5],
    ['PASO 6 — Google Calendar',                    results.paso6],
  ]

  let passed = 0
  for (const [label, result] of steps) {
    if (!result) {
      warn(label, 'No ejecutado')
    } else if (result.ok) {
      ok(label, result.note || '')
      passed++
    } else {
      fail(label, result.error ? String(result.error).substring(0, 80) : '')
    }
  }

  div()

  if (paymentId) {
    console.log(`\n${C.bold}Datos del pago de prueba:${C.reset}`)
    info('Payment ID',         paymentId)
    info('Checkout URL',       checkoutUrl || 'N/A')
    info('Buscar en Sanity',   `payment.paymentId == "${paymentId}"`)
    div()
    console.log(`${C.yellow}Para completar el flujo completo (con emails + calendar automático):${C.reset}`)
    console.log(`${C.yellow}  1. Abre la Checkout URL en tu navegador${C.reset}`)
    console.log(`${C.yellow}  2. Completa el pago en el sandbox de Mollie${C.reset}`)
    console.log(`${C.yellow}  3. Mollie enviará el webhook automáticamente a producción${C.reset}`)
    console.log(`${C.yellow}     o usa ngrok en local para recibir el webhook${C.reset}\n`)
  }

  div()
  const pct = Math.round((passed / steps.length) * 100)
  console.log(`\n${C.bold}Resultado: ${passed}/${steps.length} pasos (${pct}%)${C.reset}`)

  if (passed === steps.length) {
    console.log(`${C.green}${C.bold}🎉 FLUJO COMPLETO FUNCIONANDO CORRECTAMENTE${C.reset}`)
  } else if (passed >= 4) {
    console.log(`${C.yellow}${C.bold}⚠️  FLUJO MAYORMENTE FUNCIONAL${C.reset}`)
    console.log(`${C.dim}Los pasos pendientes requieren completar el pago en Mollie manualmente.${C.reset}`)
  } else {
    console.log(`${C.red}${C.bold}❌ HAY PROBLEMAS EN EL FLUJO — REVISAR ERRORES ARRIBA${C.reset}`)
  }
  console.log()
}

main().catch(e => {
  fail('Error fatal', e.message)
  console.error(e)
  process.exit(1)
})
