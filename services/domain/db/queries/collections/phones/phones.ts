import "server-only"
import type { Query } from "@directus/sdk"
import { aggregate, readItems } from "@directus/sdk"
import { getTranslations } from "next-intl/server"
import directus from "@/config/directus"
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
    console.error(error instanceof Error ? error.message : t("failed_to_fetch"))
    return []
  }
}

export async function getPhonesCountQuery() {
  const t = await getTranslations("db.phones")
  try {
    const result = await directus.request(
      aggregate("phones", {
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

export type PhonesQueryResult = Awaited<ReturnType<typeof getPhonesQuery>>
