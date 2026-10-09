import { getTranslations } from "next-intl/server"
import {
  getBrandsCountQuery,
  getBrandsQuery,
  type BrandsQuery,
  type BrandsQueryResult,
} from "@/services/domain/db/queries/collections/brands/brands"

export async function getBrandsRepository({
  status = "published",
  limit = 10,
  page = 1,
}: BrandsQuery = {}): Promise<BrandsQueryResult> {
  const t = await getTranslations("db.brands")
  return await getBrandsQuery({ status, limit, page }, t("failed_to_fetch"))
}

export async function getBrandsCountRepository({
  status = "published",
}: Pick<BrandsQuery, "status"> = {}): Promise<number> {
  const t = await getTranslations("db.brands")
  return await getBrandsCountQuery({ status }, t("failed_to_fetch"))
}
