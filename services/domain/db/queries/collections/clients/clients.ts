import "server-only"

import type { Query } from "@directus/sdk"
import { aggregate, readItems } from "@directus/sdk"
import { getTranslations } from "next-intl/server"

import directus from "@/config/directus"
import { CLIENTS_FIELDS } from "@/services/domain/db/queries/collections/clients/clients.fields"
import type { ClientsTypes } from "@/types/collections/clients"
import type { StatusType } from "@/types/enums/status-type"
import type { Schema } from "@/types/schema"

export interface ClientsQuery {
  status?: StatusType
  limit?: number
  page?: number
}

export async function getClientsQuery(query: ClientsQuery) {
  const { status = "published", limit = 10, page = 1 } = query
  const t = await getTranslations("db.clients")
  try {
    const clients = await directus.request(
      readItems("clients", {
        fields: CLIENTS_FIELDS as unknown as Query<
          Schema,
          ClientsTypes
        >["fields"],
        limit,
        page,
        sort: ["-date_created"],
        filter: { status: { _eq: status } },
      } satisfies Query<Schema, ClientsTypes>)
    )
    return clients
  } catch (error) {
    console.error(error instanceof Error ? error.message : t("failed_to_fetch"))
    return []
  }
}

export async function getClientsCountQuery(
  query: Pick<ClientsQuery, "status"> = {}
) {
  const { status = "published" } = query
  const t = await getTranslations("db.clients")
  try {
    const result = await directus.request(
      aggregate("clients", {
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

export type ClientsQueryResult = Awaited<ReturnType<typeof getClientsQuery>>
export type ClientsCountQueryResult = Awaited<
  ReturnType<typeof getClientsCountQuery>
>
