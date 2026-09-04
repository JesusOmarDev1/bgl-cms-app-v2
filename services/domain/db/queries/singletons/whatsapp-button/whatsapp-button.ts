import "server-only"

import type { Query } from "@directus/sdk"
import { readSingleton } from "@directus/sdk"
import { getTranslations } from "next-intl/server"

import directus from "@/config/directus"
import { logDirectusQueryError } from "@/lib/directus/query-error"
import { WHATSAPP_BUTTON_FIELDS } from "@/services/domain/db/queries/singletons/whatsapp-button/whatsapp-button.fields"
import type { Schema } from "@/types/schema"
import type { WhatsappButtonType } from "@/types/singletons/whatsapp-button"

export async function getWhatsappButtonQuery() {
  const t = await getTranslations("db.whatsapp_button")

  try {
    return await directus.request(
      readSingleton("whatsapp_button", {
        fields: WHATSAPP_BUTTON_FIELDS,
      } satisfies Query<Schema, WhatsappButtonType>)
    )
  } catch (error) {
    const message = t("failed_to_fetch")
    logDirectusQueryError(error, message, {
      component: "db.queries",
      operation: "getWhatsappButtonQuery",
      collection: "whatsapp_button",
    })
    throw error instanceof Error ? error : new Error(message)
  }
}

export type WhatsappButtonQueryResult = Awaited<
  ReturnType<typeof getWhatsappButtonQuery>
>
