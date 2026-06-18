import * as path from 'node:path'
import * as fs from 'node:fs'
import dotenv from 'dotenv'
// Cargar .env.local primero, si no existe, .env
const envLocal = path.resolve(process.cwd(), '.env.local')
if (fs.existsSync(envLocal)) {
  dotenv.config({ path: envLocal })
} else {
  dotenv.config()
}
async function run() {
  const { serverClient } = await import('../sanity/lib/server-client')
  const doc = {
    _type: 'order',
    orderNumber: 'ORD-TEST-0001',
    status: 'paid',
    payment: {
      provider: 'mollie',
      paymentId: 'tr_example',
      status: 'paid',
      amount: 12.34,
      currency: 'EUR',
      method: 'card',
      createdAt: new Date().toISOString(),
      paidAt: new Date().toISOString(),
    },
    contact: { name: 'Cliente Demo', email: 'demo@example.com', phone: '+3300000000' },
    service: {
      type: 'traslado',
      title: 'CDG → París',
      date: new Date().toISOString().slice(0,10),
      time: '10:30',
      passengers: 2,
      pickupAddress: 'CDG T2E',
      dropoffAddress: 'Hotel XYZ, París',
      luggage23kg: 2, luggage10kg: 1,
      isNightTime: false, extraLuggage: false,
      totalPrice: 65,
    },
    metadata: { source: 'seed', createdAt: new Date().toISOString() },
  }
  const res = await serverClient.create(doc)
  console.log('Seed order created:', res._id)
}

run().catch((e) => { console.error(e); process.exit(1) })
