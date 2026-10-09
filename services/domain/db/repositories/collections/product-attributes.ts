import { getTranslations } from "next-intl/server"
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
  const t = await getTranslations("db.product_attributes")
  return await getProductAttributesQuery(
    { status, limit, page },
    t("failed_to_fetch")
  )
}

export async function getProductAttributesCountRepository({
  status = "published",
}: Pick<ProductAttributesQuery, "status"> = {}): Promise<number> {
  const t = await getTranslations("db.product_attributes")
  return await getProductAttributesCountQuery({ status }, t("failed_to_fetch"))
}
