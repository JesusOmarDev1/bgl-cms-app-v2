import "server-only"
import type { Query } from "@directus/sdk"
import { aggregate, readItems } from "@directus/sdk"
import { getTranslations } from "next-intl/server"
import directus from "@/config/directus"
import { parseAggregateCount } from "@/lib/formatting/parse-aggregate-count"
import { logDirectusQueryError } from "@/lib/directus/query-error"
import { BLOG_CATEGORIES_FIELDS } from "@/services/domain/db/queries/collections/blog-categories/blog-categories.fields"
import type { BlogCategoriesTypes } from "@/types/collections/blog-categories"
import type { StatusType } from "@/types/enums/status-type"
import type { Schema } from "@/types/schema"

export interface BlogCategoriesQuery {
  status?: StatusType
  limit?: number
  page?: number
}

export async function getBlogCategoriesQuery(query: BlogCategoriesQuery = {}) {
  const { status = "published", limit = 10, page = 1 } = query
  const t = await getTranslations("db.blog_categories")
  try {
    const items = await directus.request(
      readItems("blog_categories", {
        fields: BLOG_CATEGORIES_FIELDS,
        limit,
        page,
        sort: ["-date_created"],
        filter: { status: { _eq: status } },
      } satisfies Query<Schema, BlogCategoriesTypes>)
    )
    return items
  } catch (error) {
    logDirectusQueryError(error, t("failed_to_fetch"), {
      component: "db.queries",
      operation: "getBlogCategoriesQuery",
      collection: "blog_categories",
    })
    return []
  }
}

export async function getBlogCategoriesCountQuery(
  query: Pick<BlogCategoriesQuery, "status"> = {}
) {
  const { status = "published" } = query
  const t = await getTranslations("db.blog_categories")
  try {
    const rows = await directus.request(
      aggregate("blog_categories", {
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
      operation: "getBlogCategoriesCountQuery",
      collection: "blog_categories",
    })
    return 0
  }
}

export type BlogCategoriesQueryResult = Awaited<
  ReturnType<typeof getBlogCategoriesQuery>
>
