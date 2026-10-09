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

export async function getSubLinksQuery(
  query: SubLinksQuery,
  failedToFetchMessage: string
) {
  "use cache"
  cacheTag("sub_links")
  cacheLife("minutes")
  const { limit = 10, page = 1 } = query
  try {
    const items = await directus.request(
      readItems("sub_links", {
        fields: SUB_LINKS_FIELDS,
        limit,
        page,
        sort: ["-date_created"],
      } satisfies Query<Schema, SubLinksTypes>)
    )
    return items
  } catch (error) {
    returnDirectusQueryError(error, failedToFetchMessage, {
      component: "db.queries",
      operation: "getSubLinksQuery",
      collection: "sub_links",
    })
    return []
  }
}

export async function getSubLinksCountQuery(failedToFetchMessage: string) {
  "use cache"
  cacheTag("sub_links_count")
  cacheLife("minutes")
  try {
    const rows = await directus.request(
      aggregate("sub_links", {
        aggregate: { count: "*" },
      })
    )
    return parseAggregateCount(rows[0]?.count)
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
