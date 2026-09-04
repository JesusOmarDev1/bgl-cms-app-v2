import "server-only"

import type { Query } from "@directus/sdk"
import { readSingleton } from "@directus/sdk"
import { getTranslations } from "next-intl/server"

import directus from "@/config/directus"
import { logDirectusQueryError } from "@/lib/directus/query-error"
import { HEADER_FIELDS } from "@/services/domain/db/queries/singletons/header/header.fields"
import type { Schema } from "@/types/schema"
import type { HeaderType } from "@/types/singletons/header"

export async function getHeaderQuery() {
  const t = await getTranslations("db.header")

  try {
    return await directus.request(
      readSingleton("header", {
        fields: HEADER_FIELDS as unknown as Query<Schema, HeaderType>["fields"],
      } satisfies Query<Schema, HeaderType>)
    )
  } catch (error) {
    const message = t("failed_to_fetch")
    logDirectusQueryError(error, message, {
      component: "db.queries",
      operation: "getHeaderQuery",
      collection: "header",
    })
    throw error instanceof Error ? error : new Error(message)
  }
}

export type HeaderQueryResult = Awaited<ReturnType<typeof getHeaderQuery>>
