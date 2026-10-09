import "server-only"

import type { Query } from "@directus/sdk"
import { aggregate, readItems } from "@directus/sdk"

import directus from "@/config/directus"
import { parseAggregateCount } from "@/lib/formatting/parse-aggregate-count"
import { returnDirectusQueryError } from "@/lib/directus/query-error"
import { DIVISION_SERVICES_FIELDS } from "@/services/domain/db/queries/collections/division-services/division-services.fields"
import type { DivisionServicesTypes } from "@/types/collections/division-services"
import type { StatusType } from "@/types/enums/status-type"
import type { Schema } from "@/types/schema"
import { cacheLife, cacheTag } from "next/cache"

export interface DivisionServicesQuery {
  status?: StatusType
  limit?: number
  page?: number
}

export async function getDivisionServicesQuery(
  query: DivisionServicesQuery,
  failedToFetchMessage: string
) {
  "use cache"
  cacheTag("division_services")
  cacheLife("minutes")
  const { status = "published", limit = 10, page = 1 } = query
  try {
    const divisionServices = await directus.request(
      readItems("division_services", {
        fields: DIVISION_SERVICES_FIELDS,
        limit,
        page,
        sort: ["-date_created"],
        filter: { status: { _eq: status } },
      } satisfies Query<Schema, DivisionServicesTypes>)
    )
    return divisionServices
  } catch (error) {
    returnDirectusQueryError(error, failedToFetchMessage, {
      component: "db.queries",
      operation: "getDivisionServicesQuery",
      collection: "division_services",
    })
    return []
  }
}

export async function getDivisionServicesCountQuery(
  query: Pick<DivisionServicesQuery, "status">,
  failedToFetchMessage: string
) {
  "use cache"
  cacheTag("division_services_count")
  cacheLife("minutes")
  const { status = "published" } = query
  try {
    const rows = await directus.request(
      aggregate("division_services", {
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
      operation: "getDivisionServicesCountQuery",
      collection: "division_services",
    })
    return 0
  }
}

export type DivisionServicesQueryResult = Awaited<
  ReturnType<typeof getDivisionServicesQuery>
>
export type DivisionServicesCountQueryResult = Awaited<
  ReturnType<typeof getDivisionServicesCountQuery>
>
