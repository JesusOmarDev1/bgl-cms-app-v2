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
  return await getManualCategoriesQuery({ status, limit, page })
}

export async function getManualCategoriesCountRepository({
  status = "published",
}: Pick<ManualCategoriesQuery, "status"> = {}): Promise<number> {
  return await getManualCategoriesCountQuery({ status })
}
