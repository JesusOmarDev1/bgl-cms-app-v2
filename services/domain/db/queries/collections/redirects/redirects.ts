import "server-only"
import type { Query } from "@directus/sdk"
import { aggregate, readItems } from "@directus/sdk"
import directus from "@/config/directus"
import { parseAggregateCount } from "@/lib/formatting/parse-aggregate-count"
import { returnDirectusQueryError } from "@/lib/directus/query-error"
import { REDIRECTS_FIELDS } from "@/services/domain/db/queries/collections/redirects/redirects.fields"
import type { RedirectsTypes } from "@/types/collections/redirects"
import type { Schema } from "@/types/schema"
import { cacheLife, cacheTag } from "next/cache"

export interface RedirectsQuery {
  limit?: number
  page?: number
  origin?: string
}

async function fetchRedirects(
  limit: number,
  page: number,
  origin: string | null
) {
  "use cache"
  cacheTag("redirects")
  cacheLife("minutes")
  return directus.request(
    readItems("redirects", {
      fields: REDIRECTS_FIELDS,
      limit,
      page,
      sort: ["-date_created"],
      ...(origin === null ? {} : { filter: { origin: { _eq: origin } } }),
    } satisfies Query<Schema, RedirectsTypes>)
  )
}

export async function getRedirectsQuery(
  query: RedirectsQuery,
  failedToFetchMessage: string
) {
  const { limit = 10, page = 1, origin = null } = query
  try {
    return await fetchRedirects(limit, page, origin)
  } catch (error) {
    returnDirectusQueryError(error, failedToFetchMessage, {
      component: "db.queries",
      operation: "getRedirectsQuery",
      collection: "redirects",
    })
    return []
  }
}

async function fetchRedirectsCount() {
  "use cache"
  cacheTag("redirects_count")
  cacheLife("minutes")
  const rows = await directus.request(
    aggregate("redirects", {
      aggregate: { count: "*" },
    })
  )
  return parseAggregateCount(rows[0]?.count)
}

export async function getRedirectsCountQuery(failedToFetchMessage: string) {
  try {
    return await fetchRedirectsCount()
  } catch (error) {
    returnDirectusQueryError(error, failedToFetchMessage, {
      component: "db.queries",
      operation: "getRedirectsCountQuery",
      collection: "redirects",
    })
    return 0
  }
}

export type RedirectsQueryResult = Awaited<ReturnType<typeof getRedirectsQuery>>
