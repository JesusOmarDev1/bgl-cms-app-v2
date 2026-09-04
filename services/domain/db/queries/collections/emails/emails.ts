import "server-only"
import type { Query } from "@directus/sdk"
import { aggregate, readItems } from "@directus/sdk"
import { getTranslations } from "next-intl/server"
import directus from "@/config/directus"
import { parseAggregateCount } from "@/lib/formatting/parse-aggregate-count"
import { logDirectusQueryError } from "@/lib/directus/query-error"
import { EMAILS_FIELDS } from "@/services/domain/db/queries/collections/emails/emails.fields"
import type { EmailTypes } from "@/types/collections/emails"
import type { Schema } from "@/types/schema"

export interface EmailsQuery {
  limit?: number
  page?: number
}

export async function getEmailsQuery(query: EmailsQuery = {}) {
  const { limit = 10, page = 1 } = query
  const t = await getTranslations("db.emails")
  try {
    const items = await directus.request(
      readItems("emails", {
        fields: EMAILS_FIELDS,
        limit,
        page,
        sort: ["-date_created"],
      } satisfies Query<Schema, EmailTypes>)
    )
    return items
  } catch (error) {
    logDirectusQueryError(error, t("failed_to_fetch"), {
      component: "db.queries",
      operation: "getEmailsQuery",
      collection: "emails",
    })
    return []
  }
}

export async function getEmailsCountQuery() {
  const t = await getTranslations("db.emails")
  try {
    const rows = await directus.request(
      aggregate("emails", {
        aggregate: { count: "*" },
      })
    )
    return parseAggregateCount(rows[0]?.count)
  } catch (error) {
    logDirectusQueryError(error, t("failed_to_fetch"), {
      component: "db.queries",
      operation: "getEmailsCountQuery",
      collection: "emails",
    })
    return 0
  }
}

export type EmailsQueryResult = Awaited<ReturnType<typeof getEmailsQuery>>
