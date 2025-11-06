// Simplified version for next-sanity@9.x compatibility
// For live content updates, upgrade to next-sanity@10+ and Next.js 15+
import { client } from './client'

// Simple fetch wrapper for compatibility
export async function sanityFetch<T>({ query, params }: { query: string; params?: Record<string, any> }): Promise<{ data: T }> {
  const data = await client.fetch<T>(query, params || {})
  return { data }
}

// Dummy component for compatibility
export function SanityLive() {
  return null
}
