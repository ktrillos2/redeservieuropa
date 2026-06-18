# Traducciones de Contenido (Tours y Transfers)

## Estructura

Los tours y transfers ahora tienen un campo `translations` en Sanity que permite agregar versiones en otros idiomas sin modificar la lógica existente.

## Schema en Sanity

### Tours

Cada tour tiene una sección colapsable "Traducciones" con:

```
Traducciones
├── English
│   ├── Title
│   ├── Summary
│   ├── Description
│   ├── Features
│   ├── Includes
│   ├── Visited Places
│   └── Notes
└── Français
    ├── Titre
    ├── Résumé
    ├── Description
    ├── Caractéristiques
    ├── Inclus
    ├── Lieux visités
    └── Notes
```

### Transfers

Cada transfer tiene una sección colapsable "Traducciones" con:

```
Traducciones
├── English
│   ├── From
│   ├── To
│   ├── Brief Info
│   ├── Description
│   └── Duration
└── Français
    ├── Depuis
    ├── Vers
    ├── Info brève
    ├── Description
    └── Durée
```

## Uso en el Código

### Funciones Helper

```typescript
import { getTranslatedTour, getTranslatedTours } from '@/lib/translations-content'
import { useTranslation } from '@/contexts/i18n-context'

// Para un solo tour
const tour = await getTourBySlug('disneyland-paris')
const translatedTour = getTranslatedTour(tour, 'en')

// Para múltiples tours
const tours = await getTours()
const translatedTours = getTranslatedTours(tours, 'fr')
```

### En Server Components

```tsx
import { getTourBySlug } from '@/sanity/lib/tours'
import { getTranslatedTour } from '@/lib/translations-content'

export default async function TourPage({ 
  params 
}: { 
  params: { slug: string } 
}) {
  const locale = 'en' // Obtener del contexto o parámetro
  const tour = await getTourBySlug(params.slug)
  const translatedTour = getTranslatedTour(tour, locale)
  
  return (
    <div>
      <h1>{translatedTour.title}</h1>
      <p>{translatedTour.summary}</p>
      {/* El resto de la lógica permanece igual */}
    </div>
  )
}
```

### En Client Components

```tsx
'use client'

import { useTranslation } from '@/contexts/i18n-context'
import { getTranslatedTour } from '@/lib/translations-content'

export default function TourDetail({ tour }: { tour: any }) {
  const { locale } = useTranslation()
  const translatedTour = getTranslatedTour(tour, locale)
  
  return (
    <div>
      <h2>{translatedTour.title}</h2>
      <p>{translatedTour.summary}</p>
      
      <h3>Características:</h3>
      <ul>
        {translatedTour.features?.map((feature, i) => (
          <li key={i}>{feature}</li>
        ))}
      </ul>
    </div>
  )
}
```

### Con el Hook useTranslation

```tsx
'use client'

import { useEffect, useState } from 'react'
import { useTranslation } from '@/contexts/i18n-context'
import { getTranslatedTour } from '@/lib/translations-content'

export default function TourCard({ tour }: { tour: any }) {
  const { locale } = useTranslation()
  const [translatedTour, setTranslatedTour] = useState(tour)
  
  useEffect(() => {
    setTranslatedTour(getTranslatedTour(tour, locale))
  }, [tour, locale])
  
  return (
    <div>
      <h3>{translatedTour.title}</h3>
      <p>{translatedTour.summary}</p>
    </div>
  )
}
```

## Menú del Header

Las funciones del menú ahora aceptan un parámetro de idioma:

```tsx
// En el Server Component
import { getToursForMenu, getTransfersForMenu } from '@/sanity/lib/general'

export async function HeaderServer() {
  const locale = 'en' // Obtener del contexto
  const tours = await getToursForMenu(locale)
  const transfers = await getTransfersForMenu(locale)
  
  return <Header tours={tours} transfers={transfers} />
}
```

## Comportamiento

### Fallback Automático

Si no hay traducción para un campo en el idioma solicitado, se usa el valor en español:

```typescript
// Tour en Sanity:
{
  title: "Tour Disneyland",
  summary: "Un tour increíble",
  translations: {
    en: {
      title: "Disneyland Tour"
      // summary no está traducido
    }
  }
}

// Al solicitar en inglés:
const tour = getTranslatedTour(tour, 'en')
// Resultado:
{
  title: "Disneyland Tour",      // ✅ Traducido
  summary: "Un tour increíble",   // ✅ Fallback a español
  ...
}
```

### Sin Modificar la Lógica

- ✅ Todos los precios se mantienen iguales
- ✅ Los slugs no cambian
- ✅ Los requisitos (vuelo, etc.) siguen igual
- ✅ La lógica de cálculo de precios no se toca
- ✅ Solo se traducen los campos de texto

## Ventajas

✅ **Sin romper nada** - La lógica existente permanece intacta
✅ **Fácil de mantener** - Traducciones organizadas en Sanity
✅ **Fallback automático** - Si falta traducción, usa español
✅ **Flexible** - Agregar idiomas es fácil
✅ **No duplicar** - Un solo tour/transfer, múltiples idiomas

## Flujo Completo

1. **En Sanity**: Editor completa campos de traducción
2. **Query**: Las funciones obtienen datos con `translations`
3. **Helper**: `getTranslatedTour()` aplica el idioma correcto
4. **Componente**: Usa el tour traducido como siempre
5. **Usuario**: Ve el contenido en su idioma

## Notas

- El español es siempre el idioma base (obligatorio)
- Los idiomas adicionales son opcionales
- Si no hay ninguna traducción, se muestra todo en español
- Los precios, slugs y configuración NO se traducen (son los mismos para todos)
