import { google } from "googleapis";
import { JWT } from "google-auth-library";
import { createHash } from "crypto";

/* ============================================================
 *  🔐 AUTENTICACIÓN BASE
 * ============================================================ */
function getJwtClient() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const key = (process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY || "").replace(/\\n/g, "\n");

  if (!email || !key) {
    throw new Error("Faltan GOOGLE_SERVICE_ACCOUNT_EMAIL o GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY");
  }

  const scopes = ["https://www.googleapis.com/auth/calendar"];
  return new JWT({ email, key, scopes });
}

function getCalendar() {
  return google.calendar({ version: "v3", auth: getJwtClient() });
}

/* ============================================================
 *  🧩 HELPERS INTERNOS
 * ============================================================ */

// Normaliza fecha/hora
function normalizeDateTime(
  input: string | { dateTime: string; timeZone?: string },
  fallbackTz?: string
) {
  if (typeof input === "string") {
    return { dateTime: input, timeZone: fallbackTz || "Europe/Paris" };
  }
  return {
    dateTime: input.dateTime,
    timeZone: input.timeZone || fallbackTz || "Europe/Paris",
  };
}

// Genera un ID determinista seguro para evitar duplicados
function makeDeterministicId(key: string) {
  const digest = createHash("sha1").update(String(key)).digest();
  const alphabet = "0123456789abcdefghijklmnopqrstuv";
  let out = "";
  let buffer = 0;
  let bits = 0;

  for (let i = 0; i < digest.length; i++) {
    buffer = (buffer << 8) | digest[i];
    bits += 8;
    while (bits >= 5) {
      bits -= 5;
      out += alphabet[(buffer >> bits) & 31];
    }
  }
  if (bits > 0) out += alphabet[(buffer << (5 - bits)) & 31];
  return `e${out}`; // Google permite IDs alfanuméricos base32
}

// Compara si las fechas de dos eventos difieren
function timesDiffer(existing: any, payload: { start: any; end: any }) {
  const aStart = existing?.start?.dateTime || existing?.start?.date;
  const aEnd = existing?.end?.dateTime || existing?.end?.date;
  const bStart = payload.start?.dateTime || payload.start?.date;
  const bEnd = payload.end?.dateTime || payload.end?.date;

  const aTzS = existing?.start?.timeZone;
  const aTzE = existing?.end?.timeZone;
  const bTzS = payload.start?.timeZone;
  const bTzE = payload.end?.timeZone;

  return !(
    aStart === bStart &&
    aEnd === bEnd &&
    (aTzS || "") === (bTzS || "") &&
    (aTzE || "") === (bTzE || "")
  );
}

/* ============================================================
 *  📅 CREAR O ACTUALIZAR UN EVENTO (IDEMPOTENTE)
 * ============================================================ */
export async function createCalendarEvent(
  payload: {
    summary: string;
    description?: string;
    start: string | { dateTime: string; timeZone?: string };
    end: string | { dateTime: string; timeZone?: string };
    timezone?: string;
    calendarId?: string;
  },
  dedupeKey?: string
) {
  const calendar = getCalendar();
  const calendarId = payload.calendarId || process.env.GOOGLE_CALENDAR_ID || "primary";

  const start = normalizeDateTime(payload.start, payload.timezone);
  const end = normalizeDateTime(payload.end, payload.timezone);

  let eventId: string | undefined = dedupeKey ? makeDeterministicId(dedupeKey) : undefined;

  // 1️⃣ Si hay eventId, intentar obtenerlo primero (idempotencia)
  if (eventId) {
    try {
      const got = await calendar.events.get({ calendarId, eventId });
      const existing = got.data;
      if (existing?.id) {
        // Si difieren horarios → patch
        if (timesDiffer(existing, { start, end })) {
          const patched = await calendar.events.patch({
            calendarId,
            eventId,
            requestBody: {
              summary: payload.summary,
              description: payload.description,
              start,
              end,
            },
          });
          return patched.data;
        }
        // Si es igual → retornar existente
        return existing;
      }
    } catch (err: any) {
      const code = err?.code || err?.response?.status;
      if (Number(code) !== 404) throw err;
    }
  }

  // 2️⃣ Crear nuevo evento
  try {
    const res = await calendar.events.insert({
      calendarId,
      requestBody: {
        id: eventId,
        summary: payload.summary,
        description: payload.description,
        start,
        end,
      },
    });
    return res.data;
  } catch (err: any) {
    const code = Number(err?.code || err?.response?.status);

    // 409 = ya existe ese ID → obtener existente
    if (eventId && code === 409) {
      const got = await calendar.events.get({ calendarId, eventId });
      return got.data;
    }

    // 400 = ID inválido → reintentar sin id (Google genera uno nuevo)
    if (eventId && code === 400) {
      const retry = await calendar.events.insert({
        calendarId,
        requestBody: {
          summary: payload.summary,
          description: payload.description,
          start,
          end,
        },
      });
      return retry.data;
    }

    throw err;
  }
}

/* ============================================================
 *  📅 CREAR VARIOS EVENTOS (batch simple)
 * ============================================================ */
export async function createMultipleCalendarEvents(
  items: Array<{
    summary: string;
    description?: string;
    start: string | { dateTime: string; timeZone?: string };
    end: string | { dateTime: string; timeZone?: string };
    timezone?: string;
    calendarId?: string;
  }>
) {
  const results: any[] = [];
  for (const item of items) {
    const res = await createCalendarEvent(item);
    results.push(res);
  }
  return results;
}

/* ============================================================
 *  🔍 OBTENER EVENTO POR ID
 * ============================================================ */
