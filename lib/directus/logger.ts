import "server-only"
import { DIRECTUS_LOG_LEVEL } from "@/lib/env/constants"
import { LogLevelEnum, type LogLevel } from "@/types/enums/log-level"
import type { LogContext } from "@/types/shared/logger/log-context"
import type { Logger } from "@/types/shared/logger/logger"

const PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
}

const LEVEL_METHOD: Record<LogLevel, "debug" | "log" | "warn" | "error"> = {
  debug: "debug",
  info: "log",
  warn: "warn",
  error: "error",
}

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

const THROTTLE_PRUNE_EVERY = 64
const throttledKeys = new Map<string, number>()
let throttleOps = 0

function pruneThrottleMap(now: number, windowMs: number): void {
  const staleBefore = now - Math.max(windowMs * 2, 120_000)
  for (const [key, ts] of throttledKeys) {
    if (ts < staleBefore) throttledKeys.delete(key)
  }
}

function throttled(key: string, windowMs: number): boolean {
  if (windowMs <= 0) return true
  const now = performance.now()
  throttleOps++
  if (throttleOps >= THROTTLE_PRUNE_EVERY) {
    throttleOps = 0
    pruneThrottleMap(now, windowMs)
  }
  const last = throttledKeys.get(key)
  if (last !== undefined && now - last < windowMs) return false
  throttledKeys.set(key, now)
  return true
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

const TRUSTED_ERROR_CODES = new Set([
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
 *
 * Classic severity gate: skip if configured priority > event priority.
 * Throttle (60s default) on non-debug, except finite request trace events; Map pruned periodically.
 *
 * Event messages and raw context values are never emitted, including at debug.
 */
export function createLogger(level: LogLevel, throttleMs = 60_000): Logger {
  const window = level === "debug" ? 0 : throttleMs
  const write = (target: LogLevel, _message: string, ctx?: LogContext) => {
    if (PRIORITY[level] > PRIORITY[target]) return

    const component = safeComponent(ctx?.component)
    const location = component ?? "app"
    const event = safeEvent(ctx?.event)
    const throttleKey = `${location}:${target}:${safeErrorCode(ctx?.code) ?? ""}:${ctx?.status ?? ""}`
    if (event === undefined && !throttled(throttleKey, window)) return

    const line = formatHumanLine(target, location, ctx)
    console[LEVEL_METHOD[target]](line)
  }

  return {
    debug: (m, c) => write("debug", m, c),
    info: (m, c) => write("info", m, c),
    warn: (m, c) => write("warn", m, c),
    error: (m, c) => write("error", m, c),
  }
}

/** Process-wide Directus logger governed by `DIRECTUS_LOG_LEVEL`. */
export const directusLogger = createLogger(resolveDirectusLogLevel())
