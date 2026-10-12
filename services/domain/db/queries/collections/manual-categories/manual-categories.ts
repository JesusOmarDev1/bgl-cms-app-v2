import "server-only"
import type { Query } from "@directus/sdk"
import { aggregate, readItems } from "@directus/sdk"
import directus from "@/config/directus"
import { parseAggregateCount } from "@/lib/formatting/parse-aggregate-count"
import { returnDirectusQueryError } from "@/lib/directus/query-error"
import { MANUAL_CATEGORIES_FIELDS } from "@/services/domain/db/queries/collections/manual-categories/manual-categories.fields"
import type { ManualCategoriesTypes } from "@/types/collections/manual-categories"
import type { StatusType } from "@/types/enums/status-type"
import type { Schema } from "@/types/schema"
import { cacheLife, cacheTag } from "next/cache"

export interface ManualCategoriesQuery {
  status?: StatusType
  limit?: number
  page?: number
}

async function fetchManualCategories(
  status: StatusType,
  limit: number,
  page: number
) {
  "use cache"
  cacheTag("manual_categories")
  cacheLife("minutes")
  return directus.request(
    readItems("manual_categories", {
      fields: MANUAL_CATEGORIES_FIELDS,
      limit,
      page,
      sort: ["-date_created"],
      filter: { status: { _eq: status } },
    } satisfies Query<Schema, ManualCategoriesTypes>)
  )
}

export async function getManualCategoriesQuery(
  query: ManualCategoriesQuery,
  failedToFetchMessage: string
) {
  const { status = "published", limit = 10, page = 1 } = query
  try {
    return await fetchManualCategories(status, limit, page)
  } catch (error) {
    returnDirectusQueryError(error, failedToFetchMessage, {
      component: "db.queries",
      operation: "getManualCategoriesQuery",
      collection: "manual_categories",
    })
    return []
  }
}

async function fetchManualCategoriesCount(status: StatusType) {
  "use cache"
  cacheTag("manual_categories_count")
  cacheLife("minutes")
  const rows = await directus.request(
    aggregate("manual_categories", {
      aggregate: { count: "*" },
      query: {
        filter: { status: { _eq: status } },
      },
    })
  )
  return parseAggregateCount(rows[0]?.count)
}

export async function getManualCategoriesCountQuery(
  query: Pick<ManualCategoriesQuery, "status">,
  failedToFetchMessage: string
) {
  const { status = "published" } = query
  try {
    return await fetchManualCategoriesCount(status)
  } catch (error) {
    returnDirectusQueryError(error, failedToFetchMessage, {
      component: "db.queries",
      operation: "getManualCategoriesCountQuery",
      collection: "manual_categories",
    })
    return 0
  }
}

export type ManualCategoriesQueryResult = Awaited<
  ReturnType<typeof getManualCategoriesQuery>
>
