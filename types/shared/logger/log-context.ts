export type GenericLogContext = Record<string, unknown>

/** Directus diagnostic metadata retained for backwards-compatible call sites. */
export interface LogContext extends GenericLogContext {
  component?: string
  operation?: string
  collection?: string
  code?: string
  status?: number
  event?: "request.start" | "request.success" | "request.failure"
  durationMs?: number
}
