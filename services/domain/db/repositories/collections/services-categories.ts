import { getTranslations } from "next-intl/server"
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
  const t = await getTranslations("db.services_categories")
  return await getServicesCategoriesQuery(
    { status, limit, page },
    t("failed_to_fetch")
  )
}

export async function getServicesCategoriesCountRepository({
  status = "published",
}: Pick<ServicesCategoriesQuery, "status"> = {}): Promise<number> {
  const t = await getTranslations("db.services_categories")
  return await getServicesCategoriesCountQuery({ status }, t("failed_to_fetch"))
}
