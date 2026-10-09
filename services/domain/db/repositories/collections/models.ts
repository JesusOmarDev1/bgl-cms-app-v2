import { getTranslations } from "next-intl/server"
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
  const t = await getTranslations("db.models")
  return await getModelsQuery({ status, limit, page }, t("failed_to_fetch"))
}

export async function getModelsCountRepository({
  status = "published",
}: Pick<ModelsQuery, "status"> = {}): Promise<number> {
  const t = await getTranslations("db.models")
  return await getModelsCountQuery({ status }, t("failed_to_fetch"))
}
