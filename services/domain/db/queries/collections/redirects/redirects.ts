import "server-only"
import type { Query } from "@directus/sdk"
import { aggregate, readItems } from "@directus/sdk"
import { getTranslations } from "next-intl/server"
import directus from "@/config/directus"
import { parseAggregateCount } from "@/lib/formatting/parse-aggregate-count"
import { logDirectusQueryError } from "@/lib/directus/query-error"
import { REDIRECTS_FIELDS } from "@/services/domain/db/queries/collections/redirects/redirects.fields"
import type { RedirectsTypes } from "@/types/collections/redirects"
import type { Schema } from "@/types/schema"
import { cacheLife, cacheTag } from "next/cache"

export interface RedirectsQuery {
  limit?: number
  page?: number
}

export async function getRedirectsQuery(query: RedirectsQuery = {}) {
  "use cache"
  cacheTag("redirects")
  cacheLife("minutes")
  const { limit = 10, page = 1 } = query
  const t = await getTranslations("db.redirects")
  try {
    const items = await directus.request(
      readItems("redirects", {
        fields: REDIRECTS_FIELDS,
        limit,
        page,
        sort: ["-date_created"],
      } satisfies Query<Schema, RedirectsTypes>)
    )
    return items
  } catch (error) {
    logDirectusQueryError(error, t("failed_to_fetch"), {
      component: "db.queries",
      operation: "getRedirectsQuery",
      collection: "redirects",
    })
    return []
  }
}

export async function getRedirectsCountQuery() {
  "use cache"
  cacheTag("redirects_count")
  cacheLife("minutes")
  const t = await getTranslations("db.redirects")
  try {
    const rows = await directus.request(
      aggregate("redirects", {
        aggregate: { count: "*" },
      })
    )
    return parseAggregateCount(rows[0]?.count)
  } catch (error) {
    logDirectusQueryError(error, t("failed_to_fetch"), {
      component: "db.queries",
      operation: "getRedirectsCountQuery",
      collection: "redirects",
    })
    return 0
  }
}

export type RedirectsQueryResult = Awaited<ReturnType<typeof getRedirectsQuery>>
