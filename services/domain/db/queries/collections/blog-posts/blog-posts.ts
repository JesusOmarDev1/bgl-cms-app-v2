import "server-only"
import type { Query } from "@directus/sdk"
import { aggregate, readItems } from "@directus/sdk"
import { getTranslations } from "next-intl/server"
import directus from "@/config/directus"
import type { BlogPostsTypes } from "@/types/collections/blog-posts"
import type { StatusType } from "@/types/enums/status-type"
import type { Schema } from "@/types/schema"
import { BLOG_POSTS_FIELDS } from "./blog-posts.fields"

export interface BlogPostsQuery {
  status?: StatusType
  limit?: number
  page?: number
}

const BLOG_POSTS_BODY_DEEP = {
  body: { _sort: ["sort"] },
} as unknown as Query<Schema, BlogPostsTypes>["deep"]

function parseAggregateCount(count: string | null | undefined): number {
  const parsed = Number(count ?? 0)
  return Number.isFinite(parsed) ? parsed : 0
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
        deep: BLOG_POSTS_BODY_DEEP,
      } satisfies Query<Schema, BlogPostsTypes>)
    )
    return posts
  } catch (error) {
    console.error(error instanceof Error ? error.message : t("failed_to_fetch"))
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
        deep: BLOG_POSTS_BODY_DEEP,
      } satisfies Query<Schema, BlogPostsTypes>)
    )
    return post
  } catch (error) {
    console.error(error instanceof Error ? error.message : t("failed_to_fetch"))
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
    console.error(error instanceof Error ? error.message : t("failed_to_fetch"))
    return 0
  }
}

export type BlogPostsQueryResult = Awaited<ReturnType<typeof getBlogPostsQuery>>
export type BlogPostsCountQueryResult = Awaited<
  ReturnType<typeof getBlogPostsCountQuery>
>
