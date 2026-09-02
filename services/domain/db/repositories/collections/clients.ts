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
  return await getClientsQuery({ status, limit, page })
}

export async function getClientsCountRepository({
  status = "published",
}: Pick<ClientsQuery, "status"> = {}): Promise<number> {
  return await getClientsCountQuery({ status })
}
