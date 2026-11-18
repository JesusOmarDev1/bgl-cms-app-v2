import "server-only"

import { readItems, type Query } from "@directus/sdk"
import { createPrivateDirectus } from "@/config/directus-private"
import { PRIVATE_MODELS_FIELDS } from "@/services/domain/db/queries/collections/private-metrology/models/models.fields"
import type { ModelsTypes } from "@/types/collections/models"
import type { Schema } from "@/types/schema"

const DEFAULT_LIMIT = 10
const MAX_LIMIT = 100

export interface PrivateModelsQuery {
  accessToken: string
  search?: string
  limit?: number
  page?: number
}

function validatePagination(limit: number, page: number): void {
  if (
    !Number.isSafeInteger(limit) || limit < 1 || limit > MAX_LIMIT ||
    !Number.isSafeInteger(page) || page < 1 ||
    page > Math.floor(Number.MAX_SAFE_INTEGER / limit)
  ) {
    throw new RangeError("Invalid pagination")
  }
}

export async function getPrivateModelsQuery({
  accessToken,
  search,
  limit = DEFAULT_LIMIT,
  page = 1,
}: PrivateModelsQuery) {
  validatePagination(limit, page)
  const directus = await createPrivateDirectus(accessToken)
  const normalizedSearch = search?.trim()
  const rows = await directus.request(
    readItems("models", {
      fields: PRIVATE_MODELS_FIELDS,
      ...(normalizedSearch ? { filter: { title: { _icontains: normalizedSearch } } } : {}),
      limit: limit + 1,
      offset: (page - 1) * limit,
      sort: ["title", "id"],
    } satisfies Query<Schema, ModelsTypes>)
  )
  return { items: rows.slice(0, limit), hasNextPage: rows.length > limit }
}

export type PrivateModelsQueryResult = Awaited<ReturnType<typeof getPrivateModelsQuery>>
