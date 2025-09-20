import { google } from 'googleapis'
import { createHash } from 'crypto'

export type CalendarEventInput = {
  summary: string
  description?: string
  start: { dateTime: string; timeZone: string }
  end: { dateTime: string; timeZone: string }
  location?: string
  attendees?: Array<{ email: string; displayName?: string }>
}

function getEnv(name: string, fallback?: string) {
  const v = process.env[name]
  if (v && v.length > 0) return v
  if (fallback !== undefined) return fallback
  throw new Error(`[calendar] Missing env: ${name}`)
}

function getOAuth2Client() {
  const clientId = getEnv('GOOGLE_CLIENT_ID')
  const clientSecret = getEnv('GOOGLE_CLIENT_SECRET')
  const redirectUri = getEnv('GOOGLE_REDIRECT_URI')
  const refreshToken = getEnv('GOOGLE_REFRESH_TOKEN')

  const oAuth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri)
  oAuth2Client.setCredentials({ refresh_token: refreshToken })
  return oAuth2Client
}

export async function createCalendarEvent(input: CalendarEventInput, dedupeKey?: string) {
  const auth = getOAuth2Client()
  const calendar = google.calendar({ version: 'v3', auth })
  const calendarId = getEnv('GOOGLE_CALENDAR_ID', 'primary')
  // Si hay dedupeKey, generar un ID determinista y buscar por ID primero
  let deterministicId: string | undefined
  if (dedupeKey) {
    // Google Calendar requiere IDs con charset base32hex (0-9, a-v). Convertimos SHA1 a base32hex.
    const digest = createHash('sha1').update(String(dedupeKey)).digest()
    const alphabet = '0123456789abcdefghijklmnopqrstuv'
    let out = ''
    let buffer = 0
    let bits = 0
    for (let i = 0; i < digest.length; i++) {
      buffer = (buffer << 8) | digest[i]
      bits += 8
      while (bits >= 5) {
        bits -= 5
        out += alphabet[(buffer >> bits) & 31]
      }
    }
    if (bits > 0) {
      out += alphabet[(buffer << (5 - bits)) & 31]
    }
    // Prefijo válido dentro del rango permitido (usar 'e' de event)
    deterministicId = `e${out}`
    try {
      const got = await calendar.events.get({ calendarId, eventId: deterministicId })
      if (got.data?.id) return got.data
    } catch (err: any) {
      const code = err?.code || err?.response?.status
      if (code && Number(code) !== 404) {
        // Otros errores al consultar por ID
        throw err
      }
    }
  }
  // Si hay dedupeKey, buscar evento existente con propiedad privada paymentId=dedupeKey
  if (dedupeKey) {
    const list = await calendar.events.list({
      calendarId,
      privateExtendedProperty: [`paymentId=${dedupeKey}`],
      maxResults: 1,
      singleEvents: true,
      orderBy: 'startTime'
    })
    const existing = list.data.items?.[0]
    if (existing) return existing
  }
  const res = await calendar.events.insert({
    calendarId,
    requestBody: {
      id: deterministicId,
      summary: input.summary,
      description: input.description,
      location: input.location,
      start: input.start,
      end: input.end,
      attendees: input.attendees,
      extendedProperties: dedupeKey ? { private: { paymentId: dedupeKey } } : undefined,
    }
  }).catch(async (err: any) => {
    // Si hay conflicto por ID ya existente, recuperar el existente
    const code = err?.code || err?.response?.status
    if (deterministicId && Number(code) === 409) {
      const got = await calendar.events.get({ calendarId, eventId: deterministicId })
      return got
    }
    // Si el ID no es válido (400), reintentar dejando que Google asigne un ID
    if (deterministicId && Number(code) === 400) {
      const retry = await calendar.events.insert({
        calendarId,
        requestBody: {
          summary: input.summary,
          description: input.description,
          location: input.location,
          start: input.start,
          end: input.end,
          attendees: input.attendees,
          extendedProperties: dedupeKey ? { private: { paymentId: dedupeKey } } : undefined,
        }
      })
      return retry
    }
    throw err
  })
  return res.data // contains id, htmlLink, etc.
}

export async function getCalendarEventById(eventId: string) {
  const auth = getOAuth2Client()
  const calendar = google.calendar({ version: 'v3', auth })
  const calendarId = getEnv('GOOGLE_CALENDAR_ID', 'primary')
  try {
    const res = await calendar.events.get({ calendarId, eventId })
    return res.data || null
  } catch (err: any) {
    // Si es 404, no existe
    const code = err?.code || err?.response?.status
    if (code === 404) return null
    throw err
  }
}

export function buildOrderEventPayload(order: any) {
  const tz = process.env.GOOGLE_CALENDAR_TZ || 'Europe/Paris'
  const date = order?.service?.date // YYYY-MM-DD
  const time = order?.service?.time || '00:00'
  const startLocal = `${date}T${time}:00`
  // Duración por defecto: 1.5h para traslados, usar horas del tour si está
  const hours = order?.service?.selectedPricingOption?.hours || (order?.service?.type === 'tour' ? 3 : 1.5)
  const endDate = new Date(`${startLocal}`)
  const endLocal = new Date(endDate.getTime() + hours * 60 * 60 * 1000)
  const endStr = `${endLocal.getFullYear()}-${String(endLocal.getMonth() + 1).padStart(2, '0')}-${String(endLocal.getDate()).padStart(2, '0')}T${String(endLocal.getHours()).padStart(2, '0')}:${String(endLocal.getMinutes()).padStart(2, '0')}:00`

  const lines: string[] = []
  lines.push(`Tipo: ${order?.service?.type || '—'}`)
  lines.push(`Título: ${order?.service?.title || '—'}`)
  if (order?.service?.pickupAddress) lines.push(`Recogida: ${order.service.pickupAddress}`)
  if (order?.service?.dropoffAddress) lines.push(`Destino: ${order.service.dropoffAddress}`)
  if (order?.service?.flightNumber) lines.push(`Vuelo: ${order.service.flightNumber}`)
  lines.push(`Pasajeros: ${order?.service?.passengers ?? '—'}`)
  lines.push(`Total estimado: ${typeof order?.service?.totalPrice === 'number' ? order.service.totalPrice + ' €' : '—'}`)
  lines.push('')
  lines.push('Contacto:')
  lines.push(`• Nombre: ${order?.contact?.name || '—'}`)
  lines.push(`• Teléfono: ${order?.contact?.phone || '—'}`)
  lines.push(`• Email: ${order?.contact?.email || '—'}`)

  const summary = `[${String(order?.service?.type || '').toUpperCase()}] ${order?.service?.title || 'Reserva'} – ${order?.contact?.name || ''}`
  const description = lines.join('\n')

  const attendees = [] as Array<{ email: string; displayName?: string }>
  if (order?.contact?.email) attendees.push({ email: order.contact.email, displayName: order?.contact?.name })

  return {
    summary,
    description,
    start: { dateTime: startLocal, timeZone: tz },
    end: { dateTime: endStr, timeZone: tz },
    location: order?.service?.pickupAddress ? `${order.service.pickupAddress}${order?.service?.dropoffAddress ? ` → ${order.service.dropoffAddress}` : ''}` : undefined,
    attendees,
  } satisfies CalendarEventInput
}
