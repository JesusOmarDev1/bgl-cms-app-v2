import { getTranslations } from "next-intl/server"
import {
  getClientsCountQuery,
  getClientsQuery,
  type ClientsQuery,
  type ClientsQueryResult,
} from "@/services/domain/db/queries/collections/clients/clients"

export async function getClientsRepository({
  status = "published",
  limit = 10,
  page = 1,
}: ClientsQuery = {}): Promise<ClientsQueryResult> {
  const t = await getTranslations("db.clients")
  return await getClientsQuery({ status, limit, page }, t("failed_to_fetch"))
}

export async function getClientsCountRepository({
  status = "published",
}: Pick<ClientsQuery, "status"> = {}): Promise<number> {
  const t = await getTranslations("db.clients")
  return await getClientsCountQuery({ status }, t("failed_to_fetch"))
}
