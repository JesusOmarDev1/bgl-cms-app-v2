import "server-only"
import { serverPing } from "@directus/sdk"
import directus from "@/config/directus"
import { returnDirectusQueryError } from "@/lib/directus/query-error"
import { HealthResult } from "@/types/shared/health/health-result"
import { cacheLife, cacheTag } from "next/cache"

async function fetchHealth(): Promise<HealthResult> {
  "use cache"
  cacheTag("health")
  cacheLife("minutes")
  const start = performance.now()
  await directus.request(serverPing())
  const responseTime = performance.now() - start
  return { status: "ok", responseTime, ping: true }
}

export async function getHealthQuery(
  failedToFetchMessage: string
): Promise<HealthResult> {
  const start = performance.now()
  try {
    return await fetchHealth()
  } catch (error) {
    const responseTime = performance.now() - start
    returnDirectusQueryError(error, failedToFetchMessage, {
      component: "db.queries",
      operation: "getHealthQuery",
      collection: "health",
    })
    return { status: "unreachable", responseTime, ping: false }
  }
}
