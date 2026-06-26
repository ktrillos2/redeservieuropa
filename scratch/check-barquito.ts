import { serverClient } from '../sanity/lib/server-client'

async function run() {
  const docs = await serverClient.fetch(`*[_type in ["events", "tour", "toursSection", "event"]] { _id, _type, title, subtitle, price, pricePerPerson }`)
  console.log(JSON.stringify(docs.filter(d => JSON.stringify(d).toLowerCase().includes('barquito') || JSON.stringify(d).toLowerCase().includes('barco') || JSON.stringify(d).toLowerCase().includes('bateau')), null, 2))
}
run()
