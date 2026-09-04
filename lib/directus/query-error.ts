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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

function readErrors(value: unknown): unknown[] | undefined {
  if (!isRecord(value) || !Array.isArray(value.errors)) return undefined
  return value.errors
}

function readCode(errors: unknown[]): string | undefined {
  const first = errors[0]
  if (!isRecord(first) || !isRecord(first.extensions)) return undefined
  return typeof first.extensions.code === "string"
    ? first.extensions.code
    : undefined
}

function readRawMessage(errors: unknown[]): string | undefined {
  const first = errors[0]
  if (!isRecord(first)) return undefined
  return typeof first.message === "string" ? first.message : undefined
}

function extractDirectusErrorInfo(error: unknown): {
  code?: string
  rawMessage?: string
} {
  if (isDirectusError(error)) {
    return {
      code: error.errors[0]?.extensions.code,
      rawMessage: error.errors[0]?.message ?? error.message,
    }
  }

  const nested = isRecord(error) ? readErrors(error.data) : undefined
  const top = readErrors(error)
  const errors = nested ?? top

  if (errors !== undefined) {
    return {
      code: readCode(errors),
      rawMessage:
        readRawMessage(errors) ??
        (error instanceof Error ? error.message : undefined),
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
export function logDirectusQueryError(
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
