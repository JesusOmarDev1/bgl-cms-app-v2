import "server-only"
import type { Query } from "@directus/sdk"
import { aggregate, readItems } from "@directus/sdk"
import { getTranslations } from "next-intl/server"
import directus from "@/config/directus"
import { parseAggregateCount } from "@/lib/formatting/parse-aggregate-count"
import { logDirectusQueryError } from "@/lib/directus/query-error"
import type { BlogPostsTypes } from "@/types/collections/blog-posts"
import type { StatusType } from "@/types/enums/status-type"
import type { Schema } from "@/types/schema"
import { BLOG_POSTS_FIELDS } from "./blog-posts.fields"

export interface BlogPostsQuery {
  status?: StatusType
  limit?: number
  page?: number
}

export async function getBlogPostsQuery(query: BlogPostsQuery) {
  const { status = "published", limit = 10, page = 1 } = query
  const t = await getTranslations("db.blog_posts")
  try {
    const posts = await directus.request(
      readItems("blog_posts", {
        fields: BLOG_POSTS_FIELDS as unknown as Query<
          Schema,
          BlogPostsTypes
        >["fields"],
        limit,
        page,
        sort: ["-date_created"],
        filter: { status: { _eq: status } },
      } satisfies Query<Schema, BlogPostsTypes>)
    )
    return posts
  } catch (error) {
    logDirectusQueryError(error, t("failed_to_fetch"), {
      component: "db.queries",
      operation: "getBlogPostsQuery",
      collection: "blog_posts",
    })
    return []
  }
}

export async function getBlogPostsBySlugQuery(
  query: BlogPostsQuery,
  slug: string
) {
  const { status = "published", limit = 1, page = 1 } = query
  const t = await getTranslations("db.blog_posts")
  try {
    const post = await directus.request(
      readItems("blog_posts", {
        fields: BLOG_POSTS_FIELDS as unknown as Query<
          Schema,
          BlogPostsTypes
        >["fields"],
        limit,
        page,
        sort: ["-date_created"],
        filter: { status: { _eq: status }, slug: { _eq: slug } },
      } satisfies Query<Schema, BlogPostsTypes>)
    )
    return post
  } catch (error) {
    logDirectusQueryError(error, t("failed_to_fetch"), {
      component: "db.queries",
      operation: "getBlogPostsBySlugQuery",
      collection: "blog_posts",
    })
    return []
  }
}

export async function getBlogPostsCountQuery(
  query: Pick<BlogPostsQuery, "status"> = {}
) {
  const { status = "published" } = query
  const t = await getTranslations("db.blog_posts")
  try {
    const rows = await directus.request(
      aggregate("blog_posts", {
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
      operation: "getBlogPostsCountQuery",
      collection: "blog_posts",
    })
    return 0
  }
}

export type BlogPostsQueryResult = Awaited<ReturnType<typeof getBlogPostsQuery>>
export type BlogPostsCountQueryResult = Awaited<
  ReturnType<typeof getBlogPostsCountQuery>
>
