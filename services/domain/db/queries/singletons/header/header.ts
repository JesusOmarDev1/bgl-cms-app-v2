import "server-only"

import type { Query } from "@directus/sdk"
import { readSingleton } from "@directus/sdk"
import { getTranslations } from "next-intl/server"

import directus from "@/config/directus"
import { HEADER_FIELDS } from "@/services/domain/db/queries/singletons/header/header.fields"
import type { Schema } from "@/types/schema"
import type { HeaderType } from "@/types/singletons/header"

const HEADER_DEEP = {
  url_links: { _sort: ["sort"] },
  social_links: { _sort: ["sort"] },
} as unknown as Query<Schema, HeaderType>["deep"]

export async function getHeaderQuery() {
  const t = await getTranslations("db.header")

  try {
    return await directus.request(
      readSingleton("header", {
        fields: HEADER_FIELDS as unknown as Query<Schema, HeaderType>["fields"],
        deep: HEADER_DEEP,
      } satisfies Query<Schema, HeaderType>)
    )
  } catch (error) {
    const message =
      error instanceof Error ? error.message : t("failed_to_fetch")

    if (error instanceof Error && error.cause !== undefined) {
      console.error(message, { cause: error.cause })
    } else {
      console.error(message)
    }

    throw error instanceof Error ? error : new Error(message)
  }
}

export type HeaderQueryResult = Awaited<ReturnType<typeof getHeaderQuery>>
