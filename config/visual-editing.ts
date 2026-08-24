import { useState, useEffect, useCallback } from "react"
import { apply, setAttr } from "@directus/visual-editing"
import { useTranslations } from "next-intl"
import { isEnvFlagEnabled } from "@/lib/env"

const VISUAL_EDITING_PARAM = "visual-editing"
const VISUAL_EDITING_KEY = "directus-visual-editing"

export const isVisualEditingEnabled = isEnvFlagEnabled(
  process.env.NEXT_PUBLIC_ENABLE_VISUAL_EDITING
)

export function useVisualEditing() {
  const [visualEditing, setVisualEditing] = useState(false)
  const t = useTranslations("visual-editing")

  useEffect(() => {
    if (isVisualEditingEnabled) return

    let cancelled = false
    queueMicrotask(() => {
      if (cancelled) return

      const urlParams = new URLSearchParams(window.location.search).get(
        VISUAL_EDITING_PARAM as string
      )

      try {
        if (urlParams === "true") {
          localStorage.setItem(VISUAL_EDITING_KEY, "true")
          setVisualEditing(true)
        } else if (urlParams === "false") {
          localStorage.setItem(VISUAL_EDITING_KEY, "false")
          setVisualEditing(false)
        } else {
          setVisualEditing(localStorage.getItem(VISUAL_EDITING_KEY) === "true")
        }
      } catch (error: unknown) {
        console.error(
          error instanceof Error ? error.message : t("unknown_error")
        )
      }
    })

    return () => {
      cancelled = true
    }
  }, [t])

  const activate = useCallback(() => {
    if (!visualEditing || !process.env.NEXT_PUBLIC_DIRECTUS_URL) return
    apply({
      directusUrl: process.env.NEXT_PUBLIC_DIRECTUS_URL as string,
      onSaved: () => window.location.reload(),
    })
  }, [visualEditing])

  return { isVisualEditingEnabled: visualEditing, setAttr, activate }
}

export { setAttr }
