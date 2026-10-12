import "server-only"

import type { Query } from "@directus/sdk"
import { readSingleton } from "@directus/sdk"

import directus from "@/config/directus"
import { returnDirectusQueryError } from "@/lib/directus/query-error"
import { WHATSAPP_BUTTON_FIELDS } from "@/services/domain/db/queries/singletons/whatsapp-button/whatsapp-button.fields"
import type { Schema } from "@/types/schema"
import type { WhatsappButtonType } from "@/types/singletons/whatsapp-button"
import { cacheLife, cacheTag } from "next/cache"

async function fetchWhatsappButton() {
  "use cache"
  cacheTag("whatsapp_button")
  cacheLife("hours")
  return directus.request(
    readSingleton("whatsapp_button", {
      fields: WHATSAPP_BUTTON_FIELDS,
    } satisfies Query<Schema, WhatsappButtonType>)
  )
}

export async function getWhatsappButtonQuery(failedToFetchMessage: string) {
  try {
    return await fetchWhatsappButton()
  } catch (error) {
    returnDirectusQueryError(error, failedToFetchMessage, {
      component: "db.queries",
      operation: "getWhatsappButtonQuery",
      collection: "whatsapp_button",
    })
    return null
  }
}

export type WhatsappButtonQueryResult = Awaited<
  ReturnType<typeof getWhatsappButtonQuery>
>
