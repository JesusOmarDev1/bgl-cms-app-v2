import { getTranslations } from "next-intl/server"
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
  const t = await getTranslations("db.blog_categories")
  return await getBlogCategoriesQuery(
    { status, limit, page },
    t("failed_to_fetch")
  )
}

export async function getBlogCategoriesCountRepository({
  status = "published",
}: Pick<BlogCategoriesQuery, "status"> = {}): Promise<number> {
  const t = await getTranslations("db.blog_categories")
  return await getBlogCategoriesCountQuery({ status }, t("failed_to_fetch"))
}
