import { createClient } from 'next-sanity';
import { randomUUID } from 'crypto';
import { apiVersion, dataset, projectId } from '../sanity/env';

const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
});

const pricingUpdates = [
  // TOUR EN PARIS - Reglas (base + 34, 32, 28, 26)
  { id: '661161a6-b104-4da9-9842-1fcb35066909', mode: 'rules', base: 311 }, // Disney - Paris 3h - Disney
  { id: 'QDYowuk3ISZG3qYiQA7jyK', mode: 'rules', base: 266 }, // Paris 2h Disney -> Disney
  { id: 'XOVtyyGTpFHz7tsze2tcuP', mode: 'rules', base: 211 }, // Express Disney -> Disney
  { id: '62TWMB0rEH7b8op9Jj5txQ', mode: 'rules', base: 301 }, // Disney -> CDG/Orly 3h
  { id: 'gxyxv316c0oeG6AdOL9UPj', mode: 'rules', base: 263 }, // Disney -> CDG/Orly 2h
  { id: 'Z1HNmuH9VezlITxVO02p93', mode: 'rules', base: 192 }, // Disney -> CDG/Orly Express
  { id: 'gxyxv316c0oeG6AdOL9USY', mode: 'rules', base: 290 }, // CDG/Orly -> Disney 3h
  { id: '80chRJ3b7zPbeqV15nF16D', mode: 'rules', base: 263 }, // CDG/Orly -> Disney 2h
  { id: '80chRJ3b7zPbeqV15nF19A', mode: 'rules', base: 200 }, // CDG/Orly -> Disney Express
  { id: 'gxyxv316c0oeG6AdOL9Uci', mode: 'rules', base: 215 }, // CDG/Orly -> Hotel 3h
  { id: 'gxyxv316c0oeG6AdOL9UfX', mode: 'rules', base: 170 }, // CDG/Orly -> Hotel 2h
  { id: 'z7PrTHvrNGZAMJ3AxwsF8f', mode: 'rules', base: 210 }, // Hotel -> CDG/Orly 3h
  { id: 'MJAOY9y6GD6Vij4lxJzwSk', mode: 'rules', base: 160 }, // Hotel -> CDG/Orly 2h
  { id: 'z7PrTHvrNGZAMJ3AxwsyZB', mode: 'rules', base: 310 }, // Beauvais -> Hotel 3h
  { id: 'z7PrTHvrNGZAMJ3Axwtp1f', mode: 'rules', base: 260 }, // Beauvais -> Hotel 2h
  { id: '3M4Ir5T5EJZMl77MSZWos0', mode: 'rules', base: 375 }, // Beauvais -> Disney 3h
  { id: 'lf1WUCSVDuwgxFaVnP8Die', mode: 'rules', base: 325 }, // Beauvais -> Disney 2h
  { id: 'MJAOY9y6GD6Vij4lxK8Hnk', mode: 'rules', base: 265 }, // Beauvais -> Disney Express
  { id: 'Z1HNmuH9VezlITxVO02qp1', mode: 'rules', base: 165 }, // City Tour 3h
  { id: 'gxyxv316c0oeG6AdOL9UlB', mode: 'rules', base: 130 }, // City Tour 2h

  // OTROS TOURS - Tabla Especial
  {
    id: 'z7PrTHvrNGZAMJ3AxwyVaB', // Versailles 6h
    mode: 'table',
    table: { p3: 306, p4: 360, p5: 450, p6: 540, p7: 630, p8: 720, extraFrom9: 90 }
  },
  {
    id: 'z7PrTHvrNGZAMJ3Axwz3mn', // Brujas 1 Dia
    mode: 'table',
    table: { p3: 600, p4: 600, p5: 700, p6: 800, p7: 880, p8: 1000, extraFrom9: 120 }
  },
  {
    id: 'MJAOY9y6GD6Vij4lxKD8ZF', // Brujas y Gante
    mode: 'table',
    table: { p3: 650, p4: 700, p5: 850, p6: 900, p7: 900, p8: 1100, extraFrom9: 200 }
  }
];

const newTours = [
  {
    title: 'Tour Brujas y Bruselas, Bélgica (1 día) Full day',
    slug: 'tour-brujas-y-bruselas-belgica',
    pricingMode: 'table',
    pricingTable: { p3: 650, p4: 700, p5: 850, p6: 900, p7: 900, p8: 1100, extraFrom9: 200 }
  },
  {
    title: 'Tour Mont Saint Michel',
    slug: 'tour-mont-saint-michel',
    pricingMode: 'table',
    pricingTable: { p3: 600, p4: 600, p5: 700, p6: 800, p7: 880, p8: 1000, extraFrom9: 120 }
  },
  {
    title: 'Tour Castillos del Valle de Loira',
    slug: 'tour-castillos-valle-loira',
    pricingMode: 'table',
    pricingTable: { p3: 600, p4: 780, p5: 800, p6: 850, p7: 950, p8: 950, extraFrom9: 0 }
  }
];

async function main() {
  console.log('Iniciando actualización de tarifas de tours...');
  
  for (const update of pricingUpdates) {
    try {
      if (update.mode === 'rules') {
        await client.patch(update.id)
          .set({
            pricingMode: 'rules',
            pricingRules: { baseUpTo4EUR: update.base },
            booking: { startingPriceEUR: update.base }
          })
          .commit();
        console.log(`Updated rules price for tour ${update.id}`);
      } else if (update.mode === 'table') {
        await client.patch(update.id)
          .set({
            pricingMode: 'table',
            pricingTable: update.table,
            booking: { startingPriceEUR: update.table?.p3 || update.table?.p4 }
          })
          .commit();
        console.log(`Updated table price for tour ${update.id}`);
      }
    } catch (e: any) {
      console.error(`Error updating tour ${update.id}:`, e.message);
    }
  }

  for (const nt of newTours) {
    try {
      // Check if exists by slug
      const existing = await client.fetch('*[_type == "tour" && slug.current == $slug][0]', { slug: nt.slug });
      if (existing) {
        await client.patch(existing._id)
          .set({
            pricingMode: nt.pricingMode,
            pricingTable: nt.pricingTable,
            booking: { startingPriceEUR: nt.pricingTable.p3 || nt.pricingTable.p4 }
          })
          .commit();
        console.log(`Updated existing new tour ${nt.title}`);
      } else {
        await client.create({
          _type: 'tour',
          _id: randomUUID(),
          title: nt.title,
          slug: { current: nt.slug },
          pricingMode: nt.pricingMode,
          pricingTable: nt.pricingTable,
          booking: { startingPriceEUR: nt.pricingTable.p3 || nt.pricingTable.p4 },
          route: { origin: 'París', destination: nt.title.split(' (')[0], circuitName: 'Full day' },
          isPopular: false,
          translations: {
            en: { title: nt.title.replace('Tour', 'Tour') },
            fr: { title: nt.title }
          }
        });
        console.log(`Created new tour ${nt.title}`);
      }
    } catch (e: any) {
      console.error(`Error creating/updating new tour ${nt.title}:`, e.message);
    }
  }
  console.log('¡Proceso finalizado!');
}

main().catch(console.error);
