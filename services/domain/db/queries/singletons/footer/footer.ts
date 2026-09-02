import "server-only"

import type { Query } from "@directus/sdk"
import { readSingleton } from "@directus/sdk"
import { getTranslations } from "next-intl/server"

import directus from "@/config/directus"
import { FOOTER_FIELDS } from "@/services/domain/db/queries/singletons/footer/footer.fields"
import type { Schema } from "@/types/schema"
import type { FooterType } from "@/types/singletons/footer"

const FOOTER_DEEP = {
  url_links: { _sort: ["sort"] },
  social_links: { _sort: ["sort"] },
  phones: { _sort: ["sort"] },
  emails: { _sort: ["sort"] },
} as unknown as Query<Schema, FooterType>["deep"]

export async function getFooterQuery() {
  const t = await getTranslations("db.footer")

  try {
    return await directus.request(
      readSingleton("footer", {
        fields: FOOTER_FIELDS as unknown as Query<Schema, FooterType>["fields"],
        deep: FOOTER_DEEP,
      } satisfies Query<Schema, FooterType>)
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

export type FooterQueryResult = Awaited<ReturnType<typeof getFooterQuery>>
