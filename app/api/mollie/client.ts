import createMollieClient, { type MollieClient } from '@mollie/api-client'

export function getMollieClient(): MollieClient {
  const apiKey = process.env.MOLLIE_API_KEY
  if (!apiKey) {
    throw new Error('MOLLIE_API_KEY no está configurado')
  }
  return createMollieClient({ apiKey })
}
