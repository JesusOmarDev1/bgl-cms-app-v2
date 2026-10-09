import "server-only"
import type { Query } from "@directus/sdk"
import { aggregate, readItems } from "@directus/sdk"
import directus from "@/config/directus"
import { parseAggregateCount } from "@/lib/formatting/parse-aggregate-count"
import { returnDirectusQueryError } from "@/lib/directus/query-error"
import { PHONES_FIELDS } from "@/services/domain/db/queries/collections/phones/phones.fields"
import type { PhoneTypes } from "@/types/collections/phones"
import type { Schema } from "@/types/schema"
import { cacheLife, cacheTag } from "next/cache"

export interface PhonesQuery {
  limit?: number
  page?: number
}

export async function getPhonesQuery(
  query: PhonesQuery,
  failedToFetchMessage: string
) {
  "use cache"
  cacheTag("phones")
  cacheLife("minutes")
  const { limit = 10, page = 1 } = query
  try {
    const items = await directus.request(
      readItems("phones", {
        fields: PHONES_FIELDS,
        limit,
        page,
        sort: ["-date_created"],
      } satisfies Query<Schema, PhoneTypes>)
    )
    return items
  } catch (error) {
    returnDirectusQueryError(error, failedToFetchMessage, {
      component: "db.queries",
      operation: "getPhonesQuery",
      collection: "phones",
    })
    return []
  }
}

export async function getPhonesCountQuery(failedToFetchMessage: string) {
  "use cache"
  cacheTag("phones_count")
  cacheLife("minutes")
  try {
    const rows = await directus.request(
      aggregate("phones", {
        aggregate: { count: "*" },
      })
    )
    return parseAggregateCount(rows[0]?.count)
  } catch (error) {
    returnDirectusQueryError(error, failedToFetchMessage, {
      component: "db.queries",
      operation: "getPhonesCountQuery",
      collection: "phones",
    })
    return 0
  }
}

export type PhonesQueryResult = Awaited<ReturnType<typeof getPhonesQuery>>
