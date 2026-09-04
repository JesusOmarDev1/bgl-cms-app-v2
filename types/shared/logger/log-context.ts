export interface LogContext {
  component?: string
  operation?: string
  collection?: string
  code?: string
  message?: string // raw error msg — solo debug
  details?: unknown // error crudo — solo debug
}
