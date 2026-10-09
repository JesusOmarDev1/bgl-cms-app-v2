import { getTranslations } from "next-intl/server"
import {
  getBlogPostsBySlugQuery,
  getBlogPostsCountQuery,
  getBlogPostsQuery,
  type BlogPostsQuery,
  type BlogPostsQueryResult,
} from "@/services/domain/db/queries/collections/blog-posts/blog-posts"

export async function getBlogPostsRepository({
  status = "published",
  limit = 10,
  page = 1,
}: BlogPostsQuery = {}): Promise<BlogPostsQueryResult> {
  const t = await getTranslations("db.blog_posts")
  return await getBlogPostsQuery({ status, limit, page }, t("failed_to_fetch"))
}

export async function getBlogPostBySlugRepository({
  status = "published",
  limit = 1,
  page = 1,
  slug,
}: BlogPostsQuery & { slug: string }): Promise<BlogPostsQueryResult> {
  const t = await getTranslations("db.blog_posts")
  return await getBlogPostsBySlugQuery(
    { status, limit, page },
    slug,
    t("failed_to_fetch")
  )
}

export async function getBlogPostsCountRepository({
  status = "published",
}: Pick<BlogPostsQuery, "status"> = {}): Promise<number> {
  const t = await getTranslations("db.blog_posts")
  return await getBlogPostsCountQuery({ status }, t("failed_to_fetch"))
}
