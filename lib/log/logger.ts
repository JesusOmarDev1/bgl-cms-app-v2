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

const THROTTLE_PRUNE_EVERY = 64

type LoggerOptions<Context extends object> = {
  throttleMs?: number
  format: (level: LogLevel, message: string, context?: Context) => string
  throttleKey?: (level: LogLevel, context?: Context) => string | undefined
}

/** Create a level-filtered logger. Formatting and throttling policy belong to each caller. */
export function createLogger<Context extends object = LogContext>(
  level: LogLevel,
  options: LoggerOptions<Context>
): Logger<Context> {
  const { throttleMs = 60_000, format, throttleKey } = options
  const throttledKeys = new Map<string, number>()
  let throttleOps = 0
  const windowMs = level === "debug" ? 0 : throttleMs

  const write = (target: LogLevel, message: string, context?: Context) => {
    if (PRIORITY[level] > PRIORITY[target]) return

    const key = throttleKey?.(target, context)
    if (key !== undefined && windowMs > 0) {
      const now = performance.now()
      if (++throttleOps >= THROTTLE_PRUNE_EVERY) {
        throttleOps = 0
        const staleBefore = now - Math.max(windowMs * 2, 120_000)
        for (const [entry, timestamp] of throttledKeys) {
          if (timestamp < staleBefore) throttledKeys.delete(entry)
        }
      }
      const last = throttledKeys.get(key)
      if (last !== undefined && now - last < windowMs) return
      throttledKeys.set(key, now)
    }

    console[LEVEL_METHOD[target]](format(target, message, context))
  }

  return {
    debug: (message, context) => write("debug", message, context),
    info: (message, context) => write("info", message, context),
    warn: (message, context) => write("warn", message, context),
    error: (message, context) => write("error", message, context),
  }
}
