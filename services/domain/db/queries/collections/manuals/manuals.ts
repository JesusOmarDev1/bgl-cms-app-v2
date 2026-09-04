import "server-only"
import type { Query } from "@directus/sdk"
import { aggregate, readItems } from "@directus/sdk"
import { getTranslations } from "next-intl/server"
import directus from "@/config/directus"
import { parseAggregateCount } from "@/lib/formatting/parse-aggregate-count"
import { logDirectusQueryError } from "@/lib/directus/query-error"
import type { ManualsTypes } from "@/types/collections/manuals"
import type { StatusType } from "@/types/enums/status-type"
import type { Schema } from "@/types/schema"
import { MANUALS_FIELDS } from "./manuals.fields"

export interface ManualsQuery {
  status?: StatusType
  limit?: number
  page?: number
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
      } satisfies Query<Schema, ManualsTypes>)
    )
    return manuals
  } catch (error) {
    logDirectusQueryError(error, t("failed_to_fetch"), {
      component: "db.queries",
      operation: "getManualsQuery",
      collection: "manuals",
    })
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
      } satisfies Query<Schema, ManualsTypes>)
    )
    return manual
  } catch (error) {
    logDirectusQueryError(error, t("failed_to_fetch"), {
      component: "db.queries",
      operation: "getManualsBySlugQuery",
      collection: "manuals",
    })
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
    logDirectusQueryError(error, t("failed_to_fetch"), {
      component: "db.queries",
      operation: "getManualsCountQuery",
      collection: "manuals",
    })
    return 0
  }
}

export type ManualsQueryResult = Awaited<ReturnType<typeof getManualsQuery>>
export type ManualsCountQueryResult = Awaited<
  ReturnType<typeof getManualsCountQuery>
>
