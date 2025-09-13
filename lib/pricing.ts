// Lógica de precios de traslados basada en la tabla provista
// Rutas clave: origen->destino, con tramos por cantidad de pasajeros

export type RouteTier = {
  upTo4: number
  upTo5: number
  upTo6: number
  upTo7: number
  upTo8: number
}

// Mapa de precios por ruta (ambos sentidos cuando aplica)
export const routeTierPrices: Record<string, RouteTier> = {
  // París <-> Aeropuerto CDG
  "cdg->paris": { upTo4: 65, upTo5: 85, upTo6: 103, upTo7: 109, upTo8: 113 },
  "paris->cdg": { upTo4: 65, upTo5: 85, upTo6: 103, upTo7: 109, upTo8: 113 },

  // París <-> Aeropuerto Orly
  "orly->paris": { upTo4: 60, upTo5: 80, upTo6: 95, upTo7: 104, upTo8: 108 },
  "paris->orly": { upTo4: 60, upTo5: 80, upTo6: 95, upTo7: 104, upTo8: 108 },

  // París <-> Aeropuerto Beauvais
  "beauvais->paris": { upTo4: 125, upTo5: 145, upTo6: 160, upTo7: 180, upTo8: 190 },
  "paris->beauvais": { upTo4: 125, upTo5: 145, upTo6: 160, upTo7: 180, upTo8: 190 },

  // CDG <-> Disneyland
  "cdg->disneyland": { upTo4: 70, upTo5: 82, upTo6: 98, upTo7: 112, upTo8: 128 },
  "disneyland->cdg": { upTo4: 70, upTo5: 82, upTo6: 98, upTo7: 112, upTo8: 128 },

  // Orly <-> Disneyland
  "orly->disneyland": { upTo4: 73, upTo5: 90, upTo6: 106, upTo7: 118, upTo8: 134 },
  "disneyland->orly": { upTo4: 73, upTo5: 90, upTo6: 106, upTo7: 118, upTo8: 134 },

  // Beauvais <-> Disneyland
  "beauvais->disneyland": { upTo4: 145, upTo5: 155, upTo6: 175, upTo7: 185, upTo8: 195 },
  "disneyland->beauvais": { upTo4: 145, upTo5: 155, upTo6: 175, upTo7: 185, upTo8: 195 },

  // París <-> Disneyland
  "paris->disneyland": { upTo4: 70, upTo5: 90, upTo6: 106, upTo7: 118, upTo8: 134 },
  "disneyland->paris": { upTo4: 70, upTo5: 90, upTo6: 106, upTo7: 118, upTo8: 134 },
}

export const routeLabelMap: Record<string, string> = {
  cdg: "Aeropuerto CDG",
  orly: "Aeropuerto Orly",
  beauvais: "Aeropuerto Beauvais",
  paris: "París Centro",
  disneyland: "Disneyland",
}

export function calcBaseTransferPrice(from?: string, to?: string, pax?: number): number | undefined {
  if (!from || !to) return undefined
  const key = `${from}->${to}`
  const tier = routeTierPrices[key]
  if (!tier) return undefined
  const n = Math.max(1, Number(pax || 1))
  if (n <= 4) return tier.upTo4
  if (n === 5) return tier.upTo5
  if (n === 6) return tier.upTo6
  if (n === 7) return tier.upTo7
  if (n === 8) return tier.upTo8
  // Asunción: >8 pasajeros = precio de 8 + 20€ por pasajero adicional
  return tier.upTo8 + 20 * (n - 8)
}

export function getAvailableDestinations(from?: string): string[] {
  if (!from) return []
  const prefix = `${from}->`
  return Object.keys(routeTierPrices)
    .filter((k) => k.startsWith(prefix))
    .map((k) => k.split("->")[1])
}

export function getGlobalMinBase(): number | null {
  const values = Object.values(routeTierPrices).map((t) => t.upTo4)
  if (values.length === 0) return null
  return Math.min(...values)
}

export function getMinBaseFromOrigin(from?: string): number | null {
  if (!from) return null
  const prefix = `${from}->`
  const values = Object.entries(routeTierPrices)
    .filter(([k]) => k.startsWith(prefix))
    .map(([, t]) => t.upTo4)
  if (values.length === 0) return null
  return Math.min(...values)
}

export function isNightTime(timeStr?: string): boolean {
  if (!timeStr) return false
  const [hh] = String(timeStr).split(":").map((x) => parseInt(x, 10))
  if (!Number.isFinite(hh)) return false
  return hh >= 21 || hh < 6
}
