import "server-only"
import type { Query } from "@directus/sdk"
import { aggregate, readItems } from "@directus/sdk"
import { getTranslations } from "next-intl/server"
import directus from "@/config/directus"
import { parseAggregateCount } from "@/lib/formatting/parse-aggregate-count"
import { logDirectusQueryError } from "@/lib/directus/query-error"
import { MANUAL_CATEGORIES_FIELDS } from "@/services/domain/db/queries/collections/manual-categories/manual-categories.fields"
import type { ManualCategoriesTypes } from "@/types/collections/manual-categories"
import type { StatusType } from "@/types/enums/status-type"
import type { Schema } from "@/types/schema"

export interface ManualCategoriesQuery {
  status?: StatusType
  limit?: number
  page?: number
}

export async function getManualCategoriesQuery(
  query: ManualCategoriesQuery = {}
) {
  const { status = "published", limit = 10, page = 1 } = query
  const t = await getTranslations("db.manual_categories")
  try {
    const items = await directus.request(
      readItems("manual_categories", {
        fields: MANUAL_CATEGORIES_FIELDS,
        limit,
        page,
        sort: ["-date_created"],
        filter: { status: { _eq: status } },
      } satisfies Query<Schema, ManualCategoriesTypes>)
    )
    return items
  } catch (error) {
    logDirectusQueryError(error, t("failed_to_fetch"), {
      component: "db.queries",
      operation: "getManualCategoriesQuery",
      collection: "manual_categories",
    })
    return []
  }
}

export async function getManualCategoriesCountQuery(
  query: Pick<ManualCategoriesQuery, "status"> = {}
) {
  const { status = "published" } = query
  const t = await getTranslations("db.manual_categories")
  try {
    const rows = await directus.request(
      aggregate("manual_categories", {
        aggregate: { count: "*" },
        query: {
          filter: { status: { _eq: status } },
        },
      })
    )
    return parseAggregateCount(rows[0]?.count)
  } catch (error) {
    logDirectusQueryError(error, t("failed_to_fetch"), {
      component: "db.queries",
      operation: "getManualCategoriesCountQuery",
      collection: "manual_categories",
    })
    return 0
  }
}

export type ManualCategoriesQueryResult = Awaited<
  ReturnType<typeof getManualCategoriesQuery>
>
