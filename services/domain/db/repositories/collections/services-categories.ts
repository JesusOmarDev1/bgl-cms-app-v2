import {
  getServicesCategoriesCountQuery,
  getServicesCategoriesQuery,
  type ServicesCategoriesQuery,
  type ServicesCategoriesQueryResult,
} from "@/services/domain/db/queries/collections/services-categories/services-categories"

export async function getServicesCategoriesRepository({
  status = "published",
  limit = 10,
  page = 1,
}: ServicesCategoriesQuery = {}): Promise<ServicesCategoriesQueryResult> {
  return await getServicesCategoriesQuery({ status, limit, page })
}

export async function getServicesCategoriesCountRepository({
  status = "published",
}: Pick<ServicesCategoriesQuery, "status"> = {}): Promise<number> {
  return await getServicesCategoriesCountQuery({ status })
}
