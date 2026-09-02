import "server-only"
import type { Query } from "@directus/sdk"
import { aggregate, readItems } from "@directus/sdk"
import { getTranslations } from "next-intl/server"
import directus from "@/config/directus"
import type { ManualsTypes } from "@/types/collections/manuals"
import type { StatusType } from "@/types/enums/status-type"
import type { Schema } from "@/types/schema"
import { MANUALS_FIELDS } from "./manuals.fields"

export interface ManualsQuery {
  status?: StatusType
  limit?: number
  page?: number
}

const MANUALS_BODY_DEEP = {
  body: { _sort: ["sort"] },
} as unknown as Query<Schema, ManualsTypes>["deep"]

function parseAggregateCount(count: string | null | undefined): number {
  const parsed = Number(count ?? 0)
  return Number.isFinite(parsed) ? parsed : 0
}

export async function getManualsQuery(query: ManualsQuery) {
  const { status = "published", limit = 10, page = 1 } = query
  const t = await getTranslations("db.manuals")
  try {
    const manuals = await directus.request(
      readItems("manuals", {
        fields: MANUALS_FIELDS as unknown as Query<
          Schema,
          ManualsTypes
        >["fields"],
        limit,
        page,
        sort: ["-date_created"],
        filter: { status: { _eq: status } },
        deep: MANUALS_BODY_DEEP,
      } satisfies Query<Schema, ManualsTypes>)
    )
    return manuals
  } catch (error) {
    console.error(error instanceof Error ? error.message : t("failed_to_fetch"))
    return []
  }
}

export async function getManualsBySlugQuery(query: ManualsQuery, slug: string) {
  const { status = "published", limit = 1, page = 1 } = query
  const t = await getTranslations("db.manuals")
  try {
    const manual = await directus.request(
      readItems("manuals", {
        fields: MANUALS_FIELDS as unknown as Query<
          Schema,
          ManualsTypes
        >["fields"],
        limit,
        page,
        sort: ["-date_created"],
        filter: { status: { _eq: status }, slug: { _eq: slug } },
        deep: MANUALS_BODY_DEEP,
      } satisfies Query<Schema, ManualsTypes>)
    )
    return manual
  } catch (error) {
    console.error(error instanceof Error ? error.message : t("failed_to_fetch"))
    return []
  }
}

export async function getManualsCountQuery(
  query: Pick<ManualsQuery, "status"> = {}
) {
  const { status = "published" } = query
  const t = await getTranslations("db.manuals")
  try {
    const rows = await directus.request(
      aggregate("manuals", {
        aggregate: { count: "*" },
        query: {
          filter: { status: { _eq: status } },
        },
      })
    )
    return parseAggregateCount(rows[0]?.count)
  } catch (error) {
    console.error(error instanceof Error ? error.message : t("failed_to_fetch"))
    return 0
  }
}

export type ManualsQueryResult = Awaited<ReturnType<typeof getManualsQuery>>
export type ManualsCountQueryResult = Awaited<
  ReturnType<typeof getManualsCountQuery>
>
