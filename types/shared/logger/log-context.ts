export interface LogContext {
  component?: string
  operation?: string
  collection?: string
  code?: string
  message?: string
  key?: string
  details?: unknown
  path?: string
  ip?: string
  userAgent?: string
  reason?: string
  requestId?: string
  event?: string
}
