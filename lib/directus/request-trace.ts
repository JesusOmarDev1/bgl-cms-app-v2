import "server-only"
import { directusLogger } from "@/lib/directus/logger"
import type { Logger } from "@/types/shared/logger/logger"

function getCollection(input: RequestInfo | URL): string | undefined {
  try {
    const rawUrl =
      typeof input === "string"
        ? input
        : input instanceof URL
          ? input.href
          : input.url
    const segments = new URL(rawUrl).pathname.split("/")
    return segments[1] === "items" ? segments[2] : undefined
  } catch {
    return undefined
  }
}

export function createDirectusTraceFetch(
  fetcher: typeof fetch,
  logger: Logger = directusLogger
): typeof fetch {
  return async (input, init) => {
    const collection = getCollection(input)
    const startedAt = performance.now()
    const trace = (
      event: "request.start" | "request.success" | "request.failure",
      status?: number,
      durationMs?: number
    ) => {
      try {
        logger.info("Directus request", {
          component: "db.queries",
          collection,
          event,
          status,
          durationMs,
        })
      } catch {
        // Diagnostics must never change the SDK request contract.
      }
    }

    trace("request.start")
    try {
      const response = await fetcher(input, init)
      trace(
        response.ok ? "request.success" : "request.failure",
        response.status,
        performance.now() - startedAt
      )
      return response
    } catch (error) {
      trace("request.failure", undefined, performance.now() - startedAt)
      throw error
    }
  }
}
