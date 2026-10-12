import "server-only"
import type { Query } from "@directus/sdk"
import { aggregate, readItems } from "@directus/sdk"
import directus from "@/config/directus"
import { parseAggregateCount } from "@/lib/formatting/parse-aggregate-count"
import { returnDirectusQueryError } from "@/lib/directus/query-error"
import { EMAILS_FIELDS } from "@/services/domain/db/queries/collections/emails/emails.fields"
import type { EmailTypes } from "@/types/collections/emails"
import type { Schema } from "@/types/schema"
import { cacheLife, cacheTag } from "next/cache"
export interface EmailsQuery {
  limit?: number
  page?: number
}

async function fetchEmails(limit: number, page: number) {
  "use cache"
  cacheTag("emails")
  cacheLife("minutes")
  return directus.request(
    readItems("emails", {
      fields: EMAILS_FIELDS,
      limit,
      page,
      sort: ["-date_created"],
    } satisfies Query<Schema, EmailTypes>)
  )
}

export async function getEmailsQuery(
  query: EmailsQuery,
  failedToFetchMessage: string
) {
  const { limit = 10, page = 1 } = query
  try {
    return await fetchEmails(limit, page)
  } catch (error) {
    returnDirectusQueryError(error, failedToFetchMessage, {
      component: "db.queries",
      operation: "getEmailsQuery",
      collection: "emails",
    })
    return []
  }
}

async function fetchEmailsCount() {
  "use cache"
  cacheTag("emails_count")
  cacheLife("minutes")
  const rows = await directus.request(
    aggregate("emails", {
      aggregate: { count: "*" },
    })
  )
  return parseAggregateCount(rows[0]?.count)
}

export async function getEmailsCountQuery(failedToFetchMessage: string) {
  try {
    return await fetchEmailsCount()
  } catch (error) {
    returnDirectusQueryError(error, failedToFetchMessage, {
      component: "db.queries",
      operation: "getEmailsCountQuery",
      collection: "emails",
    })
    return 0
  }
}

export type EmailsQueryResult = Awaited<ReturnType<typeof getEmailsQuery>>
