import "server-only"

import type { Query } from "@directus/sdk"
import { aggregate, readItems } from "@directus/sdk"
import { getTranslations } from "next-intl/server"

import directus from "@/config/directus"
import { PRODUCT_ATTRIBUTES_FIELDS } from "@/services/domain/db/queries/collections/product-attributes/product-attributes.fields"
import type { ProductAttributesTypes } from "@/types/collections/product-attributes"
import type { StatusType } from "@/types/enums/status-type"
import type { Schema } from "@/types/schema"

export interface ProductAttributesQuery {
  status?: StatusType
  limit?: number
  page?: number
}

export async function getProductAttributesQuery(query: ProductAttributesQuery) {
  const { status = "published", limit = 10, page = 1 } = query
  const t = await getTranslations("db.product_attributes")
  try {
    const productAttributes = await directus.request(
      readItems("product_attributes", {
        fields: PRODUCT_ATTRIBUTES_FIELDS as unknown as Query<
          Schema,
          ProductAttributesTypes
        >["fields"],
        limit,
        page,
        sort: ["-date_created"],
        filter: { status: { _eq: status } },
      } satisfies Query<Schema, ProductAttributesTypes>)
    )
    return productAttributes
  } catch (error) {
    console.error(error instanceof Error ? error.message : t("failed_to_fetch"))
    return []
  }
}

export async function getProductAttributesCountQuery(
  query: Pick<ProductAttributesQuery, "status"> = {}
) {
  const { status = "published" } = query
  const t = await getTranslations("db.product_attributes")
  try {
    const result = await directus.request(
      aggregate("product_attributes", {
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

export type ProductAttributesQueryResult = Awaited<
  ReturnType<typeof getProductAttributesQuery>
>
export type ProductAttributesCountQueryResult = Awaited<
  ReturnType<typeof getProductAttributesCountQuery>
>
