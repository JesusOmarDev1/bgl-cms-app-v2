export const HealthStatusEnum = ["ok", "warn", "error", "unreachable"] as const
export type HealthStatusType = (typeof HealthStatusEnum)[number]
