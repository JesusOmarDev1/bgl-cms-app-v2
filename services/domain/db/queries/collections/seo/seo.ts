import "server-only"
import type { Query } from "@directus/sdk"
import { aggregate, readItems } from "@directus/sdk"
import { getTranslations } from "next-intl/server"
import directus from "@/config/directus"
import { parseAggregateCount } from "@/lib/formatting/parse-aggregate-count"
import { logDirectusQueryError } from "@/lib/directus/query-error"
import { SEO_FIELDS } from "@/services/domain/db/queries/collections/seo/seo.fields"
import type { SeoTypes } from "@/types/collections/seo"
import type { Schema } from "@/types/schema"

export interface SeoQuery {
  limit?: number
  page?: number
}

export async function getSeoQuery(query: SeoQuery = {}) {
  const { limit = 10, page = 1 } = query
  const t = await getTranslations("db.seo")
  try {
    const items = await directus.request(
      readItems("seo", {
        fields: SEO_FIELDS,
        limit,
        page,
        sort: ["-date_created"],
      } satisfies Query<Schema, SeoTypes>)
    )
    return items
  } catch (error) {
    logDirectusQueryError(error, t("failed_to_fetch"), {
      component: "db.queries",
      operation: "getSeoQuery",
      collection: "seo",
    })
    return []
  }
}

export async function getSeoCountQuery() {
  const t = await getTranslations("db.seo")
  try {
    const rows = await directus.request(
      aggregate("seo", {
        aggregate: { count: "*" },
      })
    )
    return parseAggregateCount(rows[0]?.count)
  } catch (error) {
    logDirectusQueryError(error, t("failed_to_fetch"), {
      component: "db.queries",
      operation: "getSeoCountQuery",
      collection: "seo",
    })
    return 0
  }
}

export type SeoQueryResult = Awaited<ReturnType<typeof getSeoQuery>>
