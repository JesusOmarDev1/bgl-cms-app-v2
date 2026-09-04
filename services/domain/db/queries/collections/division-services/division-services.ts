import "server-only"

import type { Query } from "@directus/sdk"
import { aggregate, readItems } from "@directus/sdk"
import { getTranslations } from "next-intl/server"

import directus from "@/config/directus"
import { parseAggregateCount } from "@/lib/formatting/parse-aggregate-count"
import { logDirectusQueryError } from "@/lib/directus/query-error"
import { DIVISION_SERVICES_FIELDS } from "@/services/domain/db/queries/collections/division-services/division-services.fields"
import type { DivisionServicesTypes } from "@/types/collections/division-services"
import type { StatusType } from "@/types/enums/status-type"
import type { Schema } from "@/types/schema"

export interface DivisionServicesQuery {
  status?: StatusType
  limit?: number
  page?: number
}

export async function getDivisionServicesQuery(query: DivisionServicesQuery) {
  const { status = "published", limit = 10, page = 1 } = query
  const t = await getTranslations("db.division_services")
  try {
    const divisionServices = await directus.request(
      readItems("division_services", {
        fields: DIVISION_SERVICES_FIELDS as unknown as Query<
          Schema,
          DivisionServicesTypes
        >["fields"],
        limit,
        page,
        sort: ["-date_created"],
        filter: { status: { _eq: status } },
      } satisfies Query<Schema, DivisionServicesTypes>)
    )
    return divisionServices
  } catch (error) {
    logDirectusQueryError(error, t("failed_to_fetch"), {
      component: "db.queries",
      operation: "getDivisionServicesQuery",
      collection: "division_services",
    })
    return []
  }
}

export async function getDivisionServicesCountQuery(
  query: Pick<DivisionServicesQuery, "status"> = {}
) {
  const { status = "published" } = query
  const t = await getTranslations("db.division_services")
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
    logDirectusQueryError(error, t("failed_to_fetch"), {
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
