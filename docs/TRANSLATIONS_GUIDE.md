# Sistema de Traducciones desde Sanity CMS

## ✅ Estructura Organizada

El sistema de traducciones está organizado por **idioma** primero, y dentro de cada idioma por **páginas**:

### Idiomas Disponibles:
- 🇪🇸 **Español** (idioma por defecto)
- 🇬🇧 **English**
- 🇫🇷 **Français**

### Organización por Secciones:

Cada idioma tiene estas secciones organizadas:

1. **Header** - Menú de navegación
2. **Footer** - Pie de página
3. **Página de Inicio** - Hero, servicios, testimonios, contacto
4. **Página de Pago** - Checkout completo
5. **Página de Gracias** - Confirmación de reserva
6. **Comunes** - Textos generales (botones, mensajes)

## 🚀 Instalación y Configuración

### 1. Importar estructura inicial

```bash
npm run seed:translations
```

Esto creará **3 documentos en Sanity**, uno por idioma:
- 🇪🇸 Español (con todos los textos completos)
- 🇬🇧 English (vacío, para completar)
- 🇫🇷 Français (vacío, para completar)

### 2. Completar traducciones en Sanity

1. Abre **Sanity Studio**: `http://localhost:3000/admin`
2. Ve a **"Traducciones"**
3. Verás 3 documentos (Español, English, Français)
4. Edita cada uno y completa las secciones

## 📋 Estructura en Sanity

Cada documento de idioma tiene estas secciones colapsables:

```
🇪🇸 Español
├── Header
│   ├── Servicios
│   ├── Tours
│   ├── Traslados
│   ├── Eventos
│   ├── Testimonios
│   ├── Contacto
│   └── Mi Cotización
├── Footer
│   ├── Sobre nosotros
│   ├── Servicios
│   ├── Contacto
│   ├── Legal
│   ├── Política de privacidad
│   ├── Términos y condiciones
│   ├── Política de cookies
│   └── Copyright
├── Página de Inicio
│   ├── Hero (título, subtítulo, CTA)
│   ├── Servicios (título, subtítulo)
│   ├── Testimonios (título, subtítulo)
│   └── Contacto (formulario completo)
├── Página de Pago
│   ├── Información de contacto
│   ├── Servicio (todos los campos)
│   ├── Método de pago
│   └── Carrito
├── Página de Gracias
│   ├── Pago (información de pago)
│   ├── Contacto
│   └── Servicios contratados
└── Textos Comunes
    └── Botones, mensajes, etc.
```

## 🎯 Uso en Componentes

```tsx
'use client'

import { useTranslation } from '@/contexts/i18n-context'

export default function MyPage() {
  const { t, locale, setLocale, isLoading } = useTranslation()
  
  if (isLoading) return <div>Cargando...</div>
  
  return (
    <div>
      {/* Traducción simple */}
      <h1>{t('home.hero.title')}</h1>
      
      {/* Con interpolación de variables */}
      <p>{t('checkout.payment.depositInfo', { percent: 30 })}</p>
      
      {/* Otros campos */}
      <button>{t('common.submit')}</button>
      <p>{t('thanks.services.paid', { percent: 30 })}</p>
    </div>
  )
}
```

## 📝 Ejemplos de Claves de Traducción

```typescript
// HEADER
t('header.services')       // "Servicios"
t('header.cart')          // "Mi Cotización"

// FOOTER  
t('footer.about')         // "Sobre nosotros"
t('footer.copyright')     // "© 2025 Redeservi Europa..."

// HOME
t('home.hero.title')      // "Descubre Europa..."
t('home.contact.email')   // "Correo electrónico"

// CHECKOUT
t('checkout.title')                    // "Finalizar Reserva"
t('checkout.contact.name')             // "Nombre completo"
t('checkout.service.passengers')       // "Pasajeros"
t('checkout.payment.depositInfo', { percent: 30 })  // "Pagas el 30% ahora..."

// THANKS
t('thanks.title')                      // "¡Gracias por tu reserva!"
t('thanks.payment.status')             // "Estado"
t('thanks.services.paid', { percent: 30 })  // "Pagado ahora (30%)"

// COMMON
t('common.loading')       // "Cargando..."
t('common.submit')        // "Enviar"
```

## ⚡ Características

✅ **Solo 3 documentos** - Uno por idioma, no 133 entradas separadas
✅ **Organizado por página** - Fácil encontrar y editar
✅ **Secciones colapsables** - Interface limpia en Sanity
✅ **Sin desorden** - Todo estructurado y agrupado
✅ **Caché inteligente** - 5 minutos para optimizar performance
✅ **Detección automática** - Lee idioma del navegador
✅ **Persistencia** - Guarda selección en localStorage
✅ **Interpolación** - Variables con `{{variable}}`
✅ **Fallback** - Si falta traducción, usa español
✅ **Selector integrado** - En header desktop y móvil

## 🌍 Ventajas de esta Estructura

### ✅ Organización Clara
- 1 documento = 1 idioma completo
- Agrupado por páginas (inicio, pago, gracias)
- Fácil de navegar y editar

### ✅ Sin Desorden
- No hay 133 documentos separados
- Todo relacionado está junto
- Secciones colapsables para mejor UX

### ✅ Fácil Mantenimiento  
- Editar una página = abrir 1 sección
- Comparar idiomas = abrir 2 documentos
- Agregar campo = actualizar 3 documentos

## � Comandos

```bash
# Crear/actualizar estructura de traducciones
npm run seed:translations

# Abrir Sanity Studio
npm run dev
# Luego ir a: http://localhost:3000/admin
```

## ⚠️ Notas Importantes

- ⚠️ Componentes que usen `useTranslation()` deben ser `'use client'`
- ⚠️ Caché de 5 minutos (cambios tardan en verse)
- ⚠️ Español es el idioma por defecto (fallback)
- ⚠️ `I18nProvider` ya está en el layout raíz
- ⚠️ Selector de idioma ya integrado en header

## 🎬 Próximos Pasos

1. ✅ Ejecutar `npm run seed:translations` (ya hecho)
2. 📝 Abrir Sanity Studio: `http://localhost:3000/admin`
3. 🇬🇧 Editar documento "English" y completar traducciones
4. 🇫🇷 Editar documento "Français" y completar traducciones
5. 💻 Usar `t('key')` en tus componentes
6. 🚀 ¡Listo para producción!
