import "server-only"

import type { Query } from "@directus/sdk"
import { readSingleton } from "@directus/sdk"
import { getTranslations } from "next-intl/server"

import directus from "@/config/directus"
import { logDirectusQueryError } from "@/lib/directus/query-error"
import { FOOTER_FIELDS } from "@/services/domain/db/queries/singletons/footer/footer.fields"
import type { Schema } from "@/types/schema"
import type { FooterType } from "@/types/singletons/footer"

export async function getFooterQuery() {
  const t = await getTranslations("db.footer")

  try {
    return await directus.request(
      readSingleton("footer", {
        fields: FOOTER_FIELDS as unknown as Query<Schema, FooterType>["fields"],
      } satisfies Query<Schema, FooterType>)
    )
  } catch (error) {
    const message = t("failed_to_fetch")
    logDirectusQueryError(error, message, {
      component: "db.queries",
      operation: "getFooterQuery",
      collection: "footer",
    })
    throw error instanceof Error ? error : new Error(message)
  }
}

export type FooterQueryResult = Awaited<ReturnType<typeof getFooterQuery>>
