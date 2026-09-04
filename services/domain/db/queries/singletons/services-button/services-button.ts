import "server-only"

import type { Query } from "@directus/sdk"
import { readSingleton } from "@directus/sdk"
import { getTranslations } from "next-intl/server"

import directus from "@/config/directus"
import { logDirectusQueryError } from "@/lib/directus/query-error"
import { SERVICES_BUTTON_FIELDS } from "@/services/domain/db/queries/singletons/services-button/services-button.fields"
import type { Schema } from "@/types/schema"
import type { ServicesButtonType } from "@/types/singletons/services-button"

export async function getServicesButtonQuery() {
  const t = await getTranslations("db.services_button")

  try {
    return await directus.request(
      readSingleton("services_button", {
        fields: SERVICES_BUTTON_FIELDS as unknown as Query<
          Schema,
          ServicesButtonType
        >["fields"],
      } satisfies Query<Schema, ServicesButtonType>)
    )
  } catch (error) {
    const message = t("failed_to_fetch")
    logDirectusQueryError(error, message, {
      component: "db.queries",
      operation: "getServicesButtonQuery",
      collection: "services_button",
    })
    throw error instanceof Error ? error : new Error(message)
  }
}

export type ServicesButtonQueryResult = Awaited<
  ReturnType<typeof getServicesButtonQuery>
>
