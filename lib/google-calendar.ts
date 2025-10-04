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
  const tz = input.start.timeZone

  function timingDiffers(existing: any) {
    try {
      const exStart = existing?.start?.dateTime
      const exEnd = existing?.end?.dateTime
      const exTzStart = existing?.start?.timeZone
      const exTzEnd = existing?.end?.timeZone
      const sameStart = exStart === input.start.dateTime && (!input.start.timeZone || (exTzStart || tz) === input.start.timeZone)
      const sameEnd = exEnd === input.end.dateTime && (!input.end.timeZone || (exTzEnd || tz) === input.end.timeZone)
      return !(sameStart && sameEnd)
    } catch { return true }
  }

  async function patchIfNeeded(eventId: string, existing?: any) {
    try {
      const shouldPatch = !existing || timingDiffers(existing)
      if (!shouldPatch) return existing
      const res = await calendar.events.patch({
        calendarId,
        eventId,
        requestBody: {
          summary: input.summary,
          description: input.description,
          location: input.location,
          start: input.start,
          end: input.end,
          attendees: input.attendees,
        },
      })
      return res.data
    } catch (e) {
      // Si falla el patch, devolver el existente para no romper el flujo
      return existing || null
    }
  }
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
      if (got.data?.id) {
        const updated = await patchIfNeeded(deterministicId, got.data)
        return updated
      }
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
    if (existing) {
      const updated = await patchIfNeeded(existing.id as string, existing)
      return updated
    }
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
  const useDefaultTz = String(process.env.GOOGLE_CALENDAR_USE_DEFAULT_TZ || '').trim() === '1'
  const date = order?.service?.date // YYYY-MM-DD
  let time = order?.service?.time || '00:00'
  // Normalizar hora a 24h (acepta '2:50 pm', '02:50 PM', etc.)
  try {
    const raw = String(time).trim()
    const m = raw.match(/^\s*(\d{1,2}):(\d{2})\s*(am|pm|AM|PM)?\s*$/)
    if (m) {
      let hh = parseInt(m[1], 10)
      const mm = parseInt(m[2], 10)
      const mer = m[3]?.toLowerCase()
      if (mer === 'pm' && hh < 12) hh += 12
      if (mer === 'am' && hh === 12) hh = 0
      if (hh >= 0 && hh <= 23 && mm >= 0 && mm <= 59) {
        time = `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`
      }
    }
  } catch {}
  const startLocal = `${date}T${time}:00`
  // Duración por defecto: 1.5h para traslados, usar horas del tour si está
  const hours = order?.service?.selectedPricingOption?.hours || (order?.service?.type === 'tour' ? 3 : 1.5)
  // Calcular end como aritmética local (evita desfases por TZ del servidor)
  const [y, m, d] = (date || '1970-01-01').split('-').map((v: string) => parseInt(v, 10))
  const [hh, mm] = (time || '00:00').split(':').map((v: string) => parseInt(v, 10))
  const addMinutes = Math.round(Number(hours) * 60)
  let endMinutesTotal = hh * 60 + mm + addMinutes
  let endDayOffset = Math.floor(endMinutesTotal / (24 * 60))
  endMinutesTotal = endMinutesTotal % (24 * 60)
  let endH = Math.floor(endMinutesTotal / 60)
  let endM = endMinutesTotal % 60
  // Avanzar la fecha en endDayOffset días
  const endDateObj = new Date(Date.UTC(y, (m || 1) - 1, d || 1))
  endDateObj.setUTCDate(endDateObj.getUTCDate() + endDayOffset)
  const endY = endDateObj.getUTCFullYear()
  const endMo = String(endDateObj.getUTCMonth() + 1).padStart(2, '0')
  const endD = String(endDateObj.getUTCDate()).padStart(2, '0')
  const endStr = `${endY}-${endMo}-${endD}T${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}:00`
  console.log('[calendar][buildPayload]', { tz, useDefaultTz, date, time, startLocal, endStr })

  const lines: string[] = []
  lines.push(`Tipo: ${order?.service?.type || '—'}`)
  lines.push(`Título: ${order?.service?.title || '—'}`)
  if (order?.service?.pickupAddress) lines.push(`Recogida: ${order.service.pickupAddress}`)
  if (order?.service?.dropoffAddress) lines.push(`Destino: ${order.service.dropoffAddress}`)
  if (order?.service?.flightNumber) lines.push(`Vuelo: ${order.service.flightNumber}`)
  if (order?.service?.ninos !== undefined) lines.push(`Niños: ${order.service.ninos}`)
  if (order?.service?.ninosMenores9 !== undefined) lines.push(`Menores de 9 años: ${order.service.ninosMenores9}`)
  if (order?.service?.time) lines.push(`Hora de llegada: ${order.service.time}`)
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

  // Si useDefaultTz=1, omitimos timeZone para que Google use la zona horaria por defecto del calendario.
  if (useDefaultTz) {
    return {
      summary,
      description,
      start: { dateTime: startLocal, timeZone: undefined as unknown as string },
      end: { dateTime: endStr, timeZone: undefined as unknown as string },
      location: order?.service?.pickupAddress ? `${order.service.pickupAddress}${order?.service?.dropoffAddress ? ` → ${order.service.dropoffAddress}` : ''}` : undefined,
      attendees,
    } as unknown as CalendarEventInput
  }

  return {
    summary,
    description,
    start: { dateTime: startLocal, timeZone: tz },
    end: { dateTime: endStr, timeZone: tz },
    location: order?.service?.pickupAddress ? `${order.service.pickupAddress}${order?.service?.dropoffAddress ? ` → ${order.service.dropoffAddress}` : ''}` : undefined,
    attendees,
  } satisfies CalendarEventInput
}
