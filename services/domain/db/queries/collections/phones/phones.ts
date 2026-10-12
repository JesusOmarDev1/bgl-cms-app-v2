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

async function fetchPhones(limit: number, page: number) {
  "use cache"
  cacheTag("phones")
  cacheLife("minutes")
  return directus.request(
    readItems("phones", {
      fields: PHONES_FIELDS,
      limit,
      page,
      sort: ["-date_created"],
    } satisfies Query<Schema, PhoneTypes>)
  )
}

export async function getPhonesQuery(
  query: PhonesQuery,
  failedToFetchMessage: string
) {
  const { limit = 10, page = 1 } = query
  try {
    return await fetchPhones(limit, page)
  } catch (error) {
    returnDirectusQueryError(error, failedToFetchMessage, {
      component: "db.queries",
      operation: "getPhonesQuery",
      collection: "phones",
    })
    return []
  }
}

async function fetchPhonesCount() {
  "use cache"
  cacheTag("phones_count")
  cacheLife("minutes")
  const rows = await directus.request(
    aggregate("phones", {
      aggregate: { count: "*" },
    })
  )
  return parseAggregateCount(rows[0]?.count)
}

export async function getPhonesCountQuery(failedToFetchMessage: string) {
  try {
    return await fetchPhonesCount()
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
