import "server-only"
import type { Query } from "@directus/sdk"
import { aggregate, readItems } from "@directus/sdk"
import directus from "@/config/directus"
import { parseAggregateCount } from "@/lib/formatting/parse-aggregate-count"
import { returnDirectusQueryError } from "@/lib/directus/query-error"
import { SERVICES_CATEGORIES_FIELDS } from "@/services/domain/db/queries/collections/services-categories/services-categories.fields"
import type { ServicesCategoriesTypes } from "@/types/collections/services-categories"
import type { StatusType } from "@/types/enums/status-type"
import type { Schema } from "@/types/schema"
import { cacheLife, cacheTag } from "next/cache"
export interface ServicesCategoriesQuery {
  status?: StatusType
  limit?: number
  page?: number
}

export async function getServicesCategoriesQuery(
  query: ServicesCategoriesQuery,
  failedToFetchMessage: string
) {
  "use cache"
  cacheTag("services_categories")
  cacheLife("minutes")
  const { status = "published", limit = 10, page = 1 } = query
  try {
    const items = await directus.request(
      readItems("services_categories", {
        fields: SERVICES_CATEGORIES_FIELDS,
        limit,
        page,
        sort: ["-date_created"],
        filter: { status: { _eq: status } },
      } satisfies Query<Schema, ServicesCategoriesTypes>)
    )
    return items
  } catch (error) {
    returnDirectusQueryError(error, failedToFetchMessage, {
      component: "db.queries",
      operation: "getServicesCategoriesQuery",
      collection: "services_categories",
    })
    return []
  }
}

export async function getServicesCategoriesCountQuery(
  query: Pick<ServicesCategoriesQuery, "status">,
  failedToFetchMessage: string
) {
  "use cache"
  cacheTag("services_categories_count")
  cacheLife("minutes")
  const { status = "published" } = query
  try {
    const rows = await directus.request(
      aggregate("services_categories", {
        aggregate: { count: "*" },
        query: {
          filter: { status: { _eq: status } },
        },
      })
    )
    return parseAggregateCount(rows[0]?.count)
  } catch (error) {
    returnDirectusQueryError(error, failedToFetchMessage, {
      component: "db.queries",
      operation: "getServicesCategoriesCountQuery",
      collection: "services_categories",
    })
    return 0
  }
}

export type ServicesCategoriesQueryResult = Awaited<
  ReturnType<typeof getServicesCategoriesQuery>
>
