import "server-only"

import type { Query } from "@directus/sdk"
import { aggregate, readItems } from "@directus/sdk"

import directus from "@/config/directus"
import { parseAggregateCount } from "@/lib/formatting/parse-aggregate-count"
import { returnDirectusQueryError } from "@/lib/directus/query-error"
import { MODELS_FIELDS } from "@/services/domain/db/queries/collections/models/models.fields"
import type { ModelsTypes } from "@/types/collections/models"
import type { StatusType } from "@/types/enums/status-type"
import type { Schema } from "@/types/schema"
import { cacheLife, cacheTag } from "next/cache"

export interface ModelsQuery {
  status?: StatusType
  limit?: number
  page?: number
}

export async function getModelsQuery(
  query: ModelsQuery,
  failedToFetchMessage: string
) {
  "use cache"
  cacheTag("models")
  cacheLife("minutes")
  const { status = "published", limit = 10, page = 1 } = query
  try {
    const models = await directus.request(
      readItems("models", {
        fields: MODELS_FIELDS,
        limit,
        page,
        sort: ["-date_created"],
        filter: { status: { _eq: status } },
      } satisfies Query<Schema, ModelsTypes>)
    )
    return models
  } catch (error) {
    returnDirectusQueryError(error, failedToFetchMessage, {
      component: "db.queries",
      operation: "getModelsQuery",
      collection: "models",
    })
    return []
  }
}

export async function getModelsCountQuery(
  query: Pick<ModelsQuery, "status">,
  failedToFetchMessage: string
) {
  "use cache"
  cacheTag("models_count")
  cacheLife("minutes")
  const { status = "published" } = query
  try {
    const rows = await directus.request(
      aggregate("models", {
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
      operation: "getModelsCountQuery",
      collection: "models",
    })
    return 0
  }
}

export type ModelsQueryResult = Awaited<ReturnType<typeof getModelsQuery>>
export type ModelsCountQueryResult = Awaited<
  ReturnType<typeof getModelsCountQuery>
>
