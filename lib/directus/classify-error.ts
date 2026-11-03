import "server-only"

export const DIRECTUS_ERROR_CATEGORIES = [
  "sessionExpired",
  "sessionInvalid",
  "accessDenied",
  "rateLimited",
  "unavailable",
  "resultUnknown",
  "validationFailed",
  "generic",
] as const

export type DirectusErrorCategory = (typeof DIRECTUS_ERROR_CATEGORIES)[number]

type OperationKind = "read" | "mutation"

type Classification = {
  category: DirectusErrorCategory
  status?: number
  diagnosticCodes: string[]
  unknownCode: boolean
  malformedError: boolean
  transportFailure: boolean
  ambiguousMutationResult: boolean
}

const SESSION_EXPIRED_CODES = new Set(["TOKEN_EXPIRED"])
const SESSION_INVALID_CODES = new Set([
  "INVALID_TOKEN",
  "USER_SUSPENDED",
  "INVALID_IP",
  "INVALID_PROVIDER",
])
const ACCESS_DENIED_CODES = new Set(["FORBIDDEN", "COLLECTION_INACTIVE"])
const RATE_LIMITED_CODES = new Set([
  "REQUESTS_EXCEEDED",
  "EMAIL_LIMIT_EXCEEDED",
])
const UNAVAILABLE_CODES = new Set([
  "SERVICE_UNAVAILABLE",
  "UNEXPECTED_RESPONSE",
  "OUT_OF_DATE",
  "INVALID_PROVIDER_CONFIG",
  "OUT_OF_TIME",
  "INTERNAL_SERVER_ERROR",
])
const VALIDATION_CODES = new Set([
  "FAILED_VALIDATION",
  "INVALID_PAYLOAD",
  "INVALID_FOREIGN_KEY",
  "NOT_NULL_VIOLATION",
  "RECORD_NOT_UNIQUE",
  "VALUE_OUT_OF_RANGE",
  "VALUE_TOO_LONG",
  "UNPROCESSABLE_CONTENT",
])
const KNOWN_CODES = new Set([
  ...SESSION_EXPIRED_CODES,
  ...SESSION_INVALID_CODES,
  ...ACCESS_DENIED_CODES,
  ...RATE_LIMITED_CODES,
  ...UNAVAILABLE_CODES,
  ...VALIDATION_CODES,
  "LIMIT_EXCEEDED",
  "INVALID_CREDENTIALS",
  "INVALID_OTP",
])

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

function validStatus(value: unknown): number | undefined {
  return typeof value === "number" &&
    Number.isInteger(value) &&
    value >= 100 &&
    value <= 599
    ? value
    : undefined
}

function getStatus(error: unknown): number | undefined {
  if (!isRecord(error)) return undefined
  const response = isRecord(error.response) ? error.response : undefined
  return (
    validStatus(response?.status) ??
    validStatus(response?.statusCode) ??
    validStatus(error.status) ??
    validStatus(error.statusCode)
  )
}

function collectCodes(error: unknown): {
  codes: string[]
  unknownCode: boolean
  malformedError: boolean
} {
  if (!isRecord(error)) {
    return { codes: [], unknownCode: false, malformedError: false }
  }

  const sources: unknown[][] = []
  if (Array.isArray(error.errors)) sources.push(error.errors)
  if (isRecord(error.data) && Array.isArray(error.data.errors)) {
    sources.push(error.data.errors)
  }
  const codes: string[] = []
  let unknownCode = false
  let malformedError = false

  for (const source of sources) {
    for (const entry of source) {
      const extensions =
        isRecord(entry) && isRecord(entry.extensions)
          ? entry.extensions
          : undefined
      const code = extensions?.code
      if (typeof code !== "string" || code.length === 0) {
        malformedError = true
      } else if (KNOWN_CODES.has(code)) {
        if (!codes.includes(code)) codes.push(code)
      } else {
        unknownCode = true
      }
    }
  }

  return { codes, unknownCode, malformedError }
}

function isTransportFailure(error: unknown, status?: number): boolean {
  if (status !== undefined || !isRecord(error)) return false
  const name = error.name
  return (
    error instanceof TypeError ||
    name === "AbortError" ||
    name === "TimeoutError" ||
    name === "FetchError"
  )
}

/** Classify server-side Directus/ofetch failures without returning their payloads or text. */
export function classifyDirectusError(
  error: unknown,
  operation: OperationKind = "read"
): Classification {
  const status = getStatus(error)
  const { codes, unknownCode, malformedError } = collectCodes(error)
  const transportFailure = isTransportFailure(error, status)
  let category: DirectusErrorCategory = "generic"

  if (codes.some((code) => SESSION_EXPIRED_CODES.has(code))) {
    category = "sessionExpired"
  } else if (codes.some((code) => SESSION_INVALID_CODES.has(code))) {
    category = "sessionInvalid"
  } else if (
    codes.some((code) => ACCESS_DENIED_CODES.has(code)) ||
    status === 403
  ) {
    category = "accessDenied"
  } else if (
    codes.some((code) => RATE_LIMITED_CODES.has(code)) ||
    status === 429
  ) {
    category = "rateLimited"
  } else if (
    codes.some((code) => UNAVAILABLE_CODES.has(code)) ||
    (status !== undefined && status >= 500) ||
    transportFailure
  ) {
    category = "unavailable"
  } else if (codes.some((code) => VALIDATION_CODES.has(code))) {
    category = "validationFailed"
  }

  const ambiguousMutationResult =
    operation === "mutation" &&
    (transportFailure || (status !== undefined && status >= 500))

  return {
    category: ambiguousMutationResult ? "resultUnknown" : category,
    status,
    diagnosticCodes: codes,
    unknownCode,
    malformedError,
    transportFailure,
    ambiguousMutationResult,
  }
}
