import { getTranslations } from "next-intl/server"
import {
  getSuppliersCountQuery,
  getSuppliersQuery,
  type SuppliersQuery,
  type SuppliersQueryResult,
} from "@/services/domain/db/queries/collections/suppliers/suppliers"

export async function getSuppliersRepository({
  status = "published",
  limit = 10,
  page = 1,
}: SuppliersQuery = {}): Promise<SuppliersQueryResult> {
  const t = await getTranslations("db.suppliers")
  return await getSuppliersQuery({ status, limit, page }, t("failed_to_fetch"))
}

export async function getSuppliersCountRepository({
  status = "published",
}: Pick<SuppliersQuery, "status"> = {}): Promise<number> {
  const t = await getTranslations("db.suppliers")
  return await getSuppliersCountQuery({ status }, t("failed_to_fetch"))
}
