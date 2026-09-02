import "server-only"

import type { Query } from "@directus/sdk"
import { aggregate, readItems } from "@directus/sdk"
import { getTranslations } from "next-intl/server"

import directus from "@/config/directus"
import { SUPPLIERS_FIELDS } from "@/services/domain/db/queries/collections/suppliers/suppliers.fields"
import type { SuppliersTypes } from "@/types/collections/suppliers"
import type { StatusType } from "@/types/enums/status-type"
import type { Schema } from "@/types/schema"

export interface SuppliersQuery {
  status?: StatusType
  limit?: number
  page?: number
}

export async function getSuppliersQuery(query: SuppliersQuery) {
  const { status = "published", limit = 10, page = 1 } = query
  const t = await getTranslations("db.suppliers")
  try {
    const suppliers = await directus.request(
      readItems("suppliers", {
        fields: SUPPLIERS_FIELDS as unknown as Query<
          Schema,
          SuppliersTypes
        >["fields"],
        limit,
        page,
        sort: ["-date_created"],
        filter: { status: { _eq: status } },
      } satisfies Query<Schema, SuppliersTypes>)
    )
    return suppliers
  } catch (error) {
    console.error(error instanceof Error ? error.message : t("failed_to_fetch"))
    return []
  }
}

export async function getSuppliersCountQuery(
  query: Pick<SuppliersQuery, "status"> = {}
) {
  const { status = "published" } = query
  const t = await getTranslations("db.suppliers")
  try {
    const result = await directus.request(
      aggregate("suppliers", {
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

export type SuppliersQueryResult = Awaited<ReturnType<typeof getSuppliersQuery>>
export type SuppliersCountQueryResult = Awaited<
  ReturnType<typeof getSuppliersCountQuery>
>
