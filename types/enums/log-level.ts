export const LogLevelEnum = ["debug", "info", "warn", "error"] as const
export type LogLevel = (typeof LogLevelEnum)[number]
