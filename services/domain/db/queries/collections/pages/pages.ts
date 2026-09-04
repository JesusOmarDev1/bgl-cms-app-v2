import "server-only"
import type { Query } from "@directus/sdk"
import { aggregate, readItems } from "@directus/sdk"
import { getTranslations } from "next-intl/server"
import directus from "@/config/directus"
import { parseAggregateCount } from "@/lib/formatting/parse-aggregate-count"
import { logDirectusQueryError } from "@/lib/directus/query-error"
import type { PagesTypes } from "@/types/collections/pages"
import type { StatusType } from "@/types/enums/status-type"
import type { Schema } from "@/types/schema"
import { PAGES_FIELDS } from "./pages.fields"

export interface PagesQuery {
  status?: StatusType
  limit?: number
  page?: number
}

export async function getPagesQuery(query: PagesQuery) {
  const { status = "published", limit = 10, page = 1 } = query
  const t = await getTranslations("db.pages")
  try {
    const pages = await directus.request(
      readItems("pages", {
        fields: PAGES_FIELDS as unknown as Query<Schema, PagesTypes>["fields"],
        limit,
        page,
        sort: ["-date_created"],
        filter: { status: { _eq: status } },
      } satisfies Query<Schema, PagesTypes>)
    )
    return pages
  } catch (error) {
    logDirectusQueryError(error, t("failed_to_fetch"), {
      component: "db.queries",
      operation: "getPagesQuery",
      collection: "pages",
    })
    return []
  }
}

export async function getPagesBySlugQuery(query: PagesQuery, slug: string) {
  const { status = "published", limit = 1, page = 1 } = query
  const t = await getTranslations("db.pages")
  try {
    const pageItem = await directus.request(
      readItems("pages", {
        fields: PAGES_FIELDS as unknown as Query<Schema, PagesTypes>["fields"],
        limit,
        page,
        sort: ["-date_created"],
        filter: { status: { _eq: status }, slug: { _eq: slug } },
      } satisfies Query<Schema, PagesTypes>)
    )
    return pageItem
  } catch (error) {
    logDirectusQueryError(error, t("failed_to_fetch"), {
      component: "db.queries",
      operation: "getPagesBySlugQuery",
      collection: "pages",
    })
    return []
  }
}

export async function getPagesCountQuery(
  query: Pick<PagesQuery, "status"> = {}
) {
  const { status = "published" } = query
  const t = await getTranslations("db.pages")
  try {
    const rows = await directus.request(
      aggregate("pages", {
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
      operation: "getPagesCountQuery",
      collection: "pages",
    })
    return 0
  }
}

export type PagesQueryResult = Awaited<ReturnType<typeof getPagesQuery>>
export type PagesCountQueryResult = Awaited<
  ReturnType<typeof getPagesCountQuery>
>
