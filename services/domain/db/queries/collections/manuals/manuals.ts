import "server-only"
import type { Query } from "@directus/sdk"
import { aggregate, readItems } from "@directus/sdk"
import directus from "@/config/directus"
import { parseAggregateCount } from "@/lib/formatting/parse-aggregate-count"
import { returnDirectusQueryError } from "@/lib/directus/query-error"
import type { ManualsTypes } from "@/types/collections/manuals"
import type { StatusType } from "@/types/enums/status-type"
import type { Schema } from "@/types/schema"
import { MANUALS_FIELDS } from "./manuals.fields"
import { cacheLife, cacheTag } from "next/cache"

export interface ManualsQuery {
  status?: StatusType
  limit?: number
  page?: number
}

async function fetchManuals(status: StatusType, limit: number, page: number) {
  "use cache"
  cacheTag("manuals")
  cacheLife("minutes")
  return directus.request(
    readItems("manuals", {
      fields: MANUALS_FIELDS,
      limit,
      page,
      sort: ["-date_created"],
      filter: { status: { _eq: status } },
    } satisfies Query<Schema, ManualsTypes>)
  )
}

export async function getManualsQuery(
  query: ManualsQuery,
  failedToFetchMessage: string
) {
  const { status = "published", limit = 10, page = 1 } = query
  try {
    return await fetchManuals(status, limit, page)
  } catch (error) {
    returnDirectusQueryError(error, failedToFetchMessage, {
      component: "db.queries",
      operation: "getManualsQuery",
      collection: "manuals",
    })
    return []
  }
}

async function fetchManualsBySlug(
  status: StatusType,
  limit: number,
  page: number,
  slug: string
) {
  "use cache"
  cacheTag("manuals_by_slug")
  cacheLife("minutes")
  return directus.request(
    readItems("manuals", {
      fields: MANUALS_FIELDS,
      limit,
      page,
      sort: ["-date_created"],
      filter: { status: { _eq: status }, slug: { _eq: slug } },
    } satisfies Query<Schema, ManualsTypes>)
  )
}

export async function getManualsBySlugQuery(
  query: ManualsQuery,
  slug: string,
  failedToFetchMessage: string
) {
  const { status = "published", limit = 1, page = 1 } = query
  try {
    return await fetchManualsBySlug(status, limit, page, slug)
  } catch (error) {
    returnDirectusQueryError(error, failedToFetchMessage, {
      component: "db.queries",
      operation: "getManualsBySlugQuery",
      collection: "manuals",
    })
    return []
  }
}

async function fetchManualsCount(status: StatusType) {
  "use cache"
  cacheTag("manuals_count")
  cacheLife("minutes")
  const rows = await directus.request(
    aggregate("manuals", {
      aggregate: { count: "*" },
      query: {
        filter: { status: { _eq: status } },
      },
    })
  )
  return parseAggregateCount(rows[0]?.count)
}

export async function getManualsCountQuery(
  query: Pick<ManualsQuery, "status">,
  failedToFetchMessage: string
) {
  const { status = "published" } = query
  try {
    return await fetchManualsCount(status)
  } catch (error) {
    returnDirectusQueryError(error, failedToFetchMessage, {
      component: "db.queries",
      operation: "getManualsCountQuery",
      collection: "manuals",
    })
    return 0
  }
}

export type ManualsQueryResult = Awaited<ReturnType<typeof getManualsQuery>>
export type ManualsCountQueryResult = Awaited<
  ReturnType<typeof getManualsCountQuery>
>
