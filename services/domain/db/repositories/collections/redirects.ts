import { getTranslations } from "next-intl/server"
import {
  getRedirectsCountQuery,
  getRedirectsQuery,
  type RedirectsQuery,
  type RedirectsQueryResult,
} from "@/services/domain/db/queries/collections/redirects/redirects"

export async function getRedirectsRepository({
  limit = 10,
  page = 1,
  origin,
}: RedirectsQuery = {}): Promise<RedirectsQueryResult> {
  const t = await getTranslations("db.redirects")
  return await getRedirectsQuery({ limit, page, origin }, t("failed_to_fetch"))
}

export async function getRedirectsCountRepository(): Promise<number> {
  const t = await getTranslations("db.redirects")
  return await getRedirectsCountQuery(t("failed_to_fetch"))
}
