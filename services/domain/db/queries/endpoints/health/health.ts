import "server-only"
import { serverHealth } from "@directus/sdk"
import { getTranslations } from "next-intl/server"
import directus from "@/config/directus"
import { logDirectusQueryError } from "@/lib/directus/query-error"
import { HealthResult } from "@/types/shared/health-result"
import { HEALTH_FIELDS } from "./health.fields"

export async function getHealthQuery(): Promise<HealthResult> {
  const t = await getTranslations("db.health")
  const start = performance.now()
  const [statusField] = HEALTH_FIELDS

  try {
    const health = await directus.request(serverHealth())
    const responseTime = performance.now() - start
    return { status: health[statusField], responseTime, ping: true }
  } catch (error) {
    const responseTime = performance.now() - start
    logDirectusQueryError(error, t("failed_to_fetch"), {
      component: "db.queries",
      operation: "getHealthQuery",
      collection: "health",
    })
    return { status: "unreachable", responseTime, ping: false }
  }
}
