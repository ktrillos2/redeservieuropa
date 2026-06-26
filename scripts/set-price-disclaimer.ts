import path from 'node:path'
import { config as dotenvConfig } from 'dotenv'
import { createClient } from 'next-sanity'

dotenvConfig({ path: path.join(process.cwd(), '.env.local'), override: true })

async function main() {
  const client = createClient({
    projectId: (process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '').trim(),
    dataset: (process.env.NEXT_PUBLIC_SANITY_DATASET || '').trim(),
    token: (process.env.SANITY_API_TOKEN || '').trim(),
    useCdn: false,
    apiVersion: '2025-01-01',
  })

  const existing = await client.fetch<{ _id: string } | null>(
    '*[_type=="transfersSectionContent"][0]{_id}',
    {}
  )

  if (existing?._id) {
    await client.patch(existing._id).set({
      priceDisclaimer:
        '⚠️ Los precios mostrados son orientativos y pueden estar sujetos a cambios sin previo aviso. Por favor, confirme la tarifa exacta al momento de realizar su reserva.',
      footnote:
        '⚠️ Precios sujetos a cambios. * Recargo nocturno después de las 21:00 h: +5€. Equipaje voluminoso (más de 3 maletas de 23 kg): +10€.',
    }).commit()
    console.log('✅ priceDisclaimer y footnote actualizados en Sanity')
  } else {
    console.log('❌ No se encontró transfersSectionContent en Sanity')
  }
}

main().catch(console.error)
