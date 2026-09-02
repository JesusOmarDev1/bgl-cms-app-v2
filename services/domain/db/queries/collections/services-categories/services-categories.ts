import "server-only"
import type { Query } from "@directus/sdk"
import { aggregate, readItems } from "@directus/sdk"
import { getTranslations } from "next-intl/server"
import directus from "@/config/directus"
import { SERVICES_CATEGORIES_FIELDS } from "@/services/domain/db/queries/collections/services-categories/services-categories.fields"
import type { ServicesCategoriesTypes } from "@/types/collections/services-categories"
import type { StatusType } from "@/types/enums/status-type"
import type { Schema } from "@/types/schema"

export interface ServicesCategoriesQuery {
  status?: StatusType
  limit?: number
  page?: number
}

export async function getServicesCategoriesQuery(
  query: ServicesCategoriesQuery = {}
) {
  const { status = "published", limit = 10, page = 1 } = query
  const t = await getTranslations("db.services_categories")
  try {
    const items = await directus.request(
      readItems("services_categories", {
        fields: SERVICES_CATEGORIES_FIELDS,
        limit,
        page,
        sort: ["-date_created"],
        filter: { status: { _eq: status } },
      } satisfies Query<Schema, ServicesCategoriesTypes>)
    )
    return items
  } catch (error) {
    console.error(error instanceof Error ? error.message : t("failed_to_fetch"))
    return []
  }
}

export async function getServicesCategoriesCountQuery(
  query: ServicesCategoriesQuery = {}
) {
  const { status = "published" } = query
  const t = await getTranslations("db.services_categories")
  try {
    const result = await directus.request(
      aggregate("services_categories", {
        aggregate: { count: "*" },
        query: {
          filter: { status: { _eq: status } },
        },
      })
    )
    const count = Number(result[0]?.count ?? 0)
    return Number.isFinite(count) ? count : 0
  } catch (error) {
    console.error(error instanceof Error ? error.message : t("failed_to_fetch"))
    return 0
  }
}

export type ServicesCategoriesQueryResult = Awaited<
  ReturnType<typeof getServicesCategoriesQuery>
>
