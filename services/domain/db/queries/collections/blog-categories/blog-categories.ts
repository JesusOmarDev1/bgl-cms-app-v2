import "server-only"
import type { Query } from "@directus/sdk"
import { aggregate, readItems } from "@directus/sdk"
import directus from "@/config/directus"
import { parseAggregateCount } from "@/lib/formatting/parse-aggregate-count"
import { returnDirectusQueryError } from "@/lib/directus/query-error"
import { BLOG_CATEGORIES_FIELDS } from "@/services/domain/db/queries/collections/blog-categories/blog-categories.fields"
import type { BlogCategoriesTypes } from "@/types/collections/blog-categories"
import type { StatusType } from "@/types/enums/status-type"
import type { Schema } from "@/types/schema"
import { cacheLife, cacheTag } from "next/cache"

export interface BlogCategoriesQuery {
  status?: StatusType
  limit?: number
  page?: number
}

async function fetchBlogCategories(
  status: StatusType,
  limit: number,
  page: number
) {
  "use cache"
  cacheTag("blog_categories")
  cacheLife("minutes")
  return directus.request(
    readItems("blog_categories", {
      fields: BLOG_CATEGORIES_FIELDS,
      limit,
      page,
      sort: ["-date_created"],
      filter: { status: { _eq: status } },
    } satisfies Query<Schema, BlogCategoriesTypes>)
  )
}

export async function getBlogCategoriesQuery(
  query: BlogCategoriesQuery,
  failedToFetchMessage: string
) {
  const { status = "published", limit = 10, page = 1 } = query
  try {
    return await fetchBlogCategories(status, limit, page)
  } catch (error) {
    returnDirectusQueryError(error, failedToFetchMessage, {
      component: "db.queries",
      operation: "getBlogCategoriesQuery",
      collection: "blog_categories",
    })
    return []
  }
}

async function fetchBlogCategoriesCount(status: StatusType) {
  "use cache"
  cacheTag("blog_categories_count")
  cacheLife("minutes")
  const rows = await directus.request(
    aggregate("blog_categories", {
      aggregate: { count: "*" },
      query: {
        filter: { status: { _eq: status } },
      },
    })
  )
  return parseAggregateCount(rows[0]?.count)
}

export async function getBlogCategoriesCountQuery(
  query: Pick<BlogCategoriesQuery, "status">,
  failedToFetchMessage: string
) {
  const { status = "published" } = query
  try {
    return await fetchBlogCategoriesCount(status)
  } catch (error) {
    returnDirectusQueryError(error, failedToFetchMessage, {
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
