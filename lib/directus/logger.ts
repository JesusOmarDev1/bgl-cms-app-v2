import "server-only"
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
  raw: string | undefined = process.env.DIRECTUS_LOG_LEVEL
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

/**
 * Human-readable line. Configured error/warn/info: base + code + collection.
 * Configured debug: + raw message + details.
 */
function formatHumanLine(
  configuredLevel: LogLevel,
  eventLevel: LogLevel,
  location: string,
  message: string,
  ctx?: LogContext
): { line: string; details?: unknown } {
  let line = `[${formatTime()}] ${eventLevel.toUpperCase()} ${location || "app"} — ${message}`

  if (ctx?.code) line += ` — ${ctx.code}`
  if (ctx?.collection) line += ` (${ctx.collection})`

  if (configuredLevel === "debug" && ctx?.message) {
    line += ` — ${ctx.message}`
  }

  return {
    line,
    details: configuredLevel === "debug" ? ctx?.details : undefined,
  }
}

function buildLogger(level: LogLevel, windowMs: number): Logger {
  const write = (target: LogLevel, message: string, ctx?: LogContext) => {
    if (PRIORITY[level] > PRIORITY[target]) return

    const location = [ctx?.component, ctx?.operation].filter(Boolean).join(".")
    const throttleKey = `${location}:${message}:${ctx?.code ?? ""}`
    if (!throttled(throttleKey, windowMs)) return

    const { line, details } = formatHumanLine(
      level,
      target,
      location,
      message,
      ctx
    )

    const method = LEVEL_METHOD[target]
    if (details !== undefined) {
      console[method](line, details)
    } else {
      console[method](line)
    }
  }

  return {
    debug: (m, c) => write("debug", m, c),
    info: (m, c) => write("info", m, c),
    warn: (m, c) => write("warn", m, c),
    error: (m, c) => write("error", m, c),
  }
}

/**
 * Logger governed by `DIRECTUS_LOG_LEVEL`.
 *
 * - error/warn/info: location + safe message + code + (collection)
 * - debug: + raw message + details
 *
 * Classic severity gate: skip if configured priority > event priority.
 * Throttle (60s default) on non-debug; Map pruned periodically.
 *
 * Golden rule: first arg `message` is ALWAYS safe. Sensitive data goes in
 * context and only appears when configured level allows.
 */
export function createLogger(level: LogLevel, throttleMs = 60_000): Logger {
  const window = level === "debug" ? 0 : throttleMs
  return buildLogger(level, window)
}

/** Process-wide Directus logger governed by `DIRECTUS_LOG_LEVEL`. */
export const directusLogger = createLogger(resolveDirectusLogLevel())
