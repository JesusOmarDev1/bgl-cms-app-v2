import "server-only"
import type { Query } from "@directus/sdk"
import { aggregate, readItems } from "@directus/sdk"
import directus from "@/config/directus"
import { parseAggregateCount } from "@/lib/formatting/parse-aggregate-count"
import { returnDirectusQueryError } from "@/lib/directus/query-error"
import type { PagesTypes } from "@/types/collections/pages"
import type { StatusType } from "@/types/enums/status-type"
import type { Schema } from "@/types/schema"
import { PAGES_FIELDS } from "./pages.fields"
import { cacheLife, cacheTag } from "next/cache"

export interface PagesQuery {
  status?: StatusType
  limit?: number
  page?: number
}

async function fetchPages(status: StatusType, limit: number, page: number) {
  "use cache"
  cacheTag("pages")
  cacheLife("minutes")
  return directus.request(
    readItems("pages", {
      fields: PAGES_FIELDS,
      limit,
      page,
      sort: ["-date_created"],
      filter: { status: { _eq: status } },
    } satisfies Query<Schema, PagesTypes>)
  )
}

export async function getPagesQuery(
  query: PagesQuery,
  failedToFetchMessage: string
) {
  const { status = "published", limit = 10, page = 1 } = query
  try {
    return await fetchPages(status, limit, page)
  } catch (error) {
    returnDirectusQueryError(error, failedToFetchMessage, {
      component: "db.queries",
      operation: "getPagesQuery",
      collection: "pages",
    })
    return []
  }
}

async function fetchPagesBySlug(
  status: StatusType,
  limit: number,
  page: number,
  slug: string
) {
  "use cache"
  cacheTag("pages_by_slug")
  cacheLife("minutes")
  return directus.request(
    readItems("pages", {
      fields: PAGES_FIELDS,
      limit,
      page,
      sort: ["-date_created"],
      filter: { status: { _eq: status }, slug: { _eq: slug } },
    } satisfies Query<Schema, PagesTypes>)
  )
}

export async function getPagesBySlugQuery(
  query: PagesQuery,
  slug: string,
  failedToFetchMessage: string
) {
  const { status = "published", limit = 1, page = 1 } = query
  try {
    return await fetchPagesBySlug(status, limit, page, slug)
  } catch (error) {
    returnDirectusQueryError(error, failedToFetchMessage, {
      component: "db.queries",
      operation: "getPagesBySlugQuery",
      collection: "pages",
    })
    return []
  }
}

async function fetchPagesCount(status: StatusType) {
  "use cache"
  cacheTag("pages_count")
  cacheLife("minutes")
  const rows = await directus.request(
    aggregate("pages", {
      aggregate: { count: "*" },
      query: {
        filter: { status: { _eq: status } },
      },
    })
  )
  return parseAggregateCount(rows[0]?.count)
}

export async function getPagesCountQuery(
  query: Pick<PagesQuery, "status">,
  failedToFetchMessage: string
) {
  const { status = "published" } = query
  try {
    return await fetchPagesCount(status)
  } catch (error) {
    returnDirectusQueryError(error, failedToFetchMessage, {
      component: "db.queries",
      operation: "getPagesCountQuery",
      collection: "pages",
    })
    return 0
  }
}

export type PagesQueryResult = Awaited<ReturnType<typeof getPagesQuery>>
export type PagesCountQueryResult = Awaited<
  ReturnType<typeof getPagesCountQuery>
>
