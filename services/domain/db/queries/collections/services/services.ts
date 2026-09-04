import "server-only"
import type { Query } from "@directus/sdk"
import { aggregate, readItems } from "@directus/sdk"
import { getTranslations } from "next-intl/server"
import directus from "@/config/directus"
import { parseAggregateCount } from "@/lib/formatting/parse-aggregate-count"
import { logDirectusQueryError } from "@/lib/directus/query-error"
import type { ServicesTypes } from "@/types/collections/services"
import type { StatusType } from "@/types/enums/status-type"
import type { Schema } from "@/types/schema"
import { SERVICES_FIELDS } from "./services.fields"

export interface ServicesQuery {
  status?: StatusType
  limit?: number
  page?: number
}

export async function getServicesQuery(query: ServicesQuery) {
  const { status = "published", limit = 10, page = 1 } = query
  const t = await getTranslations("db.services")
  try {
    const services = await directus.request(
      readItems("services", {
        fields: SERVICES_FIELDS as unknown as Query<
          Schema,
          ServicesTypes
        >["fields"],
        limit,
        page,
        sort: ["-date_created"],
        filter: { status: { _eq: status } },
      } satisfies Query<Schema, ServicesTypes>)
    )
    return services
  } catch (error) {
    logDirectusQueryError(error, t("failed_to_fetch"), {
      component: "db.queries",
      operation: "getServicesQuery",
      collection: "services",
    })
    return []
  }
}

export async function getServicesBySlugQuery(
  query: ServicesQuery,
  slug: string
) {
  const { status = "published", limit = 1, page = 1 } = query
  const t = await getTranslations("db.services")
  try {
    const service = await directus.request(
      readItems("services", {
        fields: SERVICES_FIELDS as unknown as Query<
          Schema,
          ServicesTypes
        >["fields"],
        limit,
        page,
        sort: ["-date_created"],
        filter: { status: { _eq: status }, slug: { _eq: slug } },
      } satisfies Query<Schema, ServicesTypes>)
    )
    return service
  } catch (error) {
    logDirectusQueryError(error, t("failed_to_fetch"), {
      component: "db.queries",
      operation: "getServicesBySlugQuery",
      collection: "services",
    })
    return []
  }
}

export async function getServicesCountQuery(
  query: Pick<ServicesQuery, "status"> = {}
) {
  const { status = "published" } = query
  const t = await getTranslations("db.services")
  try {
    const rows = await directus.request(
      aggregate("services", {
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
      operation: "getServicesCountQuery",
      collection: "services",
    })
    return 0
  }
}

export type ServicesQueryResult = Awaited<ReturnType<typeof getServicesQuery>>
export type ServicesCountQueryResult = Awaited<
  ReturnType<typeof getServicesCountQuery>
>
