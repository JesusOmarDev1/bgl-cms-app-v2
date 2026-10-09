import { getTranslations } from "next-intl/server"
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
  const t = await getTranslations("db.pages")
  return await getPagesQuery({ status, limit, page }, t("failed_to_fetch"))
}

export async function getPageBySlugRepository({
  status = "published",
  limit = 1,
  page = 1,
  slug,
}: PagesQuery & { slug: string }): Promise<PagesQueryResult> {
  const t = await getTranslations("db.pages")
  return await getPagesBySlugQuery(
    { status, limit, page },
    slug,
    t("failed_to_fetch")
  )
}

export async function getPagesCountRepository({
  status = "published",
}: Pick<PagesQuery, "status"> = {}): Promise<number> {
  const t = await getTranslations("db.pages")
  return await getPagesCountQuery({ status }, t("failed_to_fetch"))
}
