import "server-only"
import type { Query } from "@directus/sdk"
import { aggregate, readItems } from "@directus/sdk"
import { getTranslations } from "next-intl/server"
import directus from "@/config/directus"
import { URL_LINKS_FIELDS } from "@/services/domain/db/queries/collections/url-links/url-links.fields"
import type { UrlLinksTypes } from "@/types/collections/url-links"
import type { Schema } from "@/types/schema"

export interface UrlLinksQuery {
  limit?: number
  page?: number
}

export async function getUrlLinksQuery(query: UrlLinksQuery = {}) {
  const { limit = 10, page = 1 } = query
  const t = await getTranslations("db.url_links")
  try {
    const items = await directus.request(
      readItems("url_links", {
        fields: URL_LINKS_FIELDS,
        limit,
        page,
        sort: ["-date_created"],
      } satisfies Query<Schema, UrlLinksTypes>)
    )
    return items
  } catch (error) {
    console.error(error instanceof Error ? error.message : t("failed_to_fetch"))
    return []
  }
}

export async function getUrlLinksCountQuery() {
  const t = await getTranslations("db.url_links")
  try {
    const result = await directus.request(
      aggregate("url_links", {
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

export type UrlLinksQueryResult = Awaited<ReturnType<typeof getUrlLinksQuery>>
