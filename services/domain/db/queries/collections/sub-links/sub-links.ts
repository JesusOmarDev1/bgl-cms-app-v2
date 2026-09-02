import "server-only"
import type { Query } from "@directus/sdk"
import { aggregate, readItems } from "@directus/sdk"
import { getTranslations } from "next-intl/server"
import directus from "@/config/directus"
import { SUB_LINKS_FIELDS } from "@/services/domain/db/queries/collections/sub-links/sub-links.fields"
import type { SubLinksTypes } from "@/types/collections/sub-links"
import type { Schema } from "@/types/schema"

export interface SubLinksQuery {
  limit?: number
  page?: number
}

export async function getSubLinksQuery(query: SubLinksQuery = {}) {
  const { limit = 10, page = 1 } = query
  const t = await getTranslations("db.sub_links")
  try {
    const items = await directus.request(
      readItems("sub_links", {
        fields: SUB_LINKS_FIELDS,
        limit,
        page,
        sort: ["-date_created"],
      } satisfies Query<Schema, SubLinksTypes>)
    )
    return items
  } catch (error) {
    console.error(error instanceof Error ? error.message : t("failed_to_fetch"))
    return []
  }
}

export async function getSubLinksCountQuery() {
  const t = await getTranslations("db.sub_links")
  try {
    const result = await directus.request(
      aggregate("sub_links", {
        aggregate: { count: "*" },
      })
    )
    const count = Number(result[0]?.count ?? 0)
    return Number.isFinite(count) ? count : 0
  } catch (error) {
    console.error(error instanceof Error ? error.message : t("failed_to_fetch"))
    return 0
  }
}

export type SubLinksQueryResult = Awaited<ReturnType<typeof getSubLinksQuery>>
