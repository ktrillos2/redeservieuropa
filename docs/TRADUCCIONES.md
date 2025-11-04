# Sistema de Traducciones - Redeservi Europa

## Arquitectura

El sistema de traducciones utiliza **Sanity CMS** como fuente de datos, permitiendo gestionar todas las traducciones de forma centralizada sin necesidad de deployar código.

## Estructura

```
sanity/schemaTypes/
  └── translation.ts        (Schema de traducciones)

lib/
  └── i18n-sanity.ts       (Utilidades y queries)

contexts/
  └── i18n-context.tsx     (Provider y hook de React)

components/
  └── language-switcher.tsx (Selector de idioma)

scripts/
  └── seed-translations.ts  (Script para importar traducciones iniciales)
```

## Configuración Inicial

### 1. Importar traducciones a Sanity

```bash
npm run seed:translations
# o
npx tsx scripts/seed-translations.ts
```

Este script importará todas las traducciones del archivo `locales/es.json` a Sanity.

### 2. Completar traducciones en Sanity Studio

1. Abre Sanity Studio: `http://localhost:3000/admin`
2. Ve a "Traducciones"
3. Edita cada entrada y completa los campos `en`, `de`, `fr`

## Schema de Traducción en Sanity

Cada entrada de traducción tiene:

- **key**: Clave de traducción (ej: `home.hero.title`)
- **section**: Sección a la que pertenece (common, home, checkout, thanks, etc.)
- **es**: Texto en español (obligatorio)
- **en**: Texto en inglés (opcional)
- **de**: Texto en alemán (opcional)
- **fr**: Texto en francés (opcional)
- **description**: Nota sobre dónde se usa

## Uso en Componentes

## Uso en Componentes

### 1. En componentes de cliente

```tsx
'use client'

import { useTranslation } from '@/contexts/i18n-context'

export function MyComponent() {
  const { t, locale, isLoading } = useTranslation()
  
  if (isLoading) {
    return <div>Cargando traducciones...</div>
  }
  
  return (
    <div>
      <h1>{t('home.hero.title')}</h1>
      <p>{t('home.hero.subtitle')}</p>
      <p>Idioma actual: {locale}</p>
    </div>
  )
}
```

### 2. Con interpolación de variables

```tsx
const { t } = useTranslation()

// En Sanity: "paid": "Pagado ahora ({{percent}}%)"
const text = t('thanks.services.paid', { percent: 30 })
// Resultado: "Pagado ahora (30%)"
```

### 3. Cambiar idioma

```tsx
const { setLocale } = useTranslation()

// Cambiar a inglés (recarga traducciones desde Sanity)
await setLocale('en')

// Cambiar a alemán
await setLocale('de')

// Cambiar a francés
await setLocale('fr')
```

## Gestión en Sanity Studio

### Añadir nueva traducción

1. Ve a Sanity Studio → Traducciones
2. Clic en "Create" → "Traducciones"
3. Completa los campos:
   - **Clave**: `checkout.payment.newField`
   - **Sección**: Página de Pago
   - **Español**: "Nuevo campo"
   - **English**: "New field"
   - **Deutsch**: "Neues Feld"
   - **Français**: "Nouveau champ"
4. Guardar

### Editar traducción existente

1. Busca la traducción por su clave
2. Edita los textos en los idiomas necesarios
3. Guardar
4. Los cambios se verán reflejados en 5 minutos (caché)

## Caché y Performance

- Las traducciones se cachean durante **5 minutos**
- Para invalidar el caché manualmente:

```typescript
import { invalidateTranslationsCache } from '@/lib/i18n-sanity'

invalidateTranslationsCache()
```

## Idiomas Disponibles

✅ **Español (es)** - Idioma por defecto
✅ **English (en)**
✅ **Deutsch (de)**
✅ **Français (fr)**

## Secciones Organizadas

- **common**: Textos comunes (botones, loading, errores)
- **home**: Página principal (hero, servicios, testimonios, contacto, footer)
- **checkout**: Página de pago (contacto, servicios, método de pago, validaciones)
- **thanks**: Página de gracias (confirmación, pago, servicios contratados)
- **tours**: Páginas de tours
- **transfers**: Páginas de transfers
- **events**: Páginas de eventos

## Ejemplos de Implementación

## Ejemplos de Implementación

### Página de Gracias (thanks/page.tsx)

```tsx
'use client'

import { useTranslation } from '@/contexts/i18n-context'

export default function ThanksPage() {
  const { t, isLoading } = useTranslation()
  
  if (isLoading) return <div>Loading...</div>
  
  return (
    <div>
      <h1>{t('thanks.title')}</h1>
      <p>{t('thanks.description')}</p>
      
      {/* Sección de pago */}
      <div>
        <h2>{t('thanks.payment.title')}</h2>
        <div>{t('thanks.payment.provider')}: Mollie</div>
        <div>{t('thanks.payment.status')}: Pagado</div>
      </div>
      
      {/* Servicios */}
      <div>
        <h2>{t('thanks.services.title')}</h2>
        {services.map(service => (
          <div key={service.id}>
            <div>{t('thanks.services.date')}: {service.date}</div>
            <div>{t('thanks.services.time')}: {service.time}</div>
            <div>{t('thanks.services.paid', { percent: 30 })}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
```

### Página de Pago (pago/page.tsx)

```tsx
'use client'

import { useTranslation } from '@/contexts/i18n-context'

export default function CheckoutPage() {
  const { t } = useTranslation()
  
  return (
    <div>
      <h1>{t('checkout.title')}</h1>
      
      {/* Información de contacto */}
      <div>
        <h2>{t('checkout.contact.title')}</h2>
        <input 
          placeholder={t('checkout.contact.namePlaceholder')} 
          aria-label={t('checkout.contact.name')}
        />
      </div>
      
      {/* Método de pago */}
      <div>
        <h2>{t('checkout.payment.title')}</h2>
        <p>{t('checkout.payment.depositInfo', { percent: 30 })}</p>
      </div>
    </div>
  )
}
```

## Ventajas de usar Sanity

✅ **Sin deploys**: Actualiza traducciones sin desplegar código
✅ **Interfaz amigable**: Equipo no técnico puede editar traducciones
✅ **Historial**: Sanity guarda historial de cambios
✅ **Preview**: Previsualiza cambios antes de publicar
✅ **Multi-idioma**: Fácil gestión de múltiples idiomas
✅ **Caché inteligente**: Optimizado para performance
✅ **Escalable**: Fácil agregar nuevos idiomas

## Características

✅ **Detección automática del idioma del navegador**
✅ **Persistencia en localStorage**
✅ **Interpolación de variables** con sintaxis `{{variable}}`
✅ **Selector de idioma** en el header (desktop y móvil)
✅ **Cuatro idiomas**: Español, Inglés, Alemán, Francés
✅ **Caché de 5 minutos** para optimizar performance
✅ **Gestión desde Sanity Studio**

## Comandos

```bash
# Importar traducciones iniciales a Sanity
npm run seed:translations

# Limpiar caché de traducciones (si es necesario)
# Se hace automáticamente cada 5 minutos
```

## Notas Importantes

- ⚠️ Todos los componentes que usen `useTranslation` deben ser `'use client'`
- ⚠️ Las traducciones se cachean 5 minutos para mejorar performance
- ⚠️ El español es el idioma por defecto (fallback)
- ⚠️ El `I18nProvider` está en el layout raíz, disponible en toda la app
- ⚠️ Después de editar en Sanity, puede tardar hasta 5 min en verse en la web
