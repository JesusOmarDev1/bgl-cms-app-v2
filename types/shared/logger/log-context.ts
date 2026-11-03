export interface LogContext {
  component?: string
  operation?: string
  collection?: string
  code?: string
  status?: number
  event?: "request.start" | "request.success" | "request.failure"
  durationMs?: number
}
