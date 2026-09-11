import "server-only"
import { serverHealth } from "@directus/sdk"
import { getTranslations } from "next-intl/server"
import directus from "@/config/directus"
import { logDirectusQueryError } from "@/lib/directus/query-error"
import { HealthResult } from "@/types/shared/health/health-result"
import { HEALTH_FIELDS } from "./health.fields"
import { cacheLife, cacheTag } from "next/cache"

export async function getHealthQuery(): Promise<HealthResult> {
  "use cache"
  cacheTag("health")
  cacheLife("seconds")
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
