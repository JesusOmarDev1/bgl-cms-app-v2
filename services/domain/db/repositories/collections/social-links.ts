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
  return await getSocialLinksQuery({ limit, page })
}

export async function getSocialLinksCountRepository(): Promise<number> {
  return await getSocialLinksCountQuery()
}
