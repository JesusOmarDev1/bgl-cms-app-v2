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
  return await getProductCategoriesQuery({ status, limit, page })
}

export async function getProductCategoriesCountRepository({
  status = "published",
}: Pick<ProductCategoriesQuery, "status"> = {}): Promise<number> {
  return await getProductCategoriesCountQuery({ status })
}
