import "server-only"
import { classifyDirectusError } from "@/lib/directus/classify-error"
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

/** Log safe diagnostics for a Directus query failure; event text is intentionally omitted. */
export function returnDirectusQueryError(
  error: unknown,
  _message: string,
  context: LogContext
): void {
  const classification = classifyDirectusError(error)
  const { diagnosticCodes, malformedError, unknownCode, status } =
    classification
  const warningOnly =
    diagnosticCodes.length > 0 &&
    !malformedError &&
    !unknownCode &&
    diagnosticCodes.every(isDirectusWarnCode)
  const code =
    diagnosticCodes.find((candidate) => !isDirectusWarnCode(candidate)) ??
    diagnosticCodes[0]
  const ctx: LogContext = {
    component: context.component,
    operation: context.operation,
    collection: context.collection,
    code: code ?? context.code,
    status,
  }

  if (warningOnly) {
    directusLogger.warn("Directus query failed", ctx)
    return
  }

  directusLogger.error("Directus query failed", ctx)
}
