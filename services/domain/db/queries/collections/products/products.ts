import "server-only"

import type { Query } from "@directus/sdk"
import { aggregate, readItems } from "@directus/sdk"

import directus from "@/config/directus"
import { parseAggregateCount } from "@/lib/formatting/parse-aggregate-count"
import { returnDirectusQueryError } from "@/lib/directus/query-error"
import { PRODUCTS_FIELDS } from "@/services/domain/db/queries/collections/products/products.fields"
import type { ProductsTypes } from "@/types/collections/products"
import type { StatusType } from "@/types/enums/status-type"
import type { Schema } from "@/types/schema"
import { cacheLife, cacheTag } from "next/cache"

export interface ProductsQuery {
  status?: StatusType
  limit?: number
  page?: number
}

export async function getProductsQuery(
  query: ProductsQuery,
  failedToFetchMessage: string
) {
  "use cache"
  cacheTag("products")
  cacheLife("minutes")
  const { status = "published", limit = 10, page = 1 } = query
  try {
    const products = await directus.request(
      readItems("products", {
        fields: PRODUCTS_FIELDS,
        limit,
        page,
        sort: ["-date_created"],
        filter: { status: { _eq: status } },
      } satisfies Query<Schema, ProductsTypes>)
    )
    return products
  } catch (error) {
    returnDirectusQueryError(error, failedToFetchMessage, {
      component: "db.queries",
      operation: "getProductsQuery",
      collection: "products",
    })
    return []
  }
}

export async function getProductsBySlugQuery(
  query: ProductsQuery,
  slug: string,
  failedToFetchMessage: string
) {
  "use cache"
  cacheTag("products_by_slug")
  cacheLife("minutes")
  const { status = "published", limit = 1, page = 1 } = query
  try {
    const products = await directus.request(
      readItems("products", {
        fields: PRODUCTS_FIELDS,
        limit,
        page,
        sort: ["-date_created"],
        filter: { status: { _eq: status }, slug: { _eq: slug } },
      } satisfies Query<Schema, ProductsTypes>)
    )
    return products
  } catch (error) {
    returnDirectusQueryError(error, failedToFetchMessage, {
      component: "db.queries",
      operation: "getProductsBySlugQuery",
      collection: "products",
    })
    return []
  }
}

export async function getProductsCountQuery(
  query: Pick<ProductsQuery, "status">,
  failedToFetchMessage: string
) {
  "use cache"
  cacheTag("products_count")
  cacheLife("minutes")
  const { status = "published" } = query
  try {
    const rows = await directus.request(
      aggregate("products", {
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
      operation: "getProductsCountQuery",
      collection: "products",
    })
    return 0
  }
}

export type ProductsQueryResult = Awaited<ReturnType<typeof getProductsQuery>>
export type ProductsCountQueryResult = Awaited<
  ReturnType<typeof getProductsCountQuery>
>
