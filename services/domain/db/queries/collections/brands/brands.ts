import "server-only"

import type { Query } from "@directus/sdk"
import { aggregate, readItems } from "@directus/sdk"
import { getTranslations } from "next-intl/server"

import directus from "@/config/directus"
import { BRANDS_FIELDS } from "@/services/domain/db/queries/collections/brands/brands.fields"
import type { BrandsTypes } from "@/types/collections/brands"
import type { StatusType } from "@/types/enums/status-type"
import type { Schema } from "@/types/schema"

export interface BrandsQuery {
  status?: StatusType
  limit?: number
  page?: number
}

const BRANDS_DEEP = {
  models: { _sort: ["sort"] },
} as unknown as Query<Schema, BrandsTypes>["deep"]

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
        deep: BRANDS_DEEP,
      } satisfies Query<Schema, BrandsTypes>)
    )
    return brands
  } catch (error) {
    console.error(error instanceof Error ? error.message : t("failed_to_fetch"))
    return []
  }
}

export async function getBrandsCountQuery(
  query: Pick<BrandsQuery, "status"> = {}
) {
  const { status = "published" } = query
  const t = await getTranslations("db.brands")
  try {
    const result = await directus.request(
      aggregate("brands", {
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

export type BrandsQueryResult = Awaited<ReturnType<typeof getBrandsQuery>>
export type BrandsCountQueryResult = Awaited<
  ReturnType<typeof getBrandsCountQuery>
>
