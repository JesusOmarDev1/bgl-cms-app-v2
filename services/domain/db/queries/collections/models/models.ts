import "server-only"

import type { Query } from "@directus/sdk"
import { aggregate, readItems } from "@directus/sdk"
import { getTranslations } from "next-intl/server"

import directus from "@/config/directus"
import { MODELS_FIELDS } from "@/services/domain/db/queries/collections/models/models.fields"
import type { ModelsTypes } from "@/types/collections/models"
import type { StatusType } from "@/types/enums/status-type"
import type { Schema } from "@/types/schema"

export interface ModelsQuery {
  status?: StatusType
  limit?: number
  page?: number
}

const MODELS_DEEP = {
  images: { _sort: ["sort"] },
} as unknown as Query<Schema, ModelsTypes>["deep"]

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
        deep: MODELS_DEEP,
      } satisfies Query<Schema, ModelsTypes>)
    )
    return models
  } catch (error) {
    console.error(error instanceof Error ? error.message : t("failed_to_fetch"))
    return []
  }
}

export async function getModelsCountQuery(
  query: Pick<ModelsQuery, "status"> = {}
) {
  const { status = "published" } = query
  const t = await getTranslations("db.models")
  try {
    const result = await directus.request(
      aggregate("models", {
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

export type ModelsQueryResult = Awaited<ReturnType<typeof getModelsQuery>>
export type ModelsCountQueryResult = Awaited<
  ReturnType<typeof getModelsCountQuery>
>
