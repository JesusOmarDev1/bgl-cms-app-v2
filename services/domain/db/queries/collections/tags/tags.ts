import "server-only"
import type { Query } from "@directus/sdk"
import { aggregate, readItems } from "@directus/sdk"
import { getTranslations } from "next-intl/server"
import directus from "@/config/directus"
import { parseAggregateCount } from "@/lib/formatting/parse-aggregate-count"
import { logDirectusQueryError } from "@/lib/directus/query-error"
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
    logDirectusQueryError(error, t("failed_to_fetch"), {
      component: "db.queries",
      operation: "getTagsQuery",
      collection: "tags",
    })
    return []
  }
}

export async function getTagsCountQuery(query: Pick<TagsQuery, "status"> = {}) {
  const { status = "published" } = query
  const t = await getTranslations("db.tags")
  try {
    const rows = await directus.request(
      aggregate("tags", {
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
      operation: "getTagsCountQuery",
      collection: "tags",
    })
    return 0
  }
}

export type TagsQueryResult = Awaited<ReturnType<typeof getTagsQuery>>
