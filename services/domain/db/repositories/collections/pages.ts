import { PagesTypes } from "@/types/collections/pages"
import {
  PagesQuery,
  getPagesQuery,
  getPagesBySlugQuery,
} from "@/services/domain/db/queries/collections/pages"

export async function getPagesRepository({
  status = "published",
  limit = 10,
  offset = 0,
}: PagesQuery): Promise<PagesTypes[]> {
  return getPagesQuery({ status, limit, offset })
}

export async function getPageBySlugRepository({
  status = "published",
  limit = 1,
  offset = 0,
  slug,
}: PagesQuery & { slug: string }): Promise<PagesTypes[]> {
  return getPagesBySlugQuery({ status, limit, offset }, slug)
}
