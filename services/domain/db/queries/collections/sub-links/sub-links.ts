import "server-only"
import type { Query } from "@directus/sdk"
import { aggregate, readItems } from "@directus/sdk"
import directus from "@/config/directus"
import { parseAggregateCount } from "@/lib/formatting/parse-aggregate-count"
import { returnDirectusQueryError } from "@/lib/directus/query-error"
import { SUB_LINKS_FIELDS } from "@/services/domain/db/queries/collections/sub-links/sub-links.fields"
import type { SubLinksTypes } from "@/types/collections/sub-links"
import type { Schema } from "@/types/schema"
import { cacheLife, cacheTag } from "next/cache"
export interface SubLinksQuery {
  limit?: number
  page?: number
}

async function fetchSubLinks(limit: number, page: number) {
  "use cache"
  cacheTag("sub_links")
  cacheLife("minutes")
  return directus.request(
    readItems("sub_links", {
      fields: SUB_LINKS_FIELDS,
      limit,
      page,
      sort: ["-date_created"],
    } satisfies Query<Schema, SubLinksTypes>)
  )
}

export async function getSubLinksQuery(
  query: SubLinksQuery,
  failedToFetchMessage: string
) {
  const { limit = 10, page = 1 } = query
  try {
    return await fetchSubLinks(limit, page)
  } catch (error) {
    returnDirectusQueryError(error, failedToFetchMessage, {
      component: "db.queries",
      operation: "getSubLinksQuery",
      collection: "sub_links",
    })
    return []
  }
}

async function fetchSubLinksCount() {
  "use cache"
  cacheTag("sub_links_count")
  cacheLife("minutes")
  const rows = await directus.request(
    aggregate("sub_links", {
      aggregate: { count: "*" },
    })
  )
  return parseAggregateCount(rows[0]?.count)
}

export async function getSubLinksCountQuery(failedToFetchMessage: string) {
  try {
    return await fetchSubLinksCount()
  } catch (error) {
    returnDirectusQueryError(error, failedToFetchMessage, {
      component: "db.queries",
      operation: "getSubLinksCountQuery",
      collection: "sub_links",
    })
    return 0
  }
}

export type SubLinksQueryResult = Awaited<ReturnType<typeof getSubLinksQuery>>
