import { CSP_DIRECTIVES } from "./csp"
import { isEnvFlagEnabled } from "@/lib/browser/env"

const isVisualEditingEnabled = isEnvFlagEnabled(
  process.env.NEXT_PUBLIC_ENABLE_VISUAL_EDITING
)

export function setSecurityHeaders(response: Response): void {
  if (process.env.NODE_ENV === "production") {
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=63072000; includeSubDomains; preload"
    )
  }

  response.headers.set("Content-Security-Policy", CSP_DIRECTIVES.join("; "))
  response.headers.set("X-Content-Type-Options", "nosniff")
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()"
  )

  if (!isVisualEditingEnabled) {
    response.headers.set("X-Frame-Options", "DENY")
    response.headers.set("Cross-Origin-Opener-Policy", "same-origin")
  }
}
