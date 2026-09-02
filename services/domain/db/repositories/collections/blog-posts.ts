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
  return await getBlogPostsQuery({ status, limit, page })
}

export async function getBlogPostBySlugRepository({
  status = "published",
  limit = 1,
  page = 1,
  slug,
}: BlogPostsQuery & { slug: string }): Promise<BlogPostsQueryResult> {
  return await getBlogPostsBySlugQuery({ status, limit, page }, slug)
}

export async function getBlogPostsCountRepository({
  status = "published",
}: Pick<BlogPostsQuery, "status"> = {}): Promise<number> {
  return await getBlogPostsCountQuery({ status })
}
