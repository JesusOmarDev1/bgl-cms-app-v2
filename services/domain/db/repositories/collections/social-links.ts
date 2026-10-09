import { getTranslations } from "next-intl/server"
import {
  getSocialLinksCountQuery,
  getSocialLinksQuery,
  type SocialLinksQuery,
  type SocialLinksQueryResult,
} from "@/services/domain/db/queries/collections/social-links/social-links"

export async function getSocialLinksRepository({
  limit = 10,
  page = 1,
}: SocialLinksQuery = {}): Promise<SocialLinksQueryResult> {
  const t = await getTranslations("db.social_links")
  return await getSocialLinksQuery({ limit, page }, t("failed_to_fetch"))
}

export async function getSocialLinksCountRepository(): Promise<number> {
  const t = await getTranslations("db.social_links")
  return await getSocialLinksCountQuery(t("failed_to_fetch"))
}
