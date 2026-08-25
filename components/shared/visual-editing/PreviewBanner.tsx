"use client"

import { useEffect } from "react"
import showToast from "@/hooks/useToast"

export function PreviewBanner() {
  useEffect(() => {
    showToast({
      title: "Modo preview",
      message:
        "Estás viendo esta página en modo de vista previa. El contenido puede incluir borradores y cambios no publicados.",
      variant: "info",
      duration: Infinity,
    })
  }, [])

  return null
}
