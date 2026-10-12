import "server-only"
import { isDirectusError } from "@directus/sdk"
import { directusLogger } from "@/lib/directus/logger"
import type { LogContext } from "@/types/shared/logger/log-context"

const DIRECTUS_WARN_CODES = [
  "FORBIDDEN",
  "INVALID_TOKEN",
  "LIMIT_EXCEEDED",
] as const

type DirectusWarnCode = (typeof DIRECTUS_WARN_CODES)[number]

function isDirectusWarnCode(code: string): code is DirectusWarnCode {
  return (DIRECTUS_WARN_CODES as readonly string[]).includes(code)
}

function extractDirectusErrorInfo(error: unknown): {
  code?: string
  rawMessage?: string
} {
  if (isDirectusError(error)) {
    const apiError = error.errors[0]
    return {
      code: apiError?.extensions.code,
      rawMessage: apiError?.message ?? error.message,
    }
  }

  if (error instanceof Error) {
    return { rawMessage: error.message }
  }

  return {}
}

/**
 * Log a Directus query failure. `message` must be a safe i18n string.
 * FORBIDDEN / INVALID_TOKEN / LIMIT_EXCEEDED emit `warn`; other failures emit `error`.
 */
export function returnDirectusQueryError(
  error: unknown,
  message: string,
  context: LogContext
): void {
  const { code, rawMessage } = extractDirectusErrorInfo(error)
  const ctx: LogContext = {
    ...context,
    code: code ?? context.code,
    message: rawMessage ?? context.message,
    details: error,
  }

  if (code !== undefined && isDirectusWarnCode(code)) {
    directusLogger.warn(message, ctx)
    return
  }

  directusLogger.error(message, ctx)
}
