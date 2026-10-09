import { getTranslations } from "next-intl/server"
import {
  getSeoCountQuery,
  getSeoQuery,
  type SeoQuery,
  type SeoQueryResult,
} from "@/services/domain/db/queries/collections/seo/seo"

export async function getSeoRepository({
  limit = 10,
  page = 1,
}: SeoQuery = {}): Promise<SeoQueryResult> {
  const t = await getTranslations("db.seo")
  return await getSeoQuery({ limit, page }, t("failed_to_fetch"))
}

export async function getSeoCountRepository(): Promise<number> {
  const t = await getTranslations("db.seo")
  return await getSeoCountQuery(t("failed_to_fetch"))
}
