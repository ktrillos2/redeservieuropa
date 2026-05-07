import { createClient } from 'next-sanity'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2023-05-03',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
})

async function test() {
  const query = `*[_type == "order" && status == "paid"] | order(_createdAt desc) [0..5]{ _id, "paymentId": payment.paymentId, contact }`
  const results = await client.fetch(query)
  console.log(JSON.stringify(results, null, 2))
}

test()
