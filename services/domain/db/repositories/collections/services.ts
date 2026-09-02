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
  return await getServicesQuery({ status, limit, page })
}

export async function getServiceBySlugRepository({
  status = "published",
  limit = 1,
  page = 1,
  slug,
}: ServicesQuery & { slug: string }): Promise<ServicesQueryResult> {
  return await getServicesBySlugQuery({ status, limit, page }, slug)
}

export async function getServicesCountRepository({
  status = "published",
}: Pick<ServicesQuery, "status"> = {}): Promise<number> {
  return await getServicesCountQuery({ status })
}
