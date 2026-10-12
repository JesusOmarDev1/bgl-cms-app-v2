import "server-only"

import type { Query } from "@directus/sdk"
import { aggregate, readItems } from "@directus/sdk"

import directus from "@/config/directus"
import { parseAggregateCount } from "@/lib/formatting/parse-aggregate-count"
import { returnDirectusQueryError } from "@/lib/directus/query-error"
import { PRODUCT_CATEGORIES_FIELDS } from "@/services/domain/db/queries/collections/product-categories/product-categories.fields"
import type { ProductCategoriesTypes } from "@/types/collections/product-categories"
import type { StatusType } from "@/types/enums/status-type"
import type { Schema } from "@/types/schema"
import { cacheLife, cacheTag } from "next/cache"

export interface ProductCategoriesQuery {
  status?: StatusType
  limit?: number
  page?: number
}

async function fetchProductCategories(
  status: StatusType,
  limit: number,
  page: number
) {
  "use cache"
  cacheTag("product_categories")
  cacheLife("minutes")
  return directus.request(
    readItems("product_categories", {
      fields: PRODUCT_CATEGORIES_FIELDS,
      limit,
      page,
      sort: ["-date_created"],
      filter: { status: { _eq: status } },
    } satisfies Query<Schema, ProductCategoriesTypes>)
  )
}

export async function getProductCategoriesQuery(
  query: ProductCategoriesQuery,
  failedToFetchMessage: string
) {
  const { status = "published", limit = 10, page = 1 } = query
  try {
    return await fetchProductCategories(status, limit, page)
  } catch (error) {
    returnDirectusQueryError(error, failedToFetchMessage, {
      component: "db.queries",
      operation: "getProductCategoriesQuery",
      collection: "product_categories",
    })
    return []
  }
}

async function fetchProductCategoriesCount(status: StatusType) {
  "use cache"
  cacheTag("product_categories_count")
  cacheLife("minutes")
  const rows = await directus.request(
    aggregate("product_categories", {
      aggregate: { count: "*" },
      query: {
        filter: { status: { _eq: status } },
      },
    })
  )
  return parseAggregateCount(rows[0]?.count)
}

export async function getProductCategoriesCountQuery(
  query: Pick<ProductCategoriesQuery, "status">,
  failedToFetchMessage: string
) {
  const { status = "published" } = query
  try {
    return await fetchProductCategoriesCount(status)
  } catch (error) {
    returnDirectusQueryError(error, failedToFetchMessage, {
      component: "db.queries",
      operation: "getProductCategoriesCountQuery",
      collection: "product_categories",
    })
    return 0
  }
}

export type ProductCategoriesQueryResult = Awaited<
  ReturnType<typeof getProductCategoriesQuery>
>
export type ProductCategoriesCountQueryResult = Awaited<
  ReturnType<typeof getProductCategoriesCountQuery>
>
