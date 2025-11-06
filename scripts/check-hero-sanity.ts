/**
 * Script para verificar qué hay realmente en Sanity
 */

import { createClient } from '@sanity/client'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
})

async function checkHero() {
  try {
    const hero = await client.fetch(`*[_type == "hero"][0]{
      _id,
      translations
    }`)
    
    console.log('📦 Documento Hero en Sanity:')
    console.log('ID:', hero._id)
    console.log('\n🇬🇧 Inglés:')
    console.log('Title:', hero.translations?.en?.title)
    console.log('Highlight:', hero.translations?.en?.highlight)
    console.log('Description:', JSON.stringify(hero.translations?.en?.description, null, 2))
    console.log('Primary CTA:', hero.translations?.en?.primaryCta?.label)
    console.log('Secondary CTA:', hero.translations?.en?.secondaryCta?.label)
    console.log('Booking Form Title:', hero.translations?.en?.bookingForm?.title)
    console.log('Booking Form Buttons:', JSON.stringify(hero.translations?.en?.bookingForm?.buttons, null, 2))
    console.log('\n🇫🇷 Francés:')
    console.log('Title:', hero.translations?.fr?.title)
    console.log('Highlight:', hero.translations?.fr?.highlight)
    console.log('Description:', JSON.stringify(hero.translations?.fr?.description, null, 2))
    console.log('Primary CTA:', hero.translations?.fr?.primaryCta?.label)
    console.log('Secondary CTA:', hero.translations?.fr?.secondaryCta?.label)
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

checkHero()
