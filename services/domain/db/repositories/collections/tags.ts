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
  return await getTagsQuery({ status, limit, page })
}

export async function getTagsCountRepository({
  status = "published",
}: TagsQuery = {}): Promise<number> {
  return await getTagsCountQuery({ status })
}
