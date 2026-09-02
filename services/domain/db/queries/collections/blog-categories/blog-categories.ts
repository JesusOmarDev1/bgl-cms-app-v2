import "server-only"
import type { Query } from "@directus/sdk"
import { aggregate, readItems } from "@directus/sdk"
import { getTranslations } from "next-intl/server"
import directus from "@/config/directus"
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
    console.error(error instanceof Error ? error.message : t("failed_to_fetch"))
    return []
  }
}

export async function getBlogCategoriesCountQuery(
  query: BlogCategoriesQuery = {}
) {
  const { status = "published" } = query
  const t = await getTranslations("db.blog_categories")
  try {
    const result = await directus.request(
      aggregate("blog_categories", {
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

export type BlogCategoriesQueryResult = Awaited<
  ReturnType<typeof getBlogCategoriesQuery>
>
