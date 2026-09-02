import {
  getModelsCountQuery,
  getModelsQuery,
  type ModelsQuery,
  type ModelsQueryResult,
} from "@/services/domain/db/queries/collections/models/models"

export async function getModelsRepository({
  status = "published",
  limit = 10,
  page = 1,
}: ModelsQuery = {}): Promise<ModelsQueryResult> {
  return await getModelsQuery({ status, limit, page })
}

export async function getModelsCountRepository({
  status = "published",
}: Pick<ModelsQuery, "status"> = {}): Promise<number> {
  return await getModelsCountQuery({ status })
}
