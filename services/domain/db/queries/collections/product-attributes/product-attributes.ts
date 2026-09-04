import "server-only"

import type { Query } from "@directus/sdk"
import { aggregate, readItems } from "@directus/sdk"
import { getTranslations } from "next-intl/server"

import directus from "@/config/directus"
import { parseAggregateCount } from "@/lib/formatting/parse-aggregate-count"
import { logDirectusQueryError } from "@/lib/directus/query-error"
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
    logDirectusQueryError(error, t("failed_to_fetch"), {
      component: "db.queries",
      operation: "getProductAttributesQuery",
      collection: "product_attributes",
    })
    return []
  }
}

export async function getProductAttributesCountQuery(
  query: Pick<ProductAttributesQuery, "status"> = {}
) {
  const { status = "published" } = query
  const t = await getTranslations("db.product_attributes")
  try {
    const rows = await directus.request(
      aggregate("product_attributes", {
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
