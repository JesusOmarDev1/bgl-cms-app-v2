import "server-only"

import { readItems, type Query } from "@directus/sdk"
import { createPrivateDirectus } from "@/config/directus-private"
import { PRIVATE_CLIENTS_FIELDS } from "@/services/domain/db/queries/collections/private-metrology/clients/clients.fields"
import type { ClientsTypes } from "@/types/collections/clients"
import type { Schema } from "@/types/schema"

const DEFAULT_LIMIT = 10
const MAX_LIMIT = 100

export interface PrivateClientsQuery {
  accessToken: string
  search?: string
  limit?: number
  page?: number
}

function validatePagination(limit: number, page: number): void {
  if (
    !Number.isSafeInteger(limit) ||
    limit < 1 ||
    limit > MAX_LIMIT ||
    !Number.isSafeInteger(page) ||
    page < 1 ||
    !Number.isSafeInteger((page - 1) * limit + limit)
  ) {
    throw new RangeError("Invalid pagination")
  }
}

export async function getPrivateClientsQuery({
  accessToken,
  search,
  limit = DEFAULT_LIMIT,
  page = 1,
}: PrivateClientsQuery) {
  validatePagination(limit, page)

  const directus = await createPrivateDirectus(accessToken)
  const normalizedSearch = search?.trim()
  const rows = await directus.request(
    readItems("clients", {
      fields: PRIVATE_CLIENTS_FIELDS,
      ...(normalizedSearch
        ? { filter: { name: { _icontains: normalizedSearch } } }
        : {}),
      limit: limit + 1,
      offset: (page - 1) * limit,
      sort: ["name", "id"],
    } satisfies Query<Schema, ClientsTypes>)
  )

  return {
    items: rows.slice(0, limit),
    hasNextPage: rows.length > limit,
  }
}

export type PrivateClientsQueryResult = Awaited<
  ReturnType<typeof getPrivateClientsQuery>
>
