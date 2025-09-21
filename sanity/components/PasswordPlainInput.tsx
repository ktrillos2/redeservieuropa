import React from 'react'
import type { StringInputProps } from 'sanity'

export default function PasswordPlainInput(props: StringInputProps) {
  const { elementProps, readOnly } = props
  return (
    <input
      {...elementProps}
      type="password"
      autoComplete="new-password"
      placeholder="Nueva contraseña (se hasheará al publicar)"
      disabled={readOnly}
      className="sanity-input sanity-input-text"
    />
  )
}
