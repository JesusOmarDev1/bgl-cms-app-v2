import { LogContext } from "@/types/shared/logger/log-context"

export interface Logger<Context extends object = LogContext> {
  debug(message: string, context?: Context): void
  info(message: string, context?: Context): void
  warn(message: string, context?: Context): void
  error(message: string, context?: Context): void
}
