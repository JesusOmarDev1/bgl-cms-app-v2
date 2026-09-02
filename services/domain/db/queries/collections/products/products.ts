import "server-only"

import type { Query } from "@directus/sdk"
import { aggregate, readItems } from "@directus/sdk"
import { getTranslations } from "next-intl/server"

import directus from "@/config/directus"
import { PRODUCTS_FIELDS } from "@/services/domain/db/queries/collections/products/products.fields"
import type { ProductsTypes } from "@/types/collections/products"
import type { StatusType } from "@/types/enums/status-type"
import type { Schema } from "@/types/schema"

export interface ProductsQuery {
  status?: StatusType
  limit?: number
  page?: number
}

const PRODUCTS_DEEP = {
  attributes: { _sort: ["sort"] },
  images: { _sort: ["sort"] },
  related_products: { _sort: ["sort"] },
  tags: { _sort: ["sort"] },
} as unknown as Query<Schema, ProductsTypes>["deep"]

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
        deep: PRODUCTS_DEEP,
      } satisfies Query<Schema, ProductsTypes>)
    )
    return products
  } catch (error) {
    console.error(error instanceof Error ? error.message : t("failed_to_fetch"))
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
        deep: PRODUCTS_DEEP,
      } satisfies Query<Schema, ProductsTypes>)
    )
    return products
  } catch (error) {
    console.error(error instanceof Error ? error.message : t("failed_to_fetch"))
    return []
  }
}

export async function getProductsCountQuery(
  query: Pick<ProductsQuery, "status"> = {}
) {
  const { status = "published" } = query
  const t = await getTranslations("db.products")
  try {
    const result = await directus.request(
      aggregate("products", {
        aggregate: { count: "*" },
        query: {
          filter: { status: { _eq: status } },
        },
      })
    )
    const total = result[0]?.count
    if (total === null || total === undefined) return 0
    const parsed = Number.parseInt(total, 10)
    return Number.isFinite(parsed) ? parsed : 0
  } catch (error) {
    console.error(error instanceof Error ? error.message : t("failed_to_fetch"))
    return 0
  }
}

export type ProductsQueryResult = Awaited<ReturnType<typeof getProductsQuery>>
export type ProductsCountQueryResult = Awaited<
  ReturnType<typeof getProductsCountQuery>
>
