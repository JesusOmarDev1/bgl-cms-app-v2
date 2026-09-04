import "server-only"

import type { Query } from "@directus/sdk"
import { aggregate, readItems } from "@directus/sdk"
import { getTranslations } from "next-intl/server"

import directus from "@/config/directus"
import { parseAggregateCount } from "@/lib/formatting/parse-aggregate-count"
import { logDirectusQueryError } from "@/lib/directus/query-error"
import { PRODUCTS_FIELDS } from "@/services/domain/db/queries/collections/products/products.fields"
import type { ProductsTypes } from "@/types/collections/products"
import type { StatusType } from "@/types/enums/status-type"
import type { Schema } from "@/types/schema"

export interface ProductsQuery {
  status?: StatusType
  limit?: number
  page?: number
}

export async function getProductsQuery(query: ProductsQuery) {
  const { status = "published", limit = 10, page = 1 } = query
  const t = await getTranslations("db.products")
  try {
    const products = await directus.request(
      readItems("products", {
        fields: PRODUCTS_FIELDS as unknown as Query<
          Schema,
          ProductsTypes
        >["fields"],
        limit,
        page,
        sort: ["-date_created"],
        filter: { status: { _eq: status } },
      } satisfies Query<Schema, ProductsTypes>)
    )
    return products
  } catch (error) {
    logDirectusQueryError(error, t("failed_to_fetch"), {
      component: "db.queries",
      operation: "getProductsQuery",
      collection: "products",
    })
    return []
  }
}

export async function getProductsBySlugQuery(
  query: ProductsQuery,
  slug: string
) {
  const { status = "published", limit = 1, page = 1 } = query
  const t = await getTranslations("db.products")
  try {
    const products = await directus.request(
      readItems("products", {
        fields: PRODUCTS_FIELDS as unknown as Query<
          Schema,
          ProductsTypes
        >["fields"],
        limit,
        page,
        sort: ["-date_created"],
        filter: { status: { _eq: status }, slug: { _eq: slug } },
      } satisfies Query<Schema, ProductsTypes>)
    )
    return products
  } catch (error) {
    logDirectusQueryError(error, t("failed_to_fetch"), {
      component: "db.queries",
      operation: "getProductsBySlugQuery",
      collection: "products",
    })
    return []
  }
}

export async function getProductsCountQuery(
  query: Pick<ProductsQuery, "status"> = {}
) {
  const { status = "published" } = query
  const t = await getTranslations("db.products")
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
    logDirectusQueryError(error, t("failed_to_fetch"), {
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
