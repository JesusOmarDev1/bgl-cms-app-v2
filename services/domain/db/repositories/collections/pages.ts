import {
  getPagesBySlugQuery,
  getPagesQuery,
  type PagesQuery,
  type PagesQueryResult,
} from "@/services/domain/db/queries/collections/pages"

export async function getPagesRepository({
  status = "published",
  limit = 10,
  offset = 0,
}: PagesQuery): Promise<PagesQueryResult> {
  return await getPagesQuery({ status, limit, offset })
}

export async function getPageBySlugRepository({
  status = "published",
  limit = 1,
  offset = 0,
  slug,
}: PagesQuery & { slug: string }): Promise<PagesQueryResult> {
  return await getPagesBySlugQuery({ status, limit, offset }, slug)
}
