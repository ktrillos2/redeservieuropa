import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Formatea números de teléfono para visualización. Ejemplo: +573133087069 -> +57 313 308 7069
export function formatPhonePretty(input: string): string {
  if (!input) return ''
  const trimmed = input.trim()
  // Mantener '+' inicial si existe, y solo dígitos después
  const hasPlus = trimmed.startsWith('+')
  const digits = trimmed.replace(/[^\d]/g, '')
  if (!digits) return hasPlus ? '+' : ''
  // Caso Colombia +57: 10 dígitos locales => 3-3-4
  if (hasPlus && digits.startsWith('57') && digits.length >= 12) {
    const cc = '57'
    const rest = digits.slice(2) // locales
    if (rest.length >= 10) {
      const a = rest.slice(0, 3)
      const b = rest.slice(3, 6)
      const c = rest.slice(6, 10)
      return `+${cc} ${a} ${b} ${c}`
    }
  }
  // Si empieza con + y hay código de país de 1-3 dígitos + 10 locales, intentar 3-3-4
  if (hasPlus) {
    for (let ccLen = 1; ccLen <= 3; ccLen++) {
      if (digits.length >= ccLen + 10) {
        const cc = digits.slice(0, ccLen)
        const rest = digits.slice(ccLen)
        if (rest.length >= 10) {
          const a = rest.slice(0, 3)
          const b = rest.slice(3, 6)
          const c = rest.slice(6, 10)
          return `+${cc} ${a} ${b} ${c}`
        }
      }
    }
    // Fall-back: +CC + bloques de 2 o 3
    const cc = digits.slice(0, 2)
    const rest = digits.slice(2)
    const chunks: string[] = []
    for (let i = 0; i < rest.length; i += 2) chunks.push(rest.slice(i, i + 2))
    return `+${cc} ${chunks.join(' ')}`.trim()
  }
  // Sin '+': si hay 10 dígitos, 3-3-4
  if (digits.length === 10) {
    const a = digits.slice(0, 3)
    const b = digits.slice(3, 6)
    const c = digits.slice(6, 10)
    return `${a} ${b} ${c}`
  }
  // Fall-back: agrupar de 3 en 3
  const groups: string[] = []
  for (let i = 0; i < digits.length; i += 3) groups.push(digits.slice(i, i + 3))
  return groups.join(' ')
}

// Asegura que el valor comience con "+" (salvo que esté vacío). No altera el resto del contenido.
export function ensureLeadingPlus(value: string): string {
  if (!value) return ''
  const leftTrimmed = value.replace(/^\s+/, '')
  if (!leftTrimmed) return ''
  return leftTrimmed.startsWith('+') ? leftTrimmed : `+${leftTrimmed}`
}
