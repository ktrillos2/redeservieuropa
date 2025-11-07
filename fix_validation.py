#!/usr/bin/env python3
import re

# Leer el archivo
with open('app/pago/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Patrón a buscar (más flexible con espacios)
old_pattern = r'''    // 1\) Si hay 2\+ cotizaciones, valida el carrito
    if \(cartLen >= 2\) \{
      reasons\.push\(\.\.\.validateCartItems\(carritoState\)\);
    \}

    // 2\) Valida siempre la cotización actual \(la "larga"\)
    reasons\.push\(
      \.\.\.validateSingleBooking\(
        bookingData,
        paymentPickupAddress,
        paymentDropoffAddress
      \)
    \);'''

new_text = r'''    // 1) Si hay 2+ cotizaciones, valida el carrito
    if (cartLen >= 2) {
      reasons.push(...validateCartItems(carritoState));
      
      // Validar información de contacto (que siempre existe)
      const bd = bookingData || {};
      if (!String(bd.contactName || "").trim())
        reasons.push(pageTexts.v_fullName);
      if (!String(bd.contactPhone || "").trim())
        reasons.push(pageTexts.v_validPhone);
      const email = String(bd.contactEmail || "");
      if (!email.trim()) {
        reasons.push(pageTexts.v_validEmail);
      } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
        if (!emailRegex.test(email))
          reasons.push(pageTexts.invalidFormat);
      }
    } else {
      // 2) Si hay 0-1 cotizaciones, valida la cotización actual (la "larga")
      reasons.push(
        ...validateSingleBooking(
          bookingData,
          paymentPickupAddress,
          paymentDropoffAddress
        )
      );
    }'''

# Reemplazar
content_new = re.sub(old_pattern, new_text, content, flags=re.MULTILINE)

if content != content_new:
    print("✅ Reemplazo exitoso")
    with open('app/pago/page.tsx', 'w', encoding='utf-8') as f:
        f.write(content_new)
else:
    print("❌ No se encontró el patrón para reemplazar")
