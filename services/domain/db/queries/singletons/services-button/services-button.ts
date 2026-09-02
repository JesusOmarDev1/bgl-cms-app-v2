import "server-only"

import type { Query } from "@directus/sdk"
import { readSingleton } from "@directus/sdk"
import { getTranslations } from "next-intl/server"

import directus from "@/config/directus"
import { SERVICES_BUTTON_FIELDS } from "@/services/domain/db/queries/singletons/services-button/services-button.fields"
import type { Schema } from "@/types/schema"
import type { ServicesButtonType } from "@/types/singletons/services-button"

const SERVICES_BUTTON_DEEP = {
  services: { _sort: ["sort"] },
} as unknown as Query<Schema, ServicesButtonType>["deep"]

export async function getServicesButtonQuery() {
  const t = await getTranslations("db.services_button")

  try {
    return await directus.request(
      readSingleton("services_button", {
        fields: SERVICES_BUTTON_FIELDS as unknown as Query<
          Schema,
          ServicesButtonType
        >["fields"],
        deep: SERVICES_BUTTON_DEEP,
      } satisfies Query<Schema, ServicesButtonType>)
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

export type ServicesButtonQueryResult = Awaited<
  ReturnType<typeof getServicesButtonQuery>
>
