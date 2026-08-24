import { useState } from "react"
import { isBrowser } from "@/lib/env"
import { useTranslations } from "next-intl"

interface UseCopyToClipboardOptions {
  onSuccess?: () => void
  onError?: (error: Error) => void
  timeout?: number
}

interface UseCopyToClipboardReturn {
  copyToClipboard: (text: string) => Promise<void>
  isCopied: boolean
  error: string | null
  isSupported: boolean
}

function useCopyToClipboard(
  options: UseCopyToClipboardOptions = {}
): UseCopyToClipboardReturn {
  const { onSuccess, onError, timeout = 2000 } = options
  const t = useTranslations("copy_to_clipboard")
  const [isCopied, setIsCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isSupported =
    isBrowser &&
    typeof navigator !== "undefined" &&
    navigator !== null &&
    navigator.clipboard &&
    typeof navigator.clipboard.writeText === "function"

  const copyToClipboard = async (text: string): Promise<void> => {
    if (!isBrowser) {
      throw new Error(t("browser_not_supported"))
    }

    setError(null)

    try {
      if (isSupported) {
        await navigator.clipboard.writeText(text)
      } else {
        const textArea = document.createElement("textarea")
        textArea.value = text
        textArea.style.cssText = "position:fixed;left:-999999px;top:-999999px;"
        document.body.appendChild(textArea)
        textArea.focus()
        textArea.select()

        try {
          // Fallback legacy para navegadores sin Clipboard API
          const legacyDocument = document as unknown as {
            execCommand?: (commandId: string) => boolean
          }
          const successful = legacyDocument.execCommand?.("copy") ?? false
          if (!successful) {
            throw new Error(t("copy_fallback_error"))
          }
        } finally {
          document.body.removeChild(textArea)
        }
      }

      setIsCopied(true)
      onSuccess?.()

      setTimeout(() => setIsCopied(false), timeout)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t("copy_error")
      setError(errorMessage)
      onError?.(err instanceof Error ? err : new Error(errorMessage))
      throw err
    }
  }

  return {
    copyToClipboard,
    isCopied,
    error,
    isSupported,
  }
}

export { useCopyToClipboard }
export default useCopyToClipboard
