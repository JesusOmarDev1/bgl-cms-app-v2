import "server-only"
import type { Query } from "@directus/sdk"
import { aggregate, readItems } from "@directus/sdk"
import { getTranslations } from "next-intl/server"
import directus from "@/config/directus"
import { SOCIAL_LINKS_FIELDS } from "@/services/domain/db/queries/collections/social-links/social-links.fields"
import type { SocialLinksTypes } from "@/types/collections/social-links"
import type { Schema } from "@/types/schema"

export interface SocialLinksQuery {
  limit?: number
  page?: number
}

export async function getSocialLinksQuery(query: SocialLinksQuery = {}) {
  const { limit = 10, page = 1 } = query
  const t = await getTranslations("db.social_links")
  try {
    const items = await directus.request(
      readItems("social_links", {
        fields: SOCIAL_LINKS_FIELDS,
        limit,
        page,
        sort: ["-date_created"],
      } satisfies Query<Schema, SocialLinksTypes>)
    )
    return items
  } catch (error) {
    console.error(error instanceof Error ? error.message : t("failed_to_fetch"))
    return []
  }
}

export async function getSocialLinksCountQuery() {
  const t = await getTranslations("db.social_links")
  try {
    const result = await directus.request(
      aggregate("social_links", {
        aggregate: { count: "*" },
      })
    )
    const count = Number(result[0]?.count ?? 0)
    return Number.isFinite(count) ? count : 0
  } catch (error) {
    console.error(error instanceof Error ? error.message : t("failed_to_fetch"))
    return 0
  }
}

export type SocialLinksQueryResult = Awaited<
  ReturnType<typeof getSocialLinksQuery>
>
