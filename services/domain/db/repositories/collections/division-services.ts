import {
  getDivisionServicesCountQuery,
  getDivisionServicesQuery,
  type DivisionServicesQuery,
  type DivisionServicesQueryResult,
} from "@/services/domain/db/queries/collections/division-services/division-services"

export async function getDivisionServicesRepository({
  status = "published",
  limit = 10,
  page = 1,
}: DivisionServicesQuery = {}): Promise<DivisionServicesQueryResult> {
  return await getDivisionServicesQuery({ status, limit, page })
}

export async function getDivisionServicesCountRepository({
  status = "published",
}: Pick<DivisionServicesQuery, "status"> = {}): Promise<number> {
  return await getDivisionServicesCountQuery({ status })
}
