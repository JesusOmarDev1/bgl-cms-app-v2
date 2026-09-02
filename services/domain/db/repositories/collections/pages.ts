import {
  getPagesBySlugQuery,
  getPagesCountQuery,
  getPagesQuery,
  type PagesQuery,
  type PagesQueryResult,
} from "@/services/domain/db/queries/collections/pages/pages"

export async function getPagesRepository({
  status = "published",
  limit = 10,
  page = 1,
}: PagesQuery = {}): Promise<PagesQueryResult> {
  return await getPagesQuery({ status, limit, page })
}

export async function getPageBySlugRepository({
  status = "published",
  limit = 1,
  page = 1,
  slug,
}: PagesQuery & { slug: string }): Promise<PagesQueryResult> {
  return await getPagesBySlugQuery({ status, limit, page }, slug)
}

export async function getPagesCountRepository({
  status = "published",
}: Pick<PagesQuery, "status"> = {}): Promise<number> {
  return await getPagesCountQuery({ status })
}
