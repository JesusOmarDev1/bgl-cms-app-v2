import "server-only"
import { getDirectusCodes } from "@/lib/directus/directus-error"
import { TRUSTED_ERROR_CODES, directusLogger } from "@/lib/directus/logger"
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

/** An entry without an official code means the body is not the one we expect. */
function hasUncodedEntry(error: unknown): boolean {
  if (!isRecord(error)) return false
  const data = isRecord(error.data) ? error.data : undefined
  return [error.errors, data?.errors]
    .flatMap((source) => (Array.isArray(source) ? source : []))
    .some(
      (entry) =>
        !isRecord(entry) ||
        !isRecord(entry.extensions) ||
        typeof entry.extensions.code !== "string"
    )
}

function statusOf(error: unknown): number | undefined {
  if (!isRecord(error)) return undefined
  const response = isRecord(error.response) ? error.response : undefined
  for (const candidate of [response?.status, error.status]) {
    if (
      typeof candidate === "number" &&
      Number.isInteger(candidate) &&
      candidate >= 100 &&
      candidate <= 599
    ) {
      return candidate
    }
  }
  return undefined
}

/** Log safe diagnostics for a Directus query failure; event text is intentionally omitted. */
export function returnDirectusQueryError(
  error: unknown,
  _message: string,
  context: LogContext
): void {
  const codes = getDirectusCodes(error)
  const warningOnly =
    codes.length > 0 &&
    !hasUncodedEntry(error) &&
    codes.every(isDirectusWarnCode)
  const loggable = codes.filter((candidate) =>
    TRUSTED_ERROR_CODES.has(candidate)
  )
  const code =
    loggable.find((candidate) => !isDirectusWarnCode(candidate)) ?? loggable[0]
  const ctx: LogContext = {
    component: context.component,
    operation: context.operation,
    collection: context.collection,
    code: code ?? context.code,
    status: statusOf(error),
  }

  if (warningOnly) {
    directusLogger.warn("Directus query failed", ctx)
    return
  }

  directusLogger.error("Directus query failed", ctx)
}
