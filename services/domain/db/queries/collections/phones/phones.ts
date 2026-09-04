import "server-only"
import type { Query } from "@directus/sdk"
import { aggregate, readItems } from "@directus/sdk"
import { getTranslations } from "next-intl/server"
import directus from "@/config/directus"
import { parseAggregateCount } from "@/lib/formatting/parse-aggregate-count"
import { logDirectusQueryError } from "@/lib/directus/query-error"
import { PHONES_FIELDS } from "@/services/domain/db/queries/collections/phones/phones.fields"
import type { PhoneTypes } from "@/types/collections/phones"
import type { Schema } from "@/types/schema"

export interface PhonesQuery {
  limit?: number
  page?: number
}

export async function getPhonesQuery(query: PhonesQuery = {}) {
  const { limit = 10, page = 1 } = query
  const t = await getTranslations("db.phones")
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
    logDirectusQueryError(error, t("failed_to_fetch"), {
      component: "db.queries",
      operation: "getPhonesQuery",
      collection: "phones",
    })
    return []
  }
}

export async function getPhonesCountQuery() {
  const t = await getTranslations("db.phones")
  try {
    const rows = await directus.request(
      aggregate("phones", {
        aggregate: { count: "*" },
      })
    )
    return parseAggregateCount(rows[0]?.count)
  } catch (error) {
    logDirectusQueryError(error, t("failed_to_fetch"), {
      component: "db.queries",
      operation: "getPhonesCountQuery",
      collection: "phones",
    })
    return 0
  }
}

export type PhonesQueryResult = Awaited<ReturnType<typeof getPhonesQuery>>
