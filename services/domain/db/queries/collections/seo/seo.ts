import "server-only"
import type { Query } from "@directus/sdk"
import { aggregate, readItems } from "@directus/sdk"
import directus from "@/config/directus"
import { parseAggregateCount } from "@/lib/formatting/parse-aggregate-count"
import { returnDirectusQueryError } from "@/lib/directus/query-error"
import { SEO_FIELDS } from "@/services/domain/db/queries/collections/seo/seo.fields"
import type { SeoTypes } from "@/types/collections/seo"
import type { Schema } from "@/types/schema"
import { cacheLife, cacheTag } from "next/cache"
export interface SeoQuery {
  limit?: number
  page?: number
}

async function fetchSeo(limit: number, page: number) {
  "use cache"
  cacheTag("seo")
  cacheLife("minutes")
  return directus.request(
    readItems("seo", {
      fields: SEO_FIELDS,
      limit,
      page,
      sort: ["-date_created"],
    } satisfies Query<Schema, SeoTypes>)
  )
}

export async function getSeoQuery(
  query: SeoQuery,
  failedToFetchMessage: string
) {
  const { limit = 10, page = 1 } = query
  try {
    return await fetchSeo(limit, page)
  } catch (error) {
    returnDirectusQueryError(error, failedToFetchMessage, {
      component: "db.queries",
      operation: "getSeoQuery",
      collection: "seo",
    })
    return []
  }
}

async function fetchSeoCount() {
  "use cache"
  cacheTag("seo_count")
  cacheLife("minutes")
  const rows = await directus.request(
    aggregate("seo", {
      aggregate: { count: "*" },
    })
  )
  return parseAggregateCount(rows[0]?.count)
}

export async function getSeoCountQuery(failedToFetchMessage: string) {
  try {
    return await fetchSeoCount()
  } catch (error) {
    returnDirectusQueryError(error, failedToFetchMessage, {
      component: "db.queries",
      operation: "getSeoCountQuery",
      collection: "seo",
    })
    return 0
  }
}

export type SeoQueryResult = Awaited<ReturnType<typeof getSeoQuery>>
