import type { Status } from "@/components/shared/debug/StatusIndicator"
import type { HealthStatusType } from "@/types/enums/health-status"

export const HEALTH_RESPONSE_TIME_DEGRADED_MS = 800
export const HEALTH_RESPONSE_TIME_CRITICAL_MS = 3000

export const STATUS_UI: Record<
  HealthStatusType,
  { icon: string; variant: "default" | "secondary" | "destructive" }
> = {
  ok: { icon: "check_circle", variant: "default" },
  warn: { icon: "warning", variant: "secondary" },
  error: { icon: "error", variant: "destructive" },
  unreachable: { icon: "cloud_off", variant: "destructive" },
}

const HEALTH_STATUS_TO_INDICATOR_STATUS: Record<HealthStatusType, Status> = {
  ok: "operational",
  warn: "degraded",
  error: "partial-outage",
  unreachable: "major-outage",
}

type HealthStatusResolutionInput = {
  status: HealthStatusType
  responseTime?: number
  ping?: boolean
  maintenanceInProgress?: boolean
}

type LatencySeverity = "normal" | "degraded" | "critical"
type HealthIndicatorHint =
  "maintenance" | "degraded-latency" | "critical-latency"

function resolveLatencySeverity(responseTime?: number): LatencySeverity {
  if (typeof responseTime !== "number" || Number.isNaN(responseTime)) {
    return "normal"
  }

  if (responseTime > HEALTH_RESPONSE_TIME_CRITICAL_MS) {
    return "critical"
  }

  if (responseTime >= HEALTH_RESPONSE_TIME_DEGRADED_MS) {
    return "degraded"
  }

  return "normal"
}

export function resolveHealthIndicatorStatus({
  status,
  responseTime,
  ping = true,
  maintenanceInProgress = false,
}: HealthStatusResolutionInput): Status {
  if (maintenanceInProgress) {
    return "maintenance"
  }

  if (!ping || status === "unreachable") {
    return "major-outage"
  }

  const baseStatus = HEALTH_STATUS_TO_INDICATOR_STATUS[status]
  const latencySeverity = resolveLatencySeverity(responseTime)

  if (latencySeverity === "critical") {
    return "partial-outage"
  }

  if (latencySeverity === "degraded" && baseStatus === "operational") {
    return "degraded"
  }

  return baseStatus
}

export function resolveHealthIndicatorHint({
  status,
  responseTime,
  ping = true,
  maintenanceInProgress = false,
}: HealthStatusResolutionInput): HealthIndicatorHint | null {
  if (maintenanceInProgress) {
    return "maintenance"
  }

  if (!ping || status === "unreachable") {
    return null
  }

  const latencySeverity = resolveLatencySeverity(responseTime)
  if (latencySeverity === "critical") {
    return "critical-latency"
  }

  if (latencySeverity === "degraded" && status === "ok") {
    return "degraded-latency"
  }

  return null
}
