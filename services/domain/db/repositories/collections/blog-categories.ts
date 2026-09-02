import {
  getBlogCategoriesCountQuery,
  getBlogCategoriesQuery,
  type BlogCategoriesQuery,
  type BlogCategoriesQueryResult,
} from "@/services/domain/db/queries/collections/blog-categories/blog-categories"

export async function getBlogCategoriesRepository({
  status = "published",
  limit = 10,
  page = 1,
}: BlogCategoriesQuery = {}): Promise<BlogCategoriesQueryResult> {
  return await getBlogCategoriesQuery({ status, limit, page })
}

export async function getBlogCategoriesCountRepository({
  status = "published",
}: BlogCategoriesQuery = {}): Promise<number> {
  return await getBlogCategoriesCountQuery({ status })
}
