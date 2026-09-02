import {
  getProductAttributesCountQuery,
  getProductAttributesQuery,
  type ProductAttributesQuery,
  type ProductAttributesQueryResult,
} from "@/services/domain/db/queries/collections/product-attributes/product-attributes"

export async function getProductAttributesRepository({
  status = "published",
  limit = 10,
  page = 1,
}: ProductAttributesQuery = {}): Promise<ProductAttributesQueryResult> {
  return await getProductAttributesQuery({ status, limit, page })
}

export async function getProductAttributesCountRepository({
  status = "published",
}: Pick<ProductAttributesQuery, "status"> = {}): Promise<number> {
  return await getProductAttributesCountQuery({ status })
}
