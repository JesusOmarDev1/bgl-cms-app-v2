import { getTranslations } from "next-intl/server"
import {
  getUrlLinksCountQuery,
  getUrlLinksQuery,
  type UrlLinksQuery,
  type UrlLinksQueryResult,
} from "@/services/domain/db/queries/collections/url-links/url-links"

export async function getUrlLinksRepository({
  limit = 10,
  page = 1,
}: UrlLinksQuery = {}): Promise<UrlLinksQueryResult> {
  const t = await getTranslations("db.url_links")
  return await getUrlLinksQuery({ limit, page }, t("failed_to_fetch"))
}

export async function getUrlLinksCountRepository(): Promise<number> {
  const t = await getTranslations("db.url_links")
  return await getUrlLinksCountQuery(t("failed_to_fetch"))
}
