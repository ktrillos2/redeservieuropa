import { TourDoc } from "./tours"


const INC_5 = 34, INC_6 = 32, INC_7 = 28, INC_8 = 26

export function getStartingPriceEUR(t: TourDoc): number | undefined {
  if (typeof t.booking?.startingPriceEUR === 'number') return t.booking.startingPriceEUR
  if (t.pricingMode === 'rules' && t.pricingRules?.baseUpTo4EUR != null) return t.pricingRules.baseUpTo4EUR
  if (t.pricingMode === 'table' && t.pricingTable) {
    const { p4, p5, p6, p7, p8 } = t.pricingTable
    const list = [p4, p5, p6, p7, p8].filter((n): n is number => typeof n === 'number')
    if (list.length) return Math.min(...list)
  }
  return undefined
}

// Útil para armar una vista previa (4..10 pax)
export function computePriceForPax(n: number, t: TourDoc): number | undefined {
  if (n < 1) return undefined
  if (t.pricingMode === 'rules' && t.pricingRules?.baseUpTo4EUR != null) {
    const base = t.pricingRules.baseUpTo4EUR
    if (n <= 4) return base
    if (n === 5) return base + INC_5
    if (n === 6) return base + INC_5 + INC_6
    if (n === 7) return base + INC_5 + INC_6 + INC_7
    return base + INC_5 + INC_6 + INC_7 + INC_8 // 8 en adelante mismo precio
  }
  if (t.pricingMode === 'table' && t.pricingTable) {
    const { p4 = 0, p5 = 0, p6 = 0, p7 = 0, p8 = 0, extraFrom9 = 0 } = t.pricingTable
    if (n <= 4) return p4
    if (n === 5) return p5
    if (n === 6) return p6
    if (n === 7) return p7
    if (n === 8) return p8
    return p8 + extraFrom9 * (n - 8)
  }
  return undefined
}
