import {
  getPrivateModelsQuery,
  type PrivateModelsQuery,
  type PrivateModelsQueryResult,
} from "@/services/domain/db/queries/collections/private-metrology/models/models"

export async function getPrivateModelsRepository({
  ...query
}: PrivateModelsQuery): Promise<PrivateModelsQueryResult> {
  return getPrivateModelsQuery(query)
}
