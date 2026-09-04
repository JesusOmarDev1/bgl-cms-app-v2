import "server-only"

import type { Query } from "@directus/sdk"
import { aggregate, readItems } from "@directus/sdk"
import { getTranslations } from "next-intl/server"

import directus from "@/config/directus"
import { parseAggregateCount } from "@/lib/formatting/parse-aggregate-count"
import { logDirectusQueryError } from "@/lib/directus/query-error"
import { BRANDS_FIELDS } from "@/services/domain/db/queries/collections/brands/brands.fields"
import type { BrandsTypes } from "@/types/collections/brands"
import type { StatusType } from "@/types/enums/status-type"
import type { Schema } from "@/types/schema"

export interface BrandsQuery {
  status?: StatusType
  limit?: number
  page?: number
}

export async function getBrandsQuery(query: BrandsQuery) {
  const { status = "published", limit = 10, page = 1 } = query
  const t = await getTranslations("db.brands")
  try {
    const brands = await directus.request(
      readItems("brands", {
        fields: BRANDS_FIELDS as unknown as Query<
          Schema,
          BrandsTypes
        >["fields"],
        limit,
        page,
        sort: ["-date_created"],
        filter: { status: { _eq: status } },
      } satisfies Query<Schema, BrandsTypes>)
    )
    return brands
  } catch (error) {
    logDirectusQueryError(error, t("failed_to_fetch"), {
      component: "db.queries",
      operation: "getBrandsQuery",
      collection: "brands",
    })
    return []
  }
}

export async function getBrandsCountQuery(
  query: Pick<BrandsQuery, "status"> = {}
) {
  const { status = "published" } = query
  const t = await getTranslations("db.brands")
  try {
    const rows = await directus.request(
      aggregate("brands", {
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
      operation: "getBrandsCountQuery",
      collection: "brands",
    })
    return 0
  }
}

export type BrandsQueryResult = Awaited<ReturnType<typeof getBrandsQuery>>
export type BrandsCountQueryResult = Awaited<
  ReturnType<typeof getBrandsCountQuery>
>
