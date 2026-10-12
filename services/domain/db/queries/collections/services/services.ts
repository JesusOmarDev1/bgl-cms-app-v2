import "server-only"
import type { Query } from "@directus/sdk"
import { aggregate, readItems } from "@directus/sdk"
import directus from "@/config/directus"
import { parseAggregateCount } from "@/lib/formatting/parse-aggregate-count"
import { returnDirectusQueryError } from "@/lib/directus/query-error"
import type { ServicesTypes } from "@/types/collections/services"
import type { StatusType } from "@/types/enums/status-type"
import type { Schema } from "@/types/schema"
import { SERVICES_FIELDS } from "./services.fields"
import { cacheLife, cacheTag } from "next/cache"
export interface ServicesQuery {
  status?: StatusType
  limit?: number
  page?: number
}

async function fetchServices(status: StatusType, limit: number, page: number) {
  "use cache"
  cacheTag("services")
  cacheLife("minutes")
  return directus.request(
    readItems("services", {
      fields: SERVICES_FIELDS,
      limit,
      page,
      sort: ["-date_created"],
      filter: { status: { _eq: status } },
    } satisfies Query<Schema, ServicesTypes>)
  )
}

export async function getServicesQuery(
  query: ServicesQuery,
  failedToFetchMessage: string
) {
  const { status = "published", limit = 10, page = 1 } = query
  try {
    return await fetchServices(status, limit, page)
  } catch (error) {
    returnDirectusQueryError(error, failedToFetchMessage, {
      component: "db.queries",
      operation: "getServicesQuery",
      collection: "services",
    })
    return []
  }
}

async function fetchServicesBySlug(
  status: StatusType,
  limit: number,
  page: number,
  slug: string
) {
  "use cache"
  cacheTag("services_by_slug")
  cacheLife("minutes")
  return directus.request(
    readItems("services", {
      fields: SERVICES_FIELDS,
      limit,
      page,
      sort: ["-date_created"],
      filter: { status: { _eq: status }, slug: { _eq: slug } },
    } satisfies Query<Schema, ServicesTypes>)
  )
}

export async function getServicesBySlugQuery(
  query: ServicesQuery,
  slug: string,
  failedToFetchMessage: string
) {
  const { status = "published", limit = 1, page = 1 } = query
  try {
    return await fetchServicesBySlug(status, limit, page, slug)
  } catch (error) {
    returnDirectusQueryError(error, failedToFetchMessage, {
      component: "db.queries",
      operation: "getServicesBySlugQuery",
      collection: "services",
    })
    return []
  }
}

async function fetchServicesCount(status: StatusType) {
  "use cache"
  cacheTag("services_count")
  cacheLife("minutes")
  const rows = await directus.request(
    aggregate("services", {
      aggregate: { count: "*" },
      query: {
        filter: { status: { _eq: status } },
      },
    })
  )
  return parseAggregateCount(rows[0]?.count)
}

export async function getServicesCountQuery(
  query: Pick<ServicesQuery, "status">,
  failedToFetchMessage: string
) {
  const { status = "published" } = query
  try {
    return await fetchServicesCount(status)
  } catch (error) {
    returnDirectusQueryError(error, failedToFetchMessage, {
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
