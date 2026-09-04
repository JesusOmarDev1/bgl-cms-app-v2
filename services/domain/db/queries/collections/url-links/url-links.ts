import "server-only"
import type { Query } from "@directus/sdk"
import { aggregate, readItems } from "@directus/sdk"
import { getTranslations } from "next-intl/server"
import directus from "@/config/directus"
import { parseAggregateCount } from "@/lib/formatting/parse-aggregate-count"
import { logDirectusQueryError } from "@/lib/directus/query-error"
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
    logDirectusQueryError(error, t("failed_to_fetch"), {
      component: "db.queries",
      operation: "getUrlLinksQuery",
      collection: "url_links",
    })
    return []
  }
}

export async function getUrlLinksCountQuery() {
  const t = await getTranslations("db.url_links")
  try {
    const rows = await directus.request(
      aggregate("url_links", {
        aggregate: { count: "*" },
      })
    )
    return parseAggregateCount(rows[0]?.count)
  } catch (error) {
    logDirectusQueryError(error, t("failed_to_fetch"), {
      component: "db.queries",
      operation: "getUrlLinksCountQuery",
      collection: "url_links",
    })
    return 0
  }
}

export type UrlLinksQueryResult = Awaited<ReturnType<typeof getUrlLinksQuery>>