export async function getCalendarEventById(eventId: string) {
  const calendar = getCalendar();
  const calendarId = process.env.GOOGLE_CALENDAR_ID || "primary";
  try {
    const res = await calendar.events.get({ calendarId, eventId });
    return res.data || null;
  } catch (err: any) {
    const code = err?.code || err?.response?.status;
    if (code === 404) return null;
    throw err;
  }
}

/* ============================================================
 *  🧱 CONSTRUIR PAYLOAD DESDE ORDEN
 * ============================================================ */
// lib/google-calendar.ts (solo reemplazar esta función)

export function buildOrderEventPayload(order: any) {
  const tz = process.env.GOOGLE_CALENDAR_TZ || 'Europe/Paris'
  const useDefaultTz = String(process.env.GOOGLE_CALENDAR_USE_DEFAULT_TZ || '').trim() === '1'

  const type = order?.service?.type || 'servicio'
  const titleBase = order?.service?.title || 'Reserva'
  const tag = (() => {
    const t = String(type).toLowerCase()
    if (t === 'traslado') return 'TRASLADO'
    if (t === 'tour') return 'TOUR'
    if (t === 'evento') return 'EVENTO'
    return 'SERVICIO'
  })()

  const payFullNow: boolean | undefined = order?.service?.payFullNow ?? order?.payment?.payFullNow
  const explicitPercent: number | null | undefined = order?.service?.depositPercent ?? order?.payment?.depositPercent
  const depositPercent = (() => {
    if (payFullNow) return 100
    if (typeof explicitPercent === 'number') return explicitPercent
    const t = String(type).toLowerCase()
    if (t === 'traslado') return 10
    if (t === 'tour') return 20
    return 20
  })()

  const date = order?.service?.date // YYYY-MM-DD
  let time = order?.service?.time || '00:00'

  // normalizar hora
  try {
    const raw = String(time).trim()
    const m = raw.match(/^\s*(\d{1,2}):(\d{2})\s*(am|pm|AM|PM)?\s*$/)
    if (m) {
      let hh = parseInt(m[1], 10)
      const mm = parseInt(m[2], 10)
      const mer = m[3]?.toLowerCase()
      if (mer === 'pm' && hh < 12) hh += 12
      if (mer === 'am' && hh === 12) hh = 0
      time = `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`
    }
  } catch {}

  const startLocal = `${date}T${time}:00`
  const hours = order?.service?.selectedPricingOption?.hours || (order?.service?.type === 'tour' ? 3 : 1.5)
  // calcular fin
  const [y, m, d] = (date || '1970-01-01').split('-').map((v: string) => parseInt(v, 10))
  const [hh, mm] = (time || '00:00').split(':').map((v: string) => parseInt(v, 10))
  const addMinutes = Math.round(Number(hours) * 60)
  let endMinutesTotal = hh * 60 + mm + addMinutes
  let endDayOffset = Math.floor(endMinutesTotal / (24 * 60))
  endMinutesTotal = endMinutesTotal % (24 * 60)
  let endH = Math.floor(endMinutesTotal / 60)
  let endM = endMinutesTotal % 60
  const endDateObj = new Date(Date.UTC(y, (m || 1) - 1, d || 1))
  endDateObj.setUTCDate(endDateObj.getUTCDate() + endDayOffset)
  const endY = endDateObj.getUTCFullYear()
  const endMo = String(endDateObj.getUTCMonth() + 1).padStart(2, '0')
  const endD = String(endDateObj.getUTCDate()).padStart(2, '0')
  const endStr = `${endY}-${endMo}-${endD}T${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}:00`

  const total = Number(order?.service?.totalPrice || 0)
  const paidNow = Math.round(total * (depositPercent / 100) * 10) / 10 // 1 decimal

  const lines: string[] = []
  lines.push(`Tipo: ${type}`)
  lines.push(`Título: ${titleBase}`)
  if (order?.service?.pickupAddress) lines.push(`Recogida: ${order.service.pickupAddress}`)
  if (order?.service?.dropoffAddress) lines.push(`Destino: ${order.service.dropoffAddress}`)
  if (typeof order?.service?.passengers === 'number') lines.push(`Pasajeros: ${order.service.passengers}`)
  if (order?.service?.flightNumber) lines.push(`Vuelo: ${order.service.flightNumber}`)
  if (order?.contact?.name) lines.push(`Cliente: ${order.contact.name}`)
  if (order?.contact?.phone) lines.push(`Teléfono: ${order.contact.phone}`)
  if (order?.contact?.email) lines.push(`Email: ${order.contact.email}`)
  lines.push(`Total estimado: ${total.toFixed(2)} €`)
  lines.push(`${depositPercent === 100 ? 'Pago realizado' : 'Pago ahora'}: ${paidNow.toFixed(1)} € ${depositPercent === 100 ? '(100%)' : `(${depositPercent}%)`}`)

  const summary = `[${tag}] ${titleBase}`
  const description = lines.join('\n')

  const attendees =
    order?.contact?.email ? [{ email: order.contact.email, displayName: order.contact?.name || '' }] : undefined

  if (useDefaultTz) {
    return {
      summary,
      description,
      start: { dateTime: startLocal, timeZone: undefined as unknown as string },
      end: { dateTime: endStr, timeZone: undefined as unknown as string },
      location: order?.service?.pickupAddress
        ? `${order.service.pickupAddress}${order?.service?.dropoffAddress ? ` → ${order.service.dropoffAddress}` : ''}`
        : undefined,
      attendees,
    } as any
  }

  return {
    summary,
    description,
    start: { dateTime: startLocal, timeZone: tz },
    end: { dateTime: endStr, timeZone: tz },
    location: order?.service?.pickupAddress
      ? `${order.service.pickupAddress}${order?.service?.dropoffAddress ? ` → ${order.service.dropoffAddress}` : ''}`
      : undefined,
    attendees,
  }
}



function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}
