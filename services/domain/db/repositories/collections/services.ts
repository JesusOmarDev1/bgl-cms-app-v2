import { getTranslations } from "next-intl/server"
import {
  getServicesBySlugQuery,
  getServicesCountQuery,
  getServicesQuery,
  type ServicesQuery,
  type ServicesQueryResult,
} from "@/services/domain/db/queries/collections/services/services"

export async function getServicesRepository({
  status = "published",
  limit = 10,
  page = 1,
}: ServicesQuery = {}): Promise<ServicesQueryResult> {
  const t = await getTranslations("db.services")
  return await getServicesQuery({ status, limit, page }, t("failed_to_fetch"))
}

export async function getServiceBySlugRepository({
  status = "published",
  limit = 1,
  page = 1,
  slug,
}: ServicesQuery & { slug: string }): Promise<ServicesQueryResult> {
  const t = await getTranslations("db.services")
  return await getServicesBySlugQuery(
    { status, limit, page },
    slug,
    t("failed_to_fetch")
  )
}

export async function getServicesCountRepository({
  status = "published",
}: Pick<ServicesQuery, "status"> = {}): Promise<number> {
  const t = await getTranslations("db.services")
  return await getServicesCountQuery({ status }, t("failed_to_fetch"))
}
