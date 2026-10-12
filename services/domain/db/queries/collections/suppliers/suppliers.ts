import "server-only"

import type { Query } from "@directus/sdk"
import { aggregate, readItems } from "@directus/sdk"

import directus from "@/config/directus"
import { parseAggregateCount } from "@/lib/formatting/parse-aggregate-count"
import { returnDirectusQueryError } from "@/lib/directus/query-error"
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

async function fetchSuppliers(status: StatusType, limit: number, page: number) {
  "use cache"
  cacheTag("suppliers")
  cacheLife("minutes")
  return directus.request(
    readItems("suppliers", {
      fields: SUPPLIERS_FIELDS,
      limit,
      page,
      sort: ["-date_created"],
      filter: { status: { _eq: status } },
    } satisfies Query<Schema, SuppliersTypes>)
  )
}

export async function getSuppliersQuery(
  query: SuppliersQuery,
  failedToFetchMessage: string
) {
  const { status = "published", limit = 10, page = 1 } = query
  try {
    return await fetchSuppliers(status, limit, page)
  } catch (error) {
    returnDirectusQueryError(error, failedToFetchMessage, {
      component: "db.queries",
      operation: "getSuppliersQuery",
      collection: "suppliers",
    })
    return []
  }
}

async function fetchSuppliersCount(status: StatusType) {
  "use cache"
  cacheTag("suppliers_count")
  cacheLife("minutes")
  const rows = await directus.request(
    aggregate("suppliers", {
      aggregate: { count: "*" },
      query: {
        filter: { status: { _eq: status } },
      },
    })
  )
  return parseAggregateCount(rows[0]?.count)
}

export async function getSuppliersCountQuery(
  query: Pick<SuppliersQuery, "status">,
  failedToFetchMessage: string
) {
  const { status = "published" } = query
  try {
    return await fetchSuppliersCount(status)
  } catch (error) {
    returnDirectusQueryError(error, failedToFetchMessage, {
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
