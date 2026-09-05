import {
  STATUS_CONFIG,
  type Status,
} from "@/components/shared/debug/StatusIndicator"
import type { HealthStatusType } from "@/types/enums/health-status"
import { cn } from "@/lib/utils"

export const HEALTH_RESPONSE_TIME_DEGRADED_MS = 800
export const HEALTH_RESPONSE_TIME_CRITICAL_MS = 3000

export type LatencySeverity = "normal" | "degraded" | "critical"
export type HealthIndicatorHint =
  "maintenance" | "degraded-latency" | "critical-latency"

export type HealthStatusResolutionInput = {
  status: HealthStatusType
  responseTime?: number
  ping?: boolean
  maintenanceInProgress?: boolean
}

export type HealthView = {
  latency: LatencySeverity
  indicatorStatus: Status
  hint: HealthIndicatorHint | null
  icon: string
}

export const STATUS_UI: Record<HealthStatusType, { icon: string }> = {
  ok: { icon: "check_circle" },
  warn: { icon: "warning" },
  error: { icon: "error" },
  unreachable: { icon: "cloud_off" },
}

export const LATENCY_UI: Record<
  LatencySeverity,
  { pingClassName: string; icon?: string }
> = {
  normal: {
    pingClassName: "text-muted-foreground",
  },
  degraded: {
    pingClassName: "text-amber-700 dark:text-amber-400",
    icon: "warning",
  },
  critical: {
    pingClassName: "text-rose-700 dark:text-rose-400",
    icon: "error",
  },
}

const HEALTH_STATUS_TO_INDICATOR_STATUS: Record<HealthStatusType, Status> = {
  ok: "operational",
  warn: "degraded",
  error: "partial-outage",
  unreachable: "major-outage",
}

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

export function resolveHealthView({
  status,
  responseTime,
  ping = true,
  maintenanceInProgress = false,
}: HealthStatusResolutionInput): HealthView {
  const latency = resolveLatencySeverity(responseTime)
  const cmsUi = STATUS_UI[status]

  if (maintenanceInProgress) {
    return {
      latency,
      indicatorStatus: "maintenance",
      hint: "maintenance",
      icon: "engineering",
    }
  }

  if (!ping || status === "unreachable") {
    return {
      latency,
      indicatorStatus: "major-outage",
      hint: null,
      icon: "cloud_off",
    }
  }

  const baseStatus = HEALTH_STATUS_TO_INDICATOR_STATUS[status]
  const latencyIcon = LATENCY_UI[latency].icon
  const icon = latencyIcon && status === "ok" ? latencyIcon : cmsUi.icon

  if (latency === "critical") {
    return {
      latency,
      indicatorStatus: "partial-outage",
      hint: "critical-latency",
      icon,
    }
  }

  if (latency === "degraded" && baseStatus === "operational") {
    return {
      latency,
      indicatorStatus: "degraded",
      hint: "degraded-latency",
      icon,
    }
  }

  return {
    latency,
    indicatorStatus: baseStatus,
    hint: null,
    icon,
  }
}

export function healthPingClassName(
  latency: LatencySeverity,
  className?: string
) {
  return cn("tabular-nums", LATENCY_UI[latency].pingClassName, className)
}

export function healthToneClassName(status: Status, className?: string) {
  return cn(STATUS_CONFIG[status].text, className)
}

export function healthIconClassName(status: Status, className?: string) {
  return healthToneClassName(status, className)
}

export function healthBadgeClassName(status: Status, className?: string) {
  return cn("uppercase", healthToneClassName(status), className)
}

export function resolveHealthIndicatorStatus(
  input: HealthStatusResolutionInput
): Status {
  return resolveHealthView(input).indicatorStatus
}

export function resolveHealthIndicatorHint(
  input: HealthStatusResolutionInput
): HealthIndicatorHint | null {
  return resolveHealthView(input).hint
}
