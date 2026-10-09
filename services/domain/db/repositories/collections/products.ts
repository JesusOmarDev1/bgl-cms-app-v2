import { getTranslations } from "next-intl/server"
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
  const t = await getTranslations("db.products")
  return await getProductsQuery({ status, limit, page }, t("failed_to_fetch"))
}

export async function getProductsCountRepository({
  status = "published",
}: Pick<ProductsQuery, "status"> = {}): Promise<number> {
  const t = await getTranslations("db.products")
  return await getProductsCountQuery({ status }, t("failed_to_fetch"))
}

export async function getProductBySlugRepository({
  status = "published",
  limit = 1,
  page = 1,
  slug,
}: ProductsQuery & { slug: string }): Promise<ProductsQueryResult> {
  const t = await getTranslations("db.products")
  return await getProductsBySlugQuery(
    { status, limit, page },
    slug,
    t("failed_to_fetch")
  )
}
