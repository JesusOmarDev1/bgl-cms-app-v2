import { HealthResult } from "@/types/shared/health-result"
import { getHealthQuery } from "@/services/domain/db/queries/endpoints/health"

export async function getHealthRepository(): Promise<HealthResult> {
  return await getHealthQuery()
}
