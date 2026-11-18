import {
  getPrivateClientsQuery,
  type PrivateClientsQuery,
  type PrivateClientsQueryResult,
} from "@/services/domain/db/queries/collections/private-metrology/clients/clients"

export async function getPrivateClientsRepository({
  ...query
}: PrivateClientsQuery): Promise<PrivateClientsQueryResult> {
  return getPrivateClientsQuery(query)
}
