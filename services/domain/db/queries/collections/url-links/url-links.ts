import "server-only"
import type { Query } from "@directus/sdk"
import { aggregate, readItems } from "@directus/sdk"
import directus from "@/config/directus"
import { parseAggregateCount } from "@/lib/formatting/parse-aggregate-count"
import { returnDirectusQueryError } from "@/lib/directus/query-error"
import { URL_LINKS_FIELDS } from "@/services/domain/db/queries/collections/url-links/url-links.fields"
import type { UrlLinksTypes } from "@/types/collections/url-links"
import type { Schema } from "@/types/schema"
import { cacheLife, cacheTag } from "next/cache"
export interface UrlLinksQuery {
  limit?: number
  page?: number
}

async function fetchUrlLinks(limit: number, page: number) {
  "use cache"
  cacheTag("url_links")
  cacheLife("minutes")
  return directus.request(
    readItems("url_links", {
      fields: URL_LINKS_FIELDS,
      limit,
      page,
      sort: ["-date_created"],
    } satisfies Query<Schema, UrlLinksTypes>)
  )
}

export async function getUrlLinksQuery(
  query: UrlLinksQuery,
  failedToFetchMessage: string
) {
  const { limit = 10, page = 1 } = query
  try {
    return await fetchUrlLinks(limit, page)
  } catch (error) {
    returnDirectusQueryError(error, failedToFetchMessage, {
      component: "db.queries",
      operation: "getUrlLinksQuery",
      collection: "url_links",
    })
    return []
  }
}

async function fetchUrlLinksCount() {
  "use cache"
  cacheTag("url_links_count")
  cacheLife("minutes")
  const rows = await directus.request(
    aggregate("url_links", {
      aggregate: { count: "*" },
    })
  )
  return parseAggregateCount(rows[0]?.count)
}

export async function getUrlLinksCountQuery(failedToFetchMessage: string) {
  try {
    return await fetchUrlLinksCount()
  } catch (error) {
    returnDirectusQueryError(error, failedToFetchMessage, {
      component: "db.queries",
      operation: "getUrlLinksCountQuery",
      collection: "url_links",
    })
    return 0
  }
}

export type UrlLinksQueryResult = Awaited<ReturnType<typeof getUrlLinksQuery>>
