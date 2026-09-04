import "server-only"

import type { Query } from "@directus/sdk"
import { aggregate, readItems } from "@directus/sdk"
import { getTranslations } from "next-intl/server"

import directus from "@/config/directus"
import { parseAggregateCount } from "@/lib/formatting/parse-aggregate-count"
import { logDirectusQueryError } from "@/lib/directus/query-error"
import { MODELS_FIELDS } from "@/services/domain/db/queries/collections/models/models.fields"
import type { ModelsTypes } from "@/types/collections/models"
import type { StatusType } from "@/types/enums/status-type"
import type { Schema } from "@/types/schema"

export interface ModelsQuery {
  status?: StatusType
  limit?: number
  page?: number
}

export async function getModelsQuery(query: ModelsQuery) {
  const { status = "published", limit = 10, page = 1 } = query
  const t = await getTranslations("db.models")
  try {
    const models = await directus.request(
      readItems("models", {
        fields: MODELS_FIELDS as unknown as Query<
          Schema,
          ModelsTypes
        >["fields"],
        limit,
        page,
        sort: ["-date_created"],
        filter: { status: { _eq: status } },
      } satisfies Query<Schema, ModelsTypes>)
    )
    return models
  } catch (error) {
    logDirectusQueryError(error, t("failed_to_fetch"), {
      component: "db.queries",
      operation: "getModelsQuery",
      collection: "models",
    })
    return []
  }
}

export async function getModelsCountQuery(
  query: Pick<ModelsQuery, "status"> = {}
) {
  const { status = "published" } = query
  const t = await getTranslations("db.models")
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
    logDirectusQueryError(error, t("failed_to_fetch"), {
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
