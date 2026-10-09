import { getTranslations } from "next-intl/server"
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
  const t = await getTranslations("db.division_services")
  return await getDivisionServicesQuery(
    { status, limit, page },
    t("failed_to_fetch")
  )
}

export async function getDivisionServicesCountRepository({
  status = "published",
}: Pick<DivisionServicesQuery, "status"> = {}): Promise<number> {
  const t = await getTranslations("db.division_services")
  return await getDivisionServicesCountQuery({ status }, t("failed_to_fetch"))
}
