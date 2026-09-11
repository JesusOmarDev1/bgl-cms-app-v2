import "server-only"

import type { Query } from "@directus/sdk"
import { aggregate, readItems } from "@directus/sdk"
import { getTranslations } from "next-intl/server"

import directus from "@/config/directus"
import { parseAggregateCount } from "@/lib/formatting/parse-aggregate-count"
import { logDirectusQueryError } from "@/lib/directus/query-error"
import { SUPPLIERS_FIELDS } from "@/services/domain/db/queries/collections/suppliers/suppliers.fields"
import type { SuppliersTypes } from "@/types/collections/suppliers"
import type { StatusType } from "@/types/enums/status-type"
import type { Schema } from "@/types/schema"
import { cacheLife, cacheTag } from "next/cache"
export interface SuppliersQuery {
  status?: StatusType
  limit?: number
  page?: number
}

export async function getSuppliersQuery(query: SuppliersQuery) {
  "use cache"
  cacheTag("suppliers")
  cacheLife("minutes")
  const { status = "published", limit = 10, page = 1 } = query
  const t = await getTranslations("db.suppliers")
  try {
    const suppliers = await directus.request(
      readItems("suppliers", {
        fields: SUPPLIERS_FIELDS,
        limit,
        page,
        sort: ["-date_created"],
        filter: { status: { _eq: status } },
      } satisfies Query<Schema, SuppliersTypes>)
    )
    return suppliers
  } catch (error) {
    logDirectusQueryError(error, t("failed_to_fetch"), {
      component: "db.queries",
      operation: "getSuppliersQuery",
      collection: "suppliers",
    })
    return []
  }
}

export async function getSuppliersCountQuery(
  query: Pick<SuppliersQuery, "status"> = {}
) {
  "use cache"
  cacheTag("suppliers_count")
  cacheLife("minutes")
  const { status = "published" } = query
  const t = await getTranslations("db.suppliers")
  try {
    const rows = await directus.request(
      aggregate("suppliers", {
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
      operation: "getSuppliersCountQuery",
      collection: "suppliers",
    })
    return 0
  }
}

export type SuppliersQueryResult = Awaited<ReturnType<typeof getSuppliersQuery>>
export type SuppliersCountQueryResult = Awaited<
  ReturnType<typeof getSuppliersCountQuery>
>
