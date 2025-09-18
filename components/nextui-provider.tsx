"use client"

import React from "react"

// Wrapper neutro: se eliminó dependencia a @nextui-org/react porque no está instalada.
// Si más adelante se quiere usar NextUI, reinstalar paquete y restaurar import original.
export function NextUIProviders({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
