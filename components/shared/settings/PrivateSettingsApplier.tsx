"use client"

import { useEffect } from "react"
import { usePrivateSettings } from "./use-private-settings"

/**
 * Applies the private-area device preferences to <html>. Mounted once by the
 * dashboard layout and never by the public one: public pages must not read them.
 */
export function PrivateSettingsApplier() {
  const { settings } = usePrivateSettings()
  const reducedMotion = settings?.motion === "reduce"

  useEffect(() => {
    const root = document.documentElement
    // "reduce" forces reduced motion; anything else removes the attribute so
    // the OS prefers-reduced-motion media query decides on its own.
    if (reducedMotion) root.setAttribute("data-motion", "reduce")
    else root.removeAttribute("data-motion")
  }, [reducedMotion])

  return null
}
