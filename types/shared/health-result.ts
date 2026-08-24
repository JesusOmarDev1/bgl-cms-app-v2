import type { HealthStatusType } from "@/types/enums/health-status"

export interface HealthResult {
  status: HealthStatusType
  responseTime: number
  ping: boolean
}
