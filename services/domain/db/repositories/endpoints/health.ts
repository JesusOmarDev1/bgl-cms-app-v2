import { getTranslations } from "next-intl/server"
import { HealthResult } from "@/types/shared/health/health-result"
import { getHealthQuery } from "@/services/domain/db/queries/endpoints/health/health"

export async function getHealthRepository(): Promise<HealthResult> {
  const t = await getTranslations("db.health")
  return await getHealthQuery(t("failed_to_fetch"))
}
