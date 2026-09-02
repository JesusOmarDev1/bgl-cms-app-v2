import "server-only"

import type { Query } from "@directus/sdk"
import { readSingleton } from "@directus/sdk"
import { getTranslations } from "next-intl/server"

import directus from "@/config/directus"
import type { Schema } from "@/types/schema"
import type { SiteSettingsType } from "@/types/singletons/site-settings"
import { SITE_SETTINGS_FIELDS } from "./site-settings.fields"

export async function getSiteSettingsQuery() {
  const t = await getTranslations("db.site_settings")

  try {
    return await directus.request(
      readSingleton("site_settings", {
        fields: SITE_SETTINGS_FIELDS,
      } satisfies Query<Schema, SiteSettingsType>)
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

export type SiteSettingsQueryResult = Awaited<
  ReturnType<typeof getSiteSettingsQuery>
>
