import { getTranslations } from "next-intl/server"
import {
  getSubLinksCountQuery,
  getSubLinksQuery,
  type SubLinksQuery,
  type SubLinksQueryResult,
} from "@/services/domain/db/queries/collections/sub-links/sub-links"

export async function getSubLinksRepository({
  limit = 10,
  page = 1,
}: SubLinksQuery = {}): Promise<SubLinksQueryResult> {
  const t = await getTranslations("db.sub_links")
  return await getSubLinksQuery({ limit, page }, t("failed_to_fetch"))
}

export async function getSubLinksCountRepository(): Promise<number> {
  const t = await getTranslations("db.sub_links")
  return await getSubLinksCountQuery(t("failed_to_fetch"))
}
