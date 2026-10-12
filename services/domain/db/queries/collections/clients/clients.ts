import "server-only"

import type { Query } from "@directus/sdk"
import { aggregate, readItems } from "@directus/sdk"

import directus from "@/config/directus"
import { parseAggregateCount } from "@/lib/formatting/parse-aggregate-count"
import { returnDirectusQueryError } from "@/lib/directus/query-error"
import { CLIENTS_FIELDS } from "@/services/domain/db/queries/collections/clients/clients.fields"
import type { ClientsTypes } from "@/types/collections/clients"
import type { StatusType } from "@/types/enums/status-type"
import type { Schema } from "@/types/schema"
import { cacheLife, cacheTag } from "next/cache"

export interface ClientsQuery {
  status?: StatusType
  limit?: number
  page?: number
}

async function fetchClients(status: StatusType, limit: number, page: number) {
  "use cache"
  cacheTag("clients")
  cacheLife("minutes")
  return directus.request(
    readItems("clients", {
      fields: CLIENTS_FIELDS,
      limit,
      page,
      sort: ["-date_created"],
      filter: { status: { _eq: status } },
    } satisfies Query<Schema, ClientsTypes>)
  )
}

export async function getClientsQuery(
  query: ClientsQuery,
  failedToFetchMessage: string
) {
  const { status = "published", limit = 10, page = 1 } = query
  try {
    return await fetchClients(status, limit, page)
  } catch (error) {
    returnDirectusQueryError(error, failedToFetchMessage, {
      component: "db.queries",
      operation: "getClientsQuery",
      collection: "clients",
    })
    return []
  }
}

async function fetchClientsCount(status: StatusType) {
  "use cache"
  cacheTag("clients_count")
  cacheLife("minutes")
  const rows = await directus.request(
    aggregate("clients", {
      aggregate: { count: "*" },
      query: {
        filter: { status: { _eq: status } },
      },
    })
  )
  return parseAggregateCount(rows[0]?.count)
}

export async function getClientsCountQuery(
  query: Pick<ClientsQuery, "status">,
  failedToFetchMessage: string
) {
  const { status = "published" } = query
  try {
    return await fetchClientsCount(status)
  } catch (error) {
    returnDirectusQueryError(error, failedToFetchMessage, {
      component: "db.queries",
      operation: "getClientsCountQuery",
      collection: "clients",
    })
    return 0
  }
}

export type ClientsQueryResult = Awaited<ReturnType<typeof getClientsQuery>>
export type ClientsCountQueryResult = Awaited<
  ReturnType<typeof getClientsCountQuery>
>
