import { serverClient } from '../sanity/lib/server-client'

async function run() {
  await serverClient.patch('evento-barco-sena')
    .set({ pricePerPerson: 15 })
    .commit()
  
  console.log('✅ Precio de evento-barco-sena actualizado a 15')
}
run()
