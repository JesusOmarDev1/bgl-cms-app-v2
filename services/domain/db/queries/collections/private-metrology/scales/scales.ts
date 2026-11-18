import "server-only"

import { readItems, type Query } from "@directus/sdk"
import { createPrivateDirectus } from "@/config/directus-private"
import { PRIVATE_SCALES_FIELDS } from "@/services/domain/db/queries/collections/private-metrology/scales/scales.fields"
import type { ScalesTypes } from "@/types/collections/scales"
import type { Schema } from "@/types/schema"

const DEFAULT_LIMIT = 10
const MAX_LIMIT = 100

export interface PrivateScalesQuery {
  accessToken: string
  search?: string
  clientId?: string
  status?: string
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

export async function getPrivateScalesQuery({
  accessToken,
  search,
  clientId,
  status,
  limit = DEFAULT_LIMIT,
  page = 1,
}: PrivateScalesQuery) {
  validatePagination(limit, page)

  const directus = await createPrivateDirectus(accessToken)
  const filters: NonNullable<Query<Schema, ScalesTypes>["filter"]>[] = []
  const normalizedSearch = search?.trim()
  if (normalizedSearch) {
    filters.push({
      _or: [
        { serial_number: { _icontains: normalizedSearch } },
        { identification: { _icontains: normalizedSearch } },
      ],
    })
  }
  if (status) filters.push({ status: { _eq: status } })
  if (clientId) filters.push({ client: { _eq: clientId } })

  const rows = await directus.request(
    readItems("scales", {
      fields: PRIVATE_SCALES_FIELDS,
      ...(filters.length === 1
        ? { filter: filters[0] }
        : filters.length > 1
          ? { filter: { _and: filters } }
          : {}),
      limit: limit + 1,
      offset: (page - 1) * limit,
      sort: ["title", "id"],
    } satisfies Query<Schema, ScalesTypes>)
  )

  return {
    items: rows.slice(0, limit),
    hasNextPage: rows.length > limit,
  }
}

export type PrivateScalesQueryResult = Awaited<
  ReturnType<typeof getPrivateScalesQuery>
>
