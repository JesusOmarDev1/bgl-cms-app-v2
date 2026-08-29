import {
  StatusIndicator,
  type StatusIndicatorProps,
} from "@/components/shared/debug/StatusIndicator"
import type { HealthStatusType } from "@/types/enums/health-status"
import { resolveHealthIndicatorStatus } from "./helpers"

type HealthStatusIndicatorProps = Omit<StatusIndicatorProps, "status"> & {
  status: HealthStatusType
  responseTime?: number
  ping?: boolean
  maintenanceInProgress?: boolean
}

export function HealthStatusIndicator({
  status,
  responseTime,
  ping = true,
  maintenanceInProgress = false,
  ...props
}: HealthStatusIndicatorProps) {
  const resolvedStatus = resolveHealthIndicatorStatus({
    status,
    responseTime,
    ping,
    maintenanceInProgress,
  })

  return <StatusIndicator status={resolvedStatus} {...props} />
}

export type { HealthStatusIndicatorProps }
