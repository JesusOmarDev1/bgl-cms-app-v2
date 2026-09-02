import "server-only"
import { serverHealth } from "@directus/sdk"
import directus from "@/config/directus"
import { HealthResult } from "@/types/shared/health-result"
import { getTranslations } from "next-intl/server"

export async function getHealthQuery(): Promise<HealthResult> {
  const t = await getTranslations("db.health")
  const start = performance.now()

  try {
    const health = await directus.request(serverHealth())
    const responseTime = performance.now() - start
    return { status: health.status, responseTime, ping: true }
  } catch (error) {
    const responseTime = performance.now() - start
    console.error(error instanceof Error ? error.message : t("failed_to_fetch"))
    return { status: "unreachable", responseTime, ping: false }
  }
}
