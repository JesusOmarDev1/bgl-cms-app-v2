import { getTranslations } from "next-intl/server"
import {
  getManualCategoriesCountQuery,
  getManualCategoriesQuery,
  type ManualCategoriesQuery,
  type ManualCategoriesQueryResult,
} from "@/services/domain/db/queries/collections/manual-categories/manual-categories"

export async function getManualCategoriesRepository({
  status = "published",
  limit = 10,
  page = 1,
}: ManualCategoriesQuery = {}): Promise<ManualCategoriesQueryResult> {
  const t = await getTranslations("db.manual_categories")
  return await getManualCategoriesQuery(
    { status, limit, page },
    t("failed_to_fetch")
  )
}

export async function getManualCategoriesCountRepository({
  status = "published",
}: Pick<ManualCategoriesQuery, "status"> = {}): Promise<number> {
  const t = await getTranslations("db.manual_categories")
  return await getManualCategoriesCountQuery({ status }, t("failed_to_fetch"))
}
