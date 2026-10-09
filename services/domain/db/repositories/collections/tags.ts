import { getTranslations } from "next-intl/server"
import {
  getTagsCountQuery,
  getTagsQuery,
  type TagsQuery,
  type TagsQueryResult,
} from "@/services/domain/db/queries/collections/tags/tags"

export async function getTagsRepository({
  status = "published",
  limit = 10,
  page = 1,
}: TagsQuery = {}): Promise<TagsQueryResult> {
  const t = await getTranslations("db.tags")
  return await getTagsQuery({ status, limit, page }, t("failed_to_fetch"))
}

export async function getTagsCountRepository({
  status = "published",
}: Pick<TagsQuery, "status"> = {}): Promise<number> {
  const t = await getTranslations("db.tags")
  return await getTagsCountQuery({ status }, t("failed_to_fetch"))
}
