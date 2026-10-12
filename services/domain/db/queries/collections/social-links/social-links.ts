import "server-only"
import type { Query } from "@directus/sdk"
import { aggregate, readItems } from "@directus/sdk"
import directus from "@/config/directus"
import { parseAggregateCount } from "@/lib/formatting/parse-aggregate-count"
import { returnDirectusQueryError } from "@/lib/directus/query-error"
import { SOCIAL_LINKS_FIELDS } from "@/services/domain/db/queries/collections/social-links/social-links.fields"
import type { SocialLinksTypes } from "@/types/collections/social-links"
import type { Schema } from "@/types/schema"
import { cacheLife, cacheTag } from "next/cache"
export interface SocialLinksQuery {
  limit?: number
  page?: number
}

async function fetchSocialLinks(limit: number, page: number) {
  "use cache"
  cacheTag("social_links")
  cacheLife("minutes")
  return directus.request(
    readItems("social_links", {
      fields: SOCIAL_LINKS_FIELDS,
      limit,
      page,
      sort: ["-date_created"],
    } satisfies Query<Schema, SocialLinksTypes>)
  )
}

export async function getSocialLinksQuery(
  query: SocialLinksQuery,
  failedToFetchMessage: string
) {
  const { limit = 10, page = 1 } = query
  try {
    return await fetchSocialLinks(limit, page)
  } catch (error) {
    returnDirectusQueryError(error, failedToFetchMessage, {
      component: "db.queries",
      operation: "getSocialLinksQuery",
      collection: "social_links",
    })
    return []
  }
}

async function fetchSocialLinksCount() {
  "use cache"
  cacheTag("social_links_count")
  cacheLife("minutes")
  const rows = await directus.request(
    aggregate("social_links", {
      aggregate: { count: "*" },
    })
  )
  return parseAggregateCount(rows[0]?.count)
}

export async function getSocialLinksCountQuery(failedToFetchMessage: string) {
  try {
    return await fetchSocialLinksCount()
  } catch (error) {
    returnDirectusQueryError(error, failedToFetchMessage, {
      component: "db.queries",
      operation: "getSocialLinksCountQuery",
      collection: "social_links",
    })
    return 0
  }
}

export type SocialLinksQueryResult = Awaited<
  ReturnType<typeof getSocialLinksQuery>
>
