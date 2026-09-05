import {
  StatusIndicator,
  type StatusIndicatorProps,
} from "@/components/shared/debug/StatusIndicator"
import type { HealthStatusType } from "@/types/enums/health-status"
import { resolveHealthView } from "./helpers"

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
  const { indicatorStatus } = resolveHealthView({
    status,
    responseTime,
    ping,
    maintenanceInProgress,
  })

  return <StatusIndicator status={indicatorStatus} {...props} />
}

export type { HealthStatusIndicatorProps }
