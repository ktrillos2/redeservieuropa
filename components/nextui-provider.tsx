"use client"

import React from "react"
import { NextUIProvider } from "@nextui-org/react"

export function NextUIProviders({ children }: { children: React.ReactNode }) {
  return <NextUIProvider>{children}</NextUIProvider>
}
