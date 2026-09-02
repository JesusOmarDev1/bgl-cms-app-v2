import {
  getProductsBySlugQuery,
  getProductsCountQuery,
  getProductsQuery,
  type ProductsQuery,
  type ProductsQueryResult,
} from "@/services/domain/db/queries/collections/products/products"

export async function getProductsRepository({
  status = "published",
  limit = 10,
  page = 1,
}: ProductsQuery = {}): Promise<ProductsQueryResult> {
  return await getProductsQuery({ status, limit, page })
}

export async function getProductsCountRepository({
  status = "published",
}: Pick<ProductsQuery, "status"> = {}): Promise<number> {
  return await getProductsCountQuery({ status })
}

export async function getProductBySlugRepository({
  status = "published",
  limit = 1,
  page = 1,
  slug,
}: ProductsQuery & { slug: string }): Promise<ProductsQueryResult> {
  return await getProductsBySlugQuery({ status, limit, page }, slug)
}
