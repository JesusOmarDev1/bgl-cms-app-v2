import "server-only"

import type { Query } from "@directus/sdk"
import { aggregate, readItems } from "@directus/sdk"

import directus from "@/config/directus"
import { parseAggregateCount } from "@/lib/formatting/parse-aggregate-count"
import { returnDirectusQueryError } from "@/lib/directus/query-error"
import { PRODUCT_ATTRIBUTES_FIELDS } from "@/services/domain/db/queries/collections/product-attributes/product-attributes.fields"
import type { ProductAttributesTypes } from "@/types/collections/product-attributes"
import type { StatusType } from "@/types/enums/status-type"
import type { Schema } from "@/types/schema"
import { cacheLife, cacheTag } from "next/cache"

export interface ProductAttributesQuery {
  status?: StatusType
  limit?: number
  page?: number
}

async function fetchProductAttributes(
  status: StatusType,
  limit: number,
  page: number
) {
  "use cache"
  cacheTag("product_attributes")
  cacheLife("minutes")
  return directus.request(
    readItems("product_attributes", {
      fields: PRODUCT_ATTRIBUTES_FIELDS,
      limit,
      page,
      sort: ["-date_created"],
      filter: { status: { _eq: status } },
    } satisfies Query<Schema, ProductAttributesTypes>)
  )
}

export async function getProductAttributesQuery(
  query: ProductAttributesQuery,
  failedToFetchMessage: string
) {
  const { status = "published", limit = 10, page = 1 } = query
  try {
    return await fetchProductAttributes(status, limit, page)
  } catch (error) {
    returnDirectusQueryError(error, failedToFetchMessage, {
      component: "db.queries",
      operation: "getProductAttributesQuery",
      collection: "product_attributes",
    })
    return []
  }
}

async function fetchProductAttributesCount(status: StatusType) {
  "use cache"
  cacheTag("product_attributes_count")
  cacheLife("minutes")
  const rows = await directus.request(
    aggregate("product_attributes", {
      aggregate: { count: "*" },
      query: {
        filter: { status: { _eq: status } },
      },
    })
  )
  return parseAggregateCount(rows[0]?.count)
}

export async function getProductAttributesCountQuery(
  query: Pick<ProductAttributesQuery, "status">,
  failedToFetchMessage: string
) {
  const { status = "published" } = query
  try {
    return await fetchProductAttributesCount(status)
  } catch (error) {
    returnDirectusQueryError(error, failedToFetchMessage, {
      component: "db.queries",
      operation: "getProductAttributesCountQuery",
      collection: "product_attributes",
    })
    return 0
  }
}

export type ProductAttributesQueryResult = Awaited<
  ReturnType<typeof getProductAttributesQuery>
>
export type ProductAttributesCountQueryResult = Awaited<
  ReturnType<typeof getProductAttributesCountQuery>
>
