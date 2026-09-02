import "server-only"
import type { Query } from "@directus/sdk"
import { aggregate, readItems } from "@directus/sdk"
import { getTranslations } from "next-intl/server"
import directus from "@/config/directus"
import { TAGS_FIELDS } from "@/services/domain/db/queries/collections/tags/tags.fields"
import type { TagTypes } from "@/types/collections/tags"
import type { StatusType } from "@/types/enums/status-type"
import type { Schema } from "@/types/schema"

export interface TagsQuery {
  status?: StatusType
  limit?: number
  page?: number
}

export async function getTagsQuery(query: TagsQuery = {}) {
  const { status = "published", limit = 10, page = 1 } = query
  const t = await getTranslations("db.tags")
  try {
    const items = await directus.request(
      readItems("tags", {
        fields: TAGS_FIELDS,
        limit,
        page,
        sort: ["-date_created"],
        filter: { status: { _eq: status } },
      } satisfies Query<Schema, TagTypes>)
    )
    return items
  } catch (error) {
    console.error(error instanceof Error ? error.message : t("failed_to_fetch"))
    return []
  }
}

export async function getTagsCountQuery(query: TagsQuery = {}) {
  const { status = "published" } = query
  const t = await getTranslations("db.tags")
  try {
    const result = await directus.request(
      aggregate("tags", {
        aggregate: { count: "*" },
        query: {
          filter: { status: { _eq: status } },
        },
      })
    )
    const count = Number(result[0]?.count ?? 0)
    return Number.isFinite(count) ? count : 0
  } catch (error) {
    console.error(error instanceof Error ? error.message : t("failed_to_fetch"))
    return 0
  }
}

export type TagsQueryResult = Awaited<ReturnType<typeof getTagsQuery>>
