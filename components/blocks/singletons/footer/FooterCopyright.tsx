"use client"
import { useCurrentYear } from "@/hooks/useCurrentYear"

export function FooterCopyright() {
  const currentYear = useCurrentYear()
  return (
    <p className="py-0 text-white/60 sm:text-lg" suppressHydrationWarning>
      &copy;{currentYear} BGL BASCULAS INDUSTRIALES. TODOS LOS DERECHOS
      RESERVADOS.
    </p>
  )
}
