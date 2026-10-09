import { getTranslations } from "next-intl/server"
import {
  getProductCategoriesCountQuery,
  getProductCategoriesQuery,
  type ProductCategoriesQuery,
  type ProductCategoriesQueryResult,
} from "@/services/domain/db/queries/collections/product-categories/product-categories"

export async function getProductCategoriesRepository({
  status = "published",
  limit = 10,
  page = 1,
}: ProductCategoriesQuery = {}): Promise<ProductCategoriesQueryResult> {
  const t = await getTranslations("db.product_categories")
  return await getProductCategoriesQuery(
    { status, limit, page },
    t("failed_to_fetch")
  )
}

export async function getProductCategoriesCountRepository({
  status = "published",
}: Pick<ProductCategoriesQuery, "status"> = {}): Promise<number> {
  const t = await getTranslations("db.product_categories")
  return await getProductCategoriesCountQuery({ status }, t("failed_to_fetch"))
}
