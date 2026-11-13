import "server-only"
import { DIRECTUS_LOG_LEVEL } from "@/lib/env/constants"
import { createLogger as createReusableLogger } from "@/lib/log/logger"
import { LogLevelEnum, type LogLevel } from "@/types/enums/log-level"
import type { LogContext } from "@/types/shared/logger/log-context"
import type { Logger } from "@/types/shared/logger/logger"

function isLogLevel(value: string): value is LogLevel {
  return (LogLevelEnum as readonly string[]).includes(value)
}

/** Resolve `DIRECTUS_LOG_LEVEL`; invalid or missing values fall back to `warn`. */
function resolveDirectusLogLevel(
  raw: string | undefined = DIRECTUS_LOG_LEVEL
): LogLevel {
  if (raw !== undefined && isLogLevel(raw)) return raw
  return "warn"
}

/** Process-relative ms. Wall clock (`new Date()` / `Date.now()`) is illegal during Cache Components prerender. */
function formatTime(): string {
  return `${Math.floor(performance.now())}ms`
}

const TRUSTED_COLLECTIONS = new Set([
  "blog_categories",
  "blog_posts",
  "brands",
  "clients",
  "emails",
  "footer",
  "form_block",
  "form_responses",
  "health",
  "header",
  "manual_categories",
  "manuals",
  "models",
  "pages",
  "phones",
  "product_attributes",
  "product_categories",
  "products",
  "redirects",
  "seo",
  "services",
  "services_button",
  "services_categories",
  "site_settings",
  "social_links",
  "sub_links",
  "suppliers",
  "tags",
  "url_links",
  "whatsapp_button",
])

/** Official codes the logger accepts as safe diagnostics; anything else is dropped. */
export const TRUSTED_ERROR_CODES = new Set([
  "FORBIDDEN",
  "INTERNAL_SERVER_ERROR",
  "INVALID_CREDENTIALS",
  "INVALID_PAYLOAD",
  "INVALID_QUERY",
  "INVALID_TOKEN",
  "ITEM_NOT_FOUND",
  "LIMIT_EXCEEDED",
  "RECORD_NOT_UNIQUE",
  "REQUESTS_EXCEEDED",
  "ROUTE_NOT_FOUND",
  "SERVICE_UNAVAILABLE",
  "TOKEN_EXPIRED",
  "UNKNOWN",
  "UNPROCESSABLE_ENTITY",
  "VALUE_NOT_NULLABLE",
  "VALUE_OUT_OF_RANGE",
])

function safeComponent(value: string | undefined): string | undefined {
  return value === "db.queries" ? value : undefined
}

function safeCollection(value: string | undefined): string | undefined {
  return value !== undefined && TRUSTED_COLLECTIONS.has(value)
    ? value
    : undefined
}

function safeErrorCode(value: string | undefined): string | undefined {
  return value !== undefined && TRUSTED_ERROR_CODES.has(value)
    ? value
    : undefined
}

function safeEvent(
  value: LogContext["event"]
): LogContext["event"] | undefined {
  return value === "request.start" ||
    value === "request.success" ||
    value === "request.failure"
    ? value
    : undefined
}

/** Emit only structured, validated metadata; event text and payloads are never logged. */
function formatHumanLine(
  eventLevel: LogLevel,
  location: string,
  ctx?: LogContext
): string {
  let line = `[${formatTime()}] directus: ${eventLevel} ${location || "app"}`

  const code = safeErrorCode(ctx?.code)
  const collection = safeCollection(ctx?.collection)
  const status = ctx?.status
  const event = safeEvent(ctx?.event)
  const durationMs = ctx?.durationMs

  if (event) line += ` ${event}`
  if (code) line += ` ${code}`
  if (
    status !== undefined &&
    Number.isInteger(status) &&
    status >= 100 &&
    status <= 599
  ) {
    line += ` ${status}`
  }
  if (collection) line += ` (${collection})`
  if (
    durationMs !== undefined &&
    Number.isFinite(durationMs) &&
    durationMs >= 0
  ) {
    line += ` ${durationMs.toFixed(1)}ms`
  }

  return line
}

/**
 * Logger governed by `DIRECTUS_LOG_LEVEL`.
 *
 * - all levels: trusted component and finite code/status/collection metadata only
 * - non-debug: throttled for 60s by default, except finite request trace events
 * - messages and raw context values are never emitted, including at debug
 */
export function createLogger(level: LogLevel, throttleMs = 60_000): Logger {
  return createReusableLogger<LogContext>(level, {
    throttleMs,
    throttleKey: (target, ctx) => {
      const event = safeEvent(ctx?.event)
      if (event !== undefined) return undefined

      const location = safeComponent(ctx?.component) ?? "app"
      return `${location}:${target}:${safeErrorCode(ctx?.code) ?? ""}:${ctx?.status ?? ""}`
    },
    format: (target, _message, ctx) => {
      const location = safeComponent(ctx?.component) ?? "app"
      return formatHumanLine(target, location, ctx)
    },
  })
}

/** Process-wide Directus logger governed by `DIRECTUS_LOG_LEVEL`. */
export const directusLogger = createLogger(resolveDirectusLogLevel())
